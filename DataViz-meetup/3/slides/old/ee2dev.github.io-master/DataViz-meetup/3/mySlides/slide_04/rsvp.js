pt.rsvp = pt.rsvp || {};

pt.rsvp.init = function() {

// set the dimensions and margins of the graph
var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = 800 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

// set the ranges
var x = d3.scaleBand()
          .range([0, 200])
          .padding(0.1);
var y = d3.scaleLinear()
          .range([height, 0]);
          
// append the svg object to the body of the page
// append a 'group' element to 'svg'
// moves the 'group' element to the top left margin
var svg = d3.select("div.RSVPGraph").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
	.attr("class", "rsvp")
    .attr("transform", 
          "translate(" + margin.left + "," + margin.top + ")");

var data = [{"number": 140, "meetup": "1st Meetup"}, {"number": 140, "meetup": "1st Meetup"}];

// format the data
data.forEach(function(d) {
d.number = +d.number;
});

console.log(data);
// Scale the range of the data in the domains
x.domain(data.map(function(d) { return d.meetup; }));
y.domain([0, d3.max(data, function(d) { return d.number; })]);

console.log("height: " + height);
console.log("y(66): " + y(66));

// append the rectangles for the bar chart
svg.selectAll(".bar")
  .data(data)
.enter().append("rect")
  .attr("class", "bar")
  .attr("x", function(d) { return x(d.meetup); })
  .attr("width", x.bandwidth())
  // .attr("width", function(d, i) { return (i === 0) ? x.bandwidth() : x.bandwidth() - 4})
  .attr("y", function(d) { return y(0); })
  .attr("height", 0)
  .style("fill", function(d, i) { return (i === 0) ? "steelblue" : "none"})
  /*
  .style("fill", function(d, i) { return (i === 0) ? "steelblue" : "none"})
  .style("stroke-width", "2px")
  .style("stroke", "steelblue")
  .style("stroke-dasharray", "10 5") */
  //.on("click", update)
  .transition()
  .duration(4000)
  .attr("y", function(d) { return y(d.number); })
  .attr("height", function(d) { return height - y(d.number); });
  
svg.append("line")
	.attr("class", "topline")
	.attr("x1", 180)
	.attr("y1", 1)
	.attr("x2", 300)
	.attr("y2", 1)
	.style("stroke", "steelblue")
	//.style("stroke-dasharray", "5 5")
	.style("opacity", 0)
	.transition()
	.delay(4000)
	.style("opacity", 1);  
	
svg.append("line")
	.attr("class", "connectline")
	.attr("x1", 240)
	.attr("y1", 1)
	.attr("x2", 240)
	.attr("y2", 1)
	.style("stroke", "steelblue")
	.style("stroke-dasharray", "5 5");
	
svg.append("text")
	.attr("x", 305)
	.attr("y", 1)
	.attr("dy", "0.35em")
	.text("140 people RSVP'ed")
	.style("fill", "steelblue")
	.style("opacity", 0)
	.transition()
	.delay(4000)
	.style("opacity", 1);  	

// add the x Axis
svg.append("g")
  .attr("transform", "translate(0," + height + ")")
  .call(d3.axisBottom(x));

// add the y Axis
svg.append("g")
  .call(d3.axisLeft(y));
}
  
pt.rsvp.update = function() {
	
	var svg = d3.select("g.rsvp");
	console.log("next");
	d3.select("rect.bar")
	  .transition()
	  .duration(4000)
	  .attr("y", function(d) { return 238; })
	  .attr("height", function(d) { return 450 - 238; });
	  
	d3.select("line.connectline")
		.transition()
		.duration(4000)
		.attr("y2", 238);

svg.append("text")
	.attr("x", 305)
	.attr("y", 120)
	.attr("dy", "0.35em")
	.text("74 people didn't show up")
	.style("fill", "red")
	.style("font-weight", "bold")
	.style("opacity", 0)
	.transition()
		.delay(4000)
		.style("opacity", 1);  	
		 
	svg.append("line")
	.attr("x1", 180)
	.attr("y1", 239)
	.attr("x2", 300)
	.attr("y2", 239)
	.style("stroke", "steelblue")
	.style("opacity", 0)
	.transition()
	.delay(4000)
	.style("opacity", 1);  
	
svg.append("text")
	.attr("x", 305)
	.attr("y", 239)
	.attr("dy", "0.35em")
	.text("66 people actually attended")
	.style("fill", "steelblue")
	.style("opacity", 0)
	.transition()
	.delay(4000)
	.style("opacity", 1);  	

}