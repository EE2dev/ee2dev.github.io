pt.example4_output = pt.example4_output || {};

pt.example4_output.init = function() {
      var meetupGroups = ["Big Data", "Big Data Developers", "Streaming Big Data"];
      display(meetupGroups);
      meetupGroups.push("Data Visualization in Munich Meetup"); // adding this meetup to the array
      display(meetupGroups);  
      
      function display(mydata){
        var anchor = d3.select("div#ex4");
        
        var selection = anchor.selectAll("p")
          .data(mydata);
          
        selection.text(function (d) { return d + " - updated";}); // update selection
        
        selection.enter() // enter selection
          .append("p")
          .text(function (d) { return d + " - entered";});
          
        selection.exit() // exit selection
          .remove();
		  
      }   
}