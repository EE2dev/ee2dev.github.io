pt.example3_output = pt.example3_output || {};

pt.example3_output.init = function() {
      var meetupGroups = ["Big Data", "Big Data Developers", "Streaming Big Data"];
      
      function display(mydata){
        var anchor = d3.select("div#ex3");
        
        var selection = anchor.selectAll("p")
          .data(mydata);
          
        selection.text(function (d) { return d + " - updated";}); // update selection
        
        selection.enter() // enter selection
          .append("p")
          .text(function (d) { return d + " - entered";});
          
        selection.exit() // exit selection
          .remove();
		  
      }
      
      display(meetupGroups);        
}