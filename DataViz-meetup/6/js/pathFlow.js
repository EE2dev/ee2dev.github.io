////////////////////////
// 1 options
////////////////////////
// 1.1 global options
var checkResolution = false; // flag for checking resolution before the start
var debug = false; // for debug output
var margin = {top: 10, right: 10, bottom: 10, left: 10};
var width = window.innerWidth - margin.left - margin.right;
var height = window.innerHeight - margin.top - margin.bottom;

// 1.2 options for headers
var header = {};
  header.text = "Welcome to the sixth Data Visualization in Munich meetup"; // string for header
  header.fontsize = 40;
  header.yTranslate = 100; // y-translate header by this amount of pixels

var header2 = {};
  header2.text = "with"; // string for header
  header2.fontsize = 40;
  header2.yTranslate = 200; // y-translate header by this amount of pixels

var headerArray = [];
  headerArray.push(header);
  headerArray.push(header2);

// 1.2 options for particle app
var app; // the main class in stars.js to create the particles
var starOptions = {
  view: document.querySelector("#view"),
  texture: document.querySelector("#star-texture-white"),
  frames: createFrames(5, 80, 80),
  maxParticles: 2000,
  backgroundColor: "#111111",
  blendMode: "lighter",
  filterBlur: 50,
  filterContrast: 300,
  useBlurFilter: true,
  useContrastFilter: true
}

// 1.4 options for text animation on paths
var animation = {};
  animation.yTranslate = 300; // y-translate animation by this amount of pixels  
  animation.spacing = [0,15,10,10,-10,-20,0,-10,0,-10,-15,5,0];
  animation.color = d3.scaleOrdinal(d3.schemeCategory10);
  animation.width = 630; // hack: fixed width!
  animation.elements = []; // array of animation (text) elements

var interrupt_flag; // flag for restarting whole animation after text animation finishes
var delay = []; // for the animation

// doublecheck resolution for projection before start
if (checkResolution) {alert("width: " + window.innerWidth + " height: " + window.innerHeight);}

// 2 - append the main svg object to the body of the page
var svg = d3.select("div.chart").append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .attr("class", "sankey");

var svg = svg.append("g")
  .attr("class", "anchor")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// 3 - initialize paths and text
initializeHeader(svg, headerArray);
initializePaths(svg);

// prepare text for paths
var myText1 = {};
myText1.name = "Nadieh";
myText1.duration = (isMobileDevice()) ? 2000 : 3000;
myText1.pathArray = [];
myText1.pathArray.push(d3.select("path.number5"));
myText1.pathArray.push(d3.select("path.number3"));
myText1.pathArray.push(d3.select("path.number1"));
myText1.pathArray.push(d3.select("path.number0"));

myText1.dyArray = [-25, 0, 0, -25];
// myText1.dyArray = [0, 0, 0, 0];
myText1.spacing = [0,70,50,70,0,-20];
var transInfo1 = getTransitionInfo(myText1, true);

var myText2 = {};
myText2.name = "Bremer";
myText2.duration = (isMobileDevice()) ? 2000 : 3053;
// myText2.duration = (isMobileDevice()) ? 2000 : 3000;
myText2.pathArray = [];
myText2.pathArray.push(d3.select("path.number5"));
myText2.pathArray.push(d3.select("path.number4"));
myText2.pathArray.push(d3.select("path.number2"));
myText2.pathArray.push(d3.select("path.number0"));
myText2.dyArray = [25, 0, 0, 25];
// myText2.dyArray = [0, 0, 0, 0];
myText2.spacing = [0,50,0,0,90,50];
var transInfo2 = getTransitionInfo(myText2, true);

var explosiveTextArray = [];
explosiveTextArray.push(myText1);
explosiveTextArray.push(myText2);
explosiveTextArray.fontsize = header.fontsize * 2;

initializeExplosiveText(svg, explosiveTextArray);
initializeAnimationText();

// 4 - start animation
startAnimation();


// add header(s)
function initializeHeader(svg, headerArray) {
  var sel = svg.selectAll("g.header")
    .data(headerArray)
    .enter()
    .append("g")
    .attr("class", function(d,i) { return "header hidden " + "h" + i;})
    .append("text")
    .text(function(d) { return d.text;})
    .attr("dy", 10)
    .style("font-size", function(d) { return d.fontsize;});
  
  d3.selectAll("g.header")
    .each(function(d,i) {
      var bBox = d3.select(this).node().getBoundingClientRect();
      d.width = bBox.width;
      d.transX = (width - bBox.width) / 2;
      d.transY = d.yTranslate;
    })
    .attr("transform", function(d) { return "translate(" + d.transX + ", "+ d.transY +")";});
  
  d3.selectAll("g.header")
    .append("path")
    .attr("class", function(d,i) { return "header hidden " + "h" + i;})
    .attr("d", function(d) {
      var str =  "M" + d.transX + ", " + d.transY  + " L" + (d.width + d.transX) + ", " + d.transY;
      return str;
    });
}

// create paths in this case by intitializing a sankey diagram
function initializePaths(svg) {
  svg = svg.append("g")
    .attr("class", "animation")
    .attr("transform", "translate(0, " + animation.yTranslate + ")");

  // set the sankey diagram properties
  var sankey = d3.sankey()
  .nodeWidth(30)
  .nodePadding(100)
  .size([width, 200]);

  var path = sankey.link();
  var lCounter = 0;

  graph = {
    "nodes":[
    {"node":0,"name":"node1"},
    {"node":1,"name":"node2"},
    {"node":2,"name":"node3"},
    {"node":3,"name":"node4"},
    {"node":4,"name":"node5"},
    {"node":5,"name":"node6"}
    ],
    "links":[
    {"source":0,"target":1,"value":8},
    {"source":1,"target":2,"value":4},
    {"source":1,"target":3,"value":4},
    {"source":2,"target":4,"value":4},
    {"source":3,"target":4,"value":4},
    {"source":4,"target":5,"value":8}
    ]};

    sankey
      .nodes(graph.nodes)
      .links(graph.links)
      .layout(32);

    // add in the links
    var link = svg.append("g").attr("class", "paths").selectAll(".link")
      .data(graph.links)
    .enter().append("path")
      .attr("class", function(d,i) { return "link number" + i;})
      .attr("d", path)
      .style("stroke-width", function(d) { return Math.max(1, d.dy); });
        
    // add in the nodes
    var node = svg.append("g").selectAll(".node")
      .data(graph.nodes)
    .enter().append("g")
      .attr("class", "node")
      .attr("transform", function(d) { 
          return "translate(" + d.x + "," + d.y + ")"; });

    // add the rectangles for the nodes
    node.append("rect")
      .attr("height", function(d) { return d.dy; })
      .attr("width", sankey.nodeWidth());
  }

  function initializeExplosiveText(svg, explosiveTextArray) {
    // add header
    var animText = explosiveTextArray[0].name + " " + explosiveTextArray[1].name;
    var sel = d3.select("g.anchor")
      .append("g")
      .attr("class", "explosiveText")
      .selectAll("g.explosiveText")
      .data(animText)
      .enter()
      .append("text")
      .attr("class", "hidden")
      .text(function(d) { return d;})
      .attr("dy", 20)
      .style("font-size", 80)
      .attr("transform", function(d,i) {
        var offset = window.innerWidth / 2 - animation.width / 2;
        var trans = "translate(";
        trans += offset + (i * 50 + animation.spacing[i]);
        trans += ", "+ animation.yTranslate + ")";
        return trans;
      });
  }  

  function initializeAnimationText() {
    var svg = d3.select("g.animation");
    // initialize text elements for path transitions
    var textElement1 = svg.selectAll("text.text1")
    .data(transInfo1)
    .enter()
    .append("text")
    .attr("class", "text1")
    .text(function(d) { return d.letter;})
    //.attr("dy", 5)
    .style("font-size", 40)
    .attr("transform", "translate(-100, -100)");
  
    var textElement2 = svg.selectAll("text.text2")
    .data(transInfo2)
    .enter()
    .append("text")
    .attr("class", "text2")
    .text(function(d) { return d.letter;})
    //.attr("dy", 5) 
    .style("font-size", 40)
    .attr("transform", "translate(-100, -100)");  
  
    animation.elements.push(textElement1);
    animation.elements.push(textElement2);
  }

  ////////////////////////////////////////////
  //  Main Animation Function ////////////////
  ////////////////////////////////////////////
  function startAnimation(){
    // initialize
    d3.selectAll("g.header").classed("hidden", true);
    interrupt_flag = false;

    // 0 start stars engine
    app = setupStars();

    // 1 animate header
    animateHeader(0); 

    // 2 animate animationText
    setTimeout (function () {
      app.setActivate(false);
      app = setupStars();
      app.setTexture(document.querySelector("#star-texture"));
      var offset = window.innerWidth / 2 - animation.width / 2;
      d3.selectAll("g.explosiveText text").classed("hidden", false);
      d3.selectAll("g.explosiveText text")
        .transition()
        .duration(500)
        .style("fill", function(d,i) { return animation.color(i);})
        .transition()
        .duration(5000)
        .style("fill", "#111111")
        .on("end", hideElement);
        //.on("end", removeText);

      for (x = offset; x < offset + animation.width; x = x + 1) { 
        app.spawn(x, animation.yTranslate);
      }
    }, 7600);

    // 3 - transition text elements
    setTimeout (function () {
      app.setActivate(false);
      transitionOnPaths(animation.elements[0]);
      transitionOnPaths(animation.elements[1]);
    }, 15000);
  }

  function resetAnimation() {
    // app = setupStars();
    app.setTexture(document.querySelector("#star-texture-white"));
    app.setActivate(true);
  }

  function hideElement() { // for 1 + 2 animate animationText
    d3.select(this).classed("hidden", true);
  }
  

  /////////////////////////////////////////////////////
  // 1 - animates through the array of headers
  /////////////////////////////////////////////////////
  function animateHeader(_index){
    console.log("animate Header: " + _index);
    if (_index >= headerArray.length) {       
      return; 
    }
    var trans = d3.select("g.header.h" + _index + " text")
      .transition()
      .duration(function(d){ 
        var thisDuration = d.text.length * 60;
        if (delay.length === 0) { delay.push(thisDuration); }
        else { delay.push(delay[delay.length-1] + thisDuration); }
        return thisDuration; }
        )
      .delay(function(d,i) {
        var thisDelay;
        if (i === 0) { thisDelay = 3000;}
        else { thisDelay = headerArray[i-1].text.length * 60; } // this hack just works for 2 elements
        delay[delay.length-1] += thisDelay;
        return thisDelay;
      })
      .on("start", function repeat() {
        d3.select("g.header.h" + _index).classed("hidden", false);
        d3.active(this)
          .attrTween("transform", starsAlongPath(d3.select("path.header.h" + _index).node()))
          .style("fill", "lightgrey") 
          .transition()
            .duration(0)
            .delay(0)
            .style("fill", "white")
          .transition()
            .on("start", animateHeader(_index + 1));
      });
  }
 
  function starsAlongPath(path) {
    var l = path.getTotalLength();
    return function(d, i, a) {
      return function(t) {
        var p = path.getPointAtLength(t * l);
        app.spawn(p.x , p.y + margin.top);
        return "translate(0,0)";
      };
    };
  }

  function setupStars() {
    app = new App(starOptions);
    window.addEventListener("load", app.start());
    window.focus();
    log("APP", app);
    return app;
  }

  function transitionOnPaths(_textElements) {
    interrupt_flag = true;

    _textElements
      .classed("hidden", false)
      .each(function(d) {
        d.pathCounter = d.pathArray.length -1; 
        d.loop = 0;
      })
      .style("font-size", "40px")
      .transition()
      .ease(d3.easeLinear)
      .duration(function(d) { return d.pathDuration[d.pathCounter];})
      .delay(function(d, i) { return i * 250 + d.spacing;})
      .on("start", function repeat(d, i) {
        d.pathCounter = (d.pathCounter + 1) % d.pathArray.length;
        if (d.pathCounter % d.pathArray.length === 0) { d.loop += 1;}
        d3.active(this)
          .duration(function(d) { return d.pathDuration[d.pathCounter];})
          .each(transitionOptions)
          .transition()
          .on("start", repeat);
      });
  }

  function transitionOptions (d, i){
    if (debug) {
      console.log("d.loop: " + d.loop); 
      console.log("d.pathCounter: " + d.pathCounter); 
    }
    d3.active(this).attrTween("transform", translateAlong());
    // begin
    if (d.loop === 1 && d.pathCounter === 0) { 
      d3.active(this).style("fill", animation.color(d.index));
      if (debug) {console.log("start");}
    } 
    // end
      if (d.loop === 7 && d.pathCounter === 6){ 
      interrupt_flag = true;
      d3.selectAll("g.header text")
        .transition()
        .duration(1500)
        .style("fill", "#111111");

      d3.active(this)
      .style("fill", "#111111")
      .on("end", endTransition);
    } 

    if (debug) {
      console.log("d.loop: " + d.loop);
      console.log("d.loop cond: " + (d.loop % 4 !== 0));
    }

    switch(d.loop % 8) {
      case 2:            
        if (d.name === "Nadieh") {     
          if (d.pathCounter === 1) { d3.active(this).style("font-size", "0px");}
          else if (d.pathCounter === 2) { d3.active(this).style("font-size", "70px");}
          else if (d.pathCounter === 4) { d3.active(this).style("font-size", "40px");}   
          
          d.pathDuration = d.pathDuration2;
        }
        break;
      case 3:
        if (d.name === "Bremer") {               
          d.dyArray = d.dyArray2;
        }
        break;
      case 4:
        if (d.name === "Nadieh") {               
          d.dyArray = d.dyArray2;
        }

        if (d.name === "Bremer") {     
          if (d.pathCounter === 1) { d3.active(this).style("font-size", "0px");}
          else if (d.pathCounter === 2) { d3.active(this).style("font-size", "70px");}
          else if (d.pathCounter === 4) { d3.active(this).style("font-size", "40px");}   
          
          d.dyArray = d.dyArrayTemp;
          d.pathDuration = d.pathDuration2;
        }
        break;
      case 5:            
        if ((d.name === "Nadieh") && (d.pathCounter === 2)) {               
          d.dyArray = d.dyArrayTemp;
          d.pathDuration = d.pathDurationTemp;
        }
        break;  

      case 7:            
        if ((d.name === "Bremer") && (d.pathCounter === 2)) {               
          d.dyArray = d.dyArrayTemp;
          d.pathDuration = d.pathDurationTemp;
        }
        break; 
    }
  }

  function endTransition() { // for 4
    d3.select(this).classed("hidden", true).interrupt();
    if (interrupt_flag) {
      interrupt_flag = false;
      console.log("restart");
      setTimeout (function(){
        resetAnimation();
        startAnimation();
      }, 10000);
    }
  }

  // from http://bl.ocks.org/bycoffe/c3849a0b15234d7e32fc
  var direction = -1;
  var atLength = 0;

  function translateAlong() {
    return function(d, i, a) {
      var path = d.pathArray[d.pathCounter];
      var l = path.getTotalLength();
      var dy = d.dyArray[d.pathCounter];
      return function(t) { 
        atLength = direction === 1 ? (t * l) : (l - (t * l));
        var p1 = path.getPointAtLength(atLength),
            p2 = path.getPointAtLength((atLength)+direction),
            angle = Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI;
            angle = angle - 180;
        return "translate(" + p1.x + "," + (p1.y + dy) + ")rotate(" + angle + ")";
      }
    }
  }

  /*
  / _text: text object
  / connect: true if paths need to be connected 
  / dyArray: array of vertical translations (per path)
  */
  function getTransitionInfo(_text, connect){
  var tArray = [];
  var duration = [];
  var duration2 = []; 
  var dyArray2 = [];
  var max = -1;

  if (!_text.dyArray) {
    _text.dyArray = [];
    for (var i = 0; i < _text.pathArray.length; i++) {
      _text.dyArray[i] = 0;
    }
  }

  // add connecting paths to the existing paths  + fill up dyArray with 0's for connections
  if (connect) {
    for (var i = 0; i < _text.pathArray.length - 1; i = i + 2){
      _text.pathArray.splice(i + 1, 0, connectPaths(_text.pathArray[i], _text.pathArray[i+1], _text.dyArray[i], _text.dyArray[i+1]));
      _text.dyArray.splice(i + 1, 0, 0);
    }
  } // update pathArray with corresponding elements
  _text.pathArray.forEach(function(sel, i, arr){
    arr[i] = sel.node();
  });

  for (var i = 0; i < _text.pathArray.length; i++) {
    dyArray2[i] = 0;
  }

  // calculate duration
  _text.pathArray.forEach(function(path){
    duration.push(path.getTotalLength()); 
    max = path.getTotalLength() > max ? path.getTotalLength() : max;
  });
  var sumDuration = 0;
  var sumDuration2 = 0;
  var durationFactor = 0.5; //0.666;
  duration.forEach(function(d, i, arr){
    arr[i] = d/max * _text.duration;
    sumDuration += arr[i];
  });
  duration.forEach(function(d){
    duration2.push(d * durationFactor);
  })
  sumDuration2 = sumDuration * durationFactor;

  for (var i = 0; i < _text.name.length; i++) { 
    var tInfo = {}; 
    tInfo.pathArray = _text.pathArray;
    tInfo.dyArray = _text.dyArray;
    tInfo.dyArrayTemp = _text.dyArray;
    tInfo.dyArray2 = dyArray2;
    tInfo.pathDuration = duration;
    tInfo.pathDurationTemp = duration;
    tInfo.pathDuration2 = duration2;
    tInfo.loopDuration = sumDuration;
    tInfo.loopDuration2 = sumDuration2;
    tInfo.pathCounter = _text.pathArray.length -1;
    tInfo.name = _text.name;
    tInfo.letter = _text.name[i];
    tInfo.index = i;
    tInfo.spacing = (_text.spacing) ? _text.spacing[i] : 0;
    tInfo.loop = 0;
    tArray.push(tInfo);
  }
  return tArray;
  }

  // Connects path1 with path2. Assumes path1 ist to the right of path2
  // dy1 is the y translation for path1 and dy2 for path2
  function connectPaths (path1, path2, dy1, dy2) {
      var d1 = path1.attr("d").replace(/,/g , " "); // replace "," with " " for IE 
      var d2 = path2.attr("d").replace(/,/g , " ");
      var dyMax = path1.datum().dy > path2.datum().dy ? path1.datum().dy : path2.datum().dy;
      var x1 = d2.split(" ")[d2.split(" ").length-2];
      var y1 = +(d2.split(" ")[d2.split(" ").length-1]) + dy2;
      var x2 = d1.split("C")[0].substr(1).split(" ")[0];
      var y2 = +(d1.split("C")[0].substr(1).split(" ")[1]) + dy1;
      var newPath = "M" + x1 + " " + y1 + " L" + x2 + " " + y2;
      var pathElement = d3.select("g.paths")
      .append("path")
      .attr("class", "hidden")
      .attr("d", newPath)
      .style("stroke-width", function(d) { return Math.max(1, dyMax); });
      return pathElement;
  }
  
  /*
  function createPaths() {
    var  pathString = "M 100 300 Q 150 50 200 300 Q 250 550 300 300 Q 350 50 400 300 C 450 550 450 50 500 100 Q 550 450 600 300 A 50 50 0 1 1 700 300 ";
    pathString = "M 50 300 Q 100 350 150 300 Q 200 250 250 300 Q 300 400 350 300 Q 400 250 450 300 C 500 350 550 350 600 300 C 650 250 650 400 750 300 ";
    pathString = "M 50 300 Q 500 500 650 400 Q 700 300 500 250 Q 450 150 550 100 C 600 100 650 100 650 150 C 650 200 750 200 700 150 C 700 100 750 100 750 150 ";
    pathString = "M 750 350 Q 250 500 300 400 Q 350 350 300 250 Q 300 100 400 100 C 600 100 600 50 550 150 C 450 300 600 200 650 150 C 700 100 700 150 750 150 Z";

    d3.select("g.paths")
    .append("path")
    .attr("class", "numberX link")
    .attr("d", pathString);
  }
  */

// from https://www.opentechguides.com/how-to/article/javascript/98/detect-mobile-device.html
function isMobileDevice() {
  return (typeof window.orientation !== "undefined") || (navigator.userAgent.indexOf('IEMobile') !== -1);
};