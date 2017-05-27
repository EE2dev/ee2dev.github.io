'''
--- python 2.7 ---
RSVP analysis für meetups 1-4 - matrix version with columns to different responders
Reads a csv file
and puts the contents into a list
additionally returns the nodes file
'''
import csv
#----------------------------------------------------------------------
def readFile(myFile):
    """
    read file and return list with data 
    """
    exampleFile = open(myFile)
    exampleReader = csv.reader(exampleFile, delimiter=';')
    return list(exampleReader)
#----------------------------------------------------------------------
def writeFile(data, outputPath):
    """
    write data to a CSV file path
    """
    with open(outputPath, "wb") as csv_file:
        writer = csv.writer(csv_file, delimiter=',')
        for line in data:
            writer.writerow(line)
#----------------------------------------------------------------------
def printOutput(output):
    """
    print output for debugging
    """
    print "--------------------"
    for record in output:
        print record  
    print len(output)
#----------------------------------------------------------------------
def addSequence(dict, sequence): 
    """
    stores the sequences with their frequency in the dictionary
    """
    if dict.has_key(sequence) == True:
        dict[sequence] = dict[sequence] + 1
    else:
        dict[sequence] = 1
    return dict
#----------------------------------------------------------------------
def addNodes(dict, node, list, respList): 
    """
    stores the node with their frequency list in the dictionary
    """
    #add node for corresponding responder type if applicable
    responder = getResponder(respList)
    if (responder != responders[3]):
        node1 = node + (responder,)
        if dict.has_key(node1) == True:
            dict[node1] = [a + b for a, b in zip(dict[node1], list)]
        else:
            dict[node1] = list
    
    #add node for all responders
    node2 = node + (responders[3],) 
    if dict.has_key(node2) == True:
        dict[node2] = [a + b for a, b in zip(dict[node2], list)]
    else:
        dict[node2] = list
        
    return dict
#----------------------------------------------------------------------
def getResponder(list): 
    """
    returns the responder
    """
    if list[0] == '1':
        resp = responders[0]
    elif list[1] == '1':
        resp = responders[1] 
    elif list[2] == '1':
        resp = responders[2]  
    else:
        resp = responders[3]
    return resp
#----------------------------------------------------------------------
def createNodeFreqs(nodeFrequencies, numOfStaticFreqs, meetup_no): 
    """
    creates the value for the node dictionary
    """
    mynF = nodeFrequencies[0:numOfStaticFreqs]
    """
    mynF.append(0)
    mynF.append(0)
    mynF.append(0)
    if (meetup_no > 3):
        for ele in mynF:
            mynF[numOfStaticFreqs] = nodeFrequencies[numOfStaticFreqs]
            mynF[numOfStaticFreqs + 1] = nodeFrequencies[numOfStaticFreqs + 1]
            mynF[numOfStaticFreqs + 2] = nodeFrequencies[numOfStaticFreqs + 2]
    """
    return mynF
#----------------------------------------------------------------------
def transformDataToSankeyNodesFormat(originalData, numOfMeetups):
    """
     transform data to sankey nodes file format
    """
    dict = {}
    numOfStaticFreqs = 3 # freq which equally apply to all nodes (intro, photo and from Munich)
    
    for row in originalData: # count frequencies for each path
        previousAttendence = 'x'
        firstMeetup = 0
        sequence = ()
        node = ()
        nodeFrequencies = []
        #print "row"
        #print row
        for i, attendence in enumerate(row):
            if i == 0:
                for freqs in row[(numOfMeetups+1):]:    
                    nodeFrequencies.append(int(freqs))
                #print 'nodeFrequencies'
                #print nodeFrequencies
            elif i > 0 and i <= numOfMeetups:
                if attendence != 'x':
                    if previousAttendence == 'x': #this is first possible meetup
                        if firstMeetup == 0:
                            firstMeetup = i
                        if firstMeetup == 1:
                            node = ('before meetup1', 'joined meetup group')
                            mynF = createNodeFreqs(nodeFrequencies, numOfStaticFreqs, 0)
                            addNodes(dict, node + ('members since meetup ' + str(firstMeetup),), mynF, row[-3:])
                            addNodes(dict, node + ("all members",), mynF, row[-3:])
                            
                            node = ('meetup'+ str(i), changeName[attendence])
                            mynF = createNodeFreqs(nodeFrequencies, numOfStaticFreqs, i)
                            addNodes(dict, node + ('members since meetup ' + str(firstMeetup),), mynF, row[-3:])
                            addNodes(dict, node + ("all members",), mynF, row[-3:])                            
                        else:
                            node = ('meetup'+ str(i-1), 'joined meetup group')
                            mynF = createNodeFreqs(nodeFrequencies, numOfStaticFreqs, 0)
                            addNodes(dict, node + ('members since meetup ' + str(firstMeetup),), mynF, row[-3:])
                            addNodes(dict, node + ("all members",), mynF, row[-3:])
                            
                            node = ('meetup'+ str(i), changeName[attendence])
                            mynF = createNodeFreqs(nodeFrequencies, numOfStaticFreqs, i)
                            addNodes(dict, node + ('members since meetup ' + str(firstMeetup),), mynF, row[-3:])
                            addNodes(dict, node + ("all members",), mynF, row[-3:])
                            
                    else: # not first possible meetup
                        node = ('meetup'+ str(i), changeName[attendence])
                        mynF = createNodeFreqs(nodeFrequencies, numOfStaticFreqs, i)
                        addNodes(dict, node + ('members since meetup ' + str(firstMeetup),), mynF, row[-3:])
                        addNodes(dict, node + ("all members",), mynF, row[-3:])
                
                previousAttendence = attendence
    
    for key, value in dict.items(): # construct final list
        outputRecord = []
        for item in key:
            outputRecord.append(item)
        for item in value:
            outputRecord.append(item)
        outputNodes.append(outputRecord)
        
    printOutput(outputNodes) 
    return outputNodes
#----------------------------------------------------------------------
def transformDataToSankeyFormat(originalData, numOfMeetups):
    """
     transform data to sankey file format
    """
    dict = {}
    originalData.pop(0) # remove first row  
    
    for row in originalData: # count frequencies for each path
        previousAttendence = 'x'
        firstMeetup = 0
        sequence = ()
        for i, attendence in enumerate(row):  
            if i > 0 and i < numOfMeetups + 1:
                if attendence != 'x':
                    if previousAttendence == 'x': #this is first possible meetup
                        if firstMeetup == 0:
                            firstMeetup = i
                        if firstMeetup == 1:
                            sequence = ('before meetup1', 'joined meetup group', 'meetup'+ str(i), changeName[attendence])
                        else:
                            sequence = ('meetup'+ str(i-1), 'joined meetup group', 'meetup'+ str(i), changeName[attendence])                            
                    else: # not first possible meetup
                        sequence = ('meetup' + str(i-1), changeName[previousAttendence], 'meetup'+ str(i), changeName[attendence])

                if len(sequence) >= 1:
                    responder = getResponder(row[-3:]) # get String from the last 3 elements of row
                    if (responder != responders[3]):
                        dict = addSequence(dict, sequence + ('members since meetup ' + str(firstMeetup),) + (responder,))
                        dict = addSequence(dict, sequence + ("all members",) + (responder,))
                    dict = addSequence(dict, sequence + ('members since meetup ' + str(firstMeetup),) + (responders[3],))
                    dict = addSequence(dict, sequence + ("all members",) + (responders[3],))
                
                previousAttendence = attendence
                
    for p, f in dict.items(): # construct final list
        outputRecord = []
        outputRecord.append(f)
        for item in p:
            outputRecord.append(item)
        output.append(outputRecord)
    
    printOutput(output)
    return output
#----------------------------------------------------------------------
if __name__ == "__main__":
    # initialize options
    myFile = 'sankey4/sankey_1234.csv'
    outputPath = "sankey4/sankey_1234f.csv"
    outputNodesPath = "sankey4/sankey_1234f_nodes.csv"
    
    numberOfMeetups = 4
    output = [['value','sourceX','sourceY','targetX','targetY','member group', 'responder type']] # add the new first row
    changeName = {'RYN' : 'responded but did not show up',
               '-' : 'did not respond',
               'RN' : 'responded No',
               'RYS' : 'responded and showed up'}
    responders = ['early responders', 'normal responders', 'very late responders', 'all responders']
    outputNodes = [['sourceX','sourceY','member group','responder type', 'intro','photo','from Munich']] # add the new first row
    # end options
    
    originalData = readFile(myFile)
    print originalData
    
    data = transformDataToSankeyFormat(originalData, numberOfMeetups)
    print "nodes"
    data2 = transformDataToSankeyNodesFormat(originalData, numberOfMeetups)
    
    writeFile(data, outputPath)  
    writeFile(data2, outputNodesPath)  
    