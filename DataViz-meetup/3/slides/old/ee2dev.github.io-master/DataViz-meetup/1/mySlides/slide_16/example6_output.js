pt.example6_output = pt.example6_output || {};

pt.example6_output.init = function() {
      var meetupGroups = ["Big Data", "Big Data Developers", "Streaming Big Data"];      
      display(meetupGroups);  
      
      function display(mydata){
        var anchor = d3.select("svg#ex6");
        
        var selection = anchor.selectAll("circle")
          .data(mydata);
          
        selection.style("fill", "orange"); // update selection
        
        selection.enter() // enter selection
          .append("circle")
          .attr("cx", function (d, i) { return (i + 1) * 150;})
          .attr("cy", 300)
          .attr("r", 0)
          .style("fill", "white")
          .transition()
          .delay( function(d, i) { return i * 1000;} )
          .duration(3000)
          .attr("r", 50)
          .style("fill", "steelblue");
          
        selection.exit() // exit selection
          .remove();
      }    
}