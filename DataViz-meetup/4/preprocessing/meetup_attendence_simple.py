'''
RSVP meetup challenge
sankey example 3
Reads a csv file
and puts the contents into a list
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
            if i != 0:
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
    
    print "--------------------"
    for record in output:
        print record  
    print len(output)
    return output            
#----------------------------------------------------------------------
if __name__ == "__main__":
    originalData = readFile('sankey/meetup_original.csv')
    print originalData
    
    data = transformDataToSankeyFormat(originalData)
    
    outputPath = "sankey/meetup_sankey10.csv"
    writeFile(data, outputPath)  
    