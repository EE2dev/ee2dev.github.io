'''
RSVP meetup challenge
sankey example 3b
Reads a csv file
and puts the contents into a list
additionally returns the nodes file
--- python 2.7
'''
import csv
#----------------------------------------------------------------------
def readFile(myFile):
    """
    read file and return list with data 
    """
    exampleFile = open(myFile)
    exampleReader = csv.reader(exampleFile)
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
def addNodes(dict, node, list): 
    """
    stores the node with their frequency list in the dictionary
    """
    if dict.has_key(node) == True:
        dict[node] = [a + b for a, b in zip(dict[node], list)]
    else:
        dict[node] = list
    return dict
#----------------------------------------------------------------------
def createNodeFreqs(nodeFrequencies, numOfStaticFreqs, meetup_no): 
    """
    creates the value for the node dictionary
    """
    mynF = nodeFrequencies[0:numOfStaticFreqs]
    mynF.append(0)
    mynF.append(0)
    if (meetup_no > 1):
        for ele in mynF:
            mynF[numOfStaticFreqs] = nodeFrequencies[(meetup_no) * 2 - 1]
            mynF[numOfStaticFreqs + 1] = nodeFrequencies[(meetup_no) * 2]
    return mynF
#----------------------------------------------------------------------
def transformDataToSankeyNodesFormat(originalData):
    """
     transform data to sankey nodes file format
    """
    dict = {}
    numOfMeetups = 3
    numOfStaticFreqs = 3
    indexFreqMeetup2 = numOfMeetups + numOfStaticFreqs # index of freq for specific meetups
    output = [['sourceX','sourceY','member group','intro','photo','from Munich', 'visit 14dbm', 'visit 7dbm']] # add the new first row
    #originalData.pop(0) # remove first row - has been removed already
    changeName = {'RYN' : 'responded but did not show up',
                   '-' : 'did not respond',
                   'RN' : 'responded No',
                   'RYS' : 'responded and showed up'}
    
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
                            addNodes(dict, node + ('members since meetup ' + str(firstMeetup),), mynF)
                            addNodes(dict, node + ("all members",), mynF)
                            
                            node = ('meetup'+ str(i), changeName[attendence])
                            mynF = createNodeFreqs(nodeFrequencies, numOfStaticFreqs, i)
                            addNodes(dict, node + ('members since meetup ' + str(firstMeetup),), mynF)
                            addNodes(dict, node + ("all members",), mynF)                            
                        else:
                            node = ('meetup'+ str(i-1), 'joined meetup group')
                            mynF = createNodeFreqs(nodeFrequencies, numOfStaticFreqs, 0)
                            addNodes(dict, node + ('members since meetup ' + str(firstMeetup),), mynF)
                            addNodes(dict, node + ("all members",), mynF)
                            
                            node = ('meetup'+ str(i), changeName[attendence])
                            mynF = createNodeFreqs(nodeFrequencies, numOfStaticFreqs, i)
                            addNodes(dict, node + ('members since meetup ' + str(firstMeetup),), mynF)
                            addNodes(dict, node + ("all members",), mynF)
                            
                    else: # not first possible meetup
                        node = ('meetup'+ str(i), changeName[attendence])
                        mynF = createNodeFreqs(nodeFrequencies, numOfStaticFreqs, i)
                        addNodes(dict, node + ('members since meetup ' + str(firstMeetup),), mynF)
                        addNodes(dict, node + ("all members",), mynF)
                
                previousAttendence = attendence
    
    for key, value in dict.items(): # construct final list
        outputRecord = []
        for item in key:
            outputRecord.append(item)
        for item in value:
            outputRecord.append(item)
        output.append(outputRecord)
        
    printOutput(output) 
    return output
#----------------------------------------------------------------------
def transformDataToSankeyFormat(originalData):
    """
     transform data to sankey file format
    """
    dict = {}
    output = [['value','sourceX','sourceY','targetX','targetY','member group']] # add the new first row
    originalData.pop(0) # remove first row  
    changeName = {'RYN' : 'responded but did not show up',
                   '-' : 'did not respond',
                   'RN' : 'responded No',
                   'RYS' : 'responded and showed up'}
    
    for row in originalData: # count frequencies for each path
        previousAttendence = 'x'
        firstMeetup = 0
        sequence = ()
        for i, attendence in enumerate(row):  
            if i > 0 and i < 4:
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
                    dict = addSequence(dict, sequence + ('members since meetup ' + str(firstMeetup),))
                    dict = addSequence(dict, sequence + ("all members",))
                
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
    originalData = readFile('sankey/meetup_sankey12.csv')
    print originalData
    
    data = transformDataToSankeyFormat(originalData)
    print "nodes"
    data2 = transformDataToSankeyNodesFormat(originalData)
    
    outputPath = "sankey/meetup_sankey_11.csv"
    writeFile(data, outputPath)  
    
    outputPath = "sankey/meetup_sankey_11_nodes.csv"
    writeFile(data2, outputPath)  
    