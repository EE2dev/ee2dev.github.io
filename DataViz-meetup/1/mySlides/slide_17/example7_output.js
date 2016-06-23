pt.example7_output = pt.example7_output || {};

pt.example7_output.init = function() {
      var meetupGroupSizes = [1943, 1073, 297];
      display(meetupGroupSizes);
	  
      function display(mydata){
        var anchor = d3.select("svg#ex7");
	  
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
          .attr("r", function(d) { return Math.sqrt(d);})
          .style("fill", "steelblue");
          
        selection.exit() // exit selection
          .remove();
      }    
}