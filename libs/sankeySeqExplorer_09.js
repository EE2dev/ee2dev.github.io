import * as d3 from "d3";
import { default as sankeySeq } from "./sankeySeq";

// var sequenceExplorerChart = function(_myData) {
export default function(_myData) {
  "use strict";
  
  // 0.1 All options not accessible to caller 
  var file; // reference to data (embedded or in file)
  var nodeFile; // optional file with additional node infos
  var nodeInfoKeys; // the key names of the additional node infos
  var nodeInfoNone = "(none)"; // displayed string for no info key
  var nodeInfoKey = nodeInfoNone; // the selected key
  var valueName; // the column name of the frequency value
  var scaleGlobal = true; // scale the node height for multiples over all sankeys 
  var showNodeLabels = true; // show node labels
  var allGraphs; // data structure containing columns of rows of sankey input data;
  var tooltip;
  
  ///////////////////////////////////////////////////
  // 1.0 add visualization specific variables here //
  ///////////////////////////////////////////////////
  
  // 1.1 All options that should be accessible to caller  
  var debugOn = false,
    nodeWidth = 15,
    nodePadding = 8, 
    size = [700, 500],
    margin = {left: 5, top: 5, right: 5, bottom: 5},
    sequence,
    categories,
    sequenceName = "sequence",
    categoryName = "category",
    thousandsSeparator = ",";

  // 1.2 all updatable functions to be called by getter-setter methods
  
  // var updateNodeInfo;
  
  ////////////////////////////////////////////////////
  // 2.0 API for external access                    //
  //////////////////////////////////////////////////// 

  // standard API for selection.call(my_reUsableChart)
  function chartAPI(selection) {
    selection.each( function (d) {
      console.log(d);
      console.log("_myData "+ _myData);
      if (typeof d !== "undefined") { // data processing from outside
        createChart(selection, d);
      }
      else { // data processing here
        if (typeof _myData !== "undefined") { 
          readData(_myData, selection);
        } 
        else {
          readData("<pre>", selection);
        }
      }
    });
  }  
  
  // API - example for getter-setter method
  // 2.1 add getter-setter  methods here
 
  chartAPI.debugOn = function(_) {
    if (!arguments.length) return debugOn;
    debugOn = _;
    return chartAPI;
  };
  
  chartAPI.size = function(_) {
    if (!arguments.length) return size;
    size = _;
    return chartAPI;
  };
  
  chartAPI.margin = function(_) {
    if (!arguments.length) return margin;
    margin.left = _;
    margin.top = _;
    margin.right = _;
    margin.bottom = _;  
    return chartAPI;
  };  

  chartAPI.nodeWidth = function(_) {
    if (!arguments.length) return nodeWidth;
    nodeWidth = +_;
    return chartAPI;
  };
 
  chartAPI.nodePadding = function(_) { 
    if (!arguments.length) return nodePadding;
    nodePadding = +_;
    return chartAPI;
  };
  
  chartAPI.sequence = function(_) {
    if (!arguments.length) return sequence;
    sequence = _;
    return chartAPI;
  };
  
  chartAPI.categories = function(_) {
    if (!arguments.length) return categories;
    categories = _;
    return chartAPI;
  };
  
  chartAPI.sequenceName = function(_) {
    if (!arguments.length) return sequenceName;
    sequenceName = _;
    return chartAPI;
  };
  
  chartAPI.categoryName = function(_) {
    if (!arguments.length) return categoryName;
    categoryName = _;
    return chartAPI;
  };  
  
  chartAPI.valueName = function(_) {
    if (!arguments.length) return valueName;
    valueName = _;
    return chartAPI;
  };

  chartAPI.thousandsSeparator = function (_thousandsSeparator) {
    if (!arguments.length) return thousandsSeparator;
    thousandsSeparator = _thousandsSeparator;
    return chartAPI;      
  };  
  
  chartAPI.scaleGlobal = function(_) {
    if (!arguments.length) return scaleGlobal;
    scaleGlobal = _;
    return chartAPI;
  };
  
  chartAPI.showNodeLabels = function(_) {
    if (!arguments.length) return showNodeLabels;
    showNodeLabels = _;
    return chartAPI;
  };
  ////////////////////////////////////
  // 3.0 add private functions here //
  ////////////////////////////////////
  
  // draws axes and returns an Object with properties
  // paddingSingle, paddingMultiples, width, height
  // for further processing in function createChart()
  
  function initialize_whp_and_axes(svg) {
    var width = size[0] - margin.left - margin.right;
    var height = size[1] - margin.bottom - margin.top; 
    var paddingSingle = {left: 0, bottom: 0, right: 0, top: 20};
    var paddingMultiples = {left: 20, bottom: 0, right: 0, top: 20}; // fixed
    
    // drawing axes - step 1: determine size of sankey
    var axisL = svg.append("g")
      .attr("class", "dummy d1")
      .style("opacity", 0)
      .call(d3.axisLeft(d3.scalePoint().domain(categories)));
      
    var axisB = svg.append("g")
      .attr("class", "dummy d2")
      .style("opacity", 0)
      .call(d3.axisBottom(d3.scalePoint().domain(sequence)));

    paddingSingle.left = axisL.node().getBBox().width; 
    paddingSingle.bottom = axisB.node().getBBox().height;

    // update width and height for sankeyG
    width = width - paddingSingle.left;
    height = height - paddingSingle.bottom - paddingMultiples.top;
        
    d3.selectAll("g.dummy").remove();  

    var yScale = d3.scalePoint()
      .domain(categories) 
      .range([height, (height / categories.length)]); 
    var axisLeft = d3.axisLeft(yScale);
    var axisSelection = svg.append("g")
      .attr("class", "axis left")
      .style("opacity", 0)
      .call(axisLeft);
      
    // drawing axes - step 2: calculate paddingSingle.Left  
    paddingSingle.left = axisSelection.node().getBBox().width;
    axisSelection.attr("transform", "translate(" + (paddingSingle.left - 1.5) + ", " + paddingSingle.top + ")");
    
    // adjust axis text
    d3.selectAll("g.axis.left text").attr("dy","");

    var xScale = d3.scalePoint()
      .domain(sequence)
      .range([0, width - nodeWidth]);
    var axisBottom = d3.axisBottom(xScale);
    axisSelection = svg.append("g")
      .attr("class", "axis bottom")
      .style("opacity", 0)
      .call(axisBottom);
    // drawing axes: step 3: calculate paddingSingle.bottom  
    paddingSingle.bottom = axisSelection.node().getBBox().height;
    axisSelection.attr("transform", "translate(" + paddingSingle.left + ", " + (height + paddingMultiples.top) + ")");

    // move text of axisBottom:
    // d3.select("g.axis.bottom").selectAll("text").attr("text-anchor", "start");
    
    var result = {};
    result.paddingSingle = paddingSingle;
    result.paddingMultiples = paddingMultiples;
    result.width = width;
    result.height = height;
    
    return result;
  }
  
  // draws titles, axes around the sankeyGraph
  // for single graph and small multiples
  function initializeFrame(selection, props, allGraphs, colIndex, rowIndex) {
    var width = props.width;
    var height = props.height;
    var padding = props.paddingMultiples;
    
    var tx = colIndex * width / allGraphs.cols;
    var ty = rowIndex * height / allGraphs.rows;
    var sx = (1 / allGraphs.cols * width - padding.left) / width;
    var sy = (1 / allGraphs.rows * height - padding.top) / height;
    if (sx >= sy) { sx = sy;} else { sy = sx;} // make multiples proportional to full sized chart
    
    var transformString = {};   
    transformString.sankeyFrame = {};
    transformString.sankeyFrame.single = "translate(" + (tx + width/2*sx) + ", " + (ty + height/2*sy) + ") scale(0.05)"; 
    transformString.sankeyFrame.multiples = "translate(" + tx + ", " + ty + ") "; 
    
    transformString.sankeySeq = {};
    transformString.sankeySeq.single = "translate(" + (props.paddingSingle.left) + ", 20)"; 
    transformString.sankeySeq.multiples = "translate(" + padding.left + ", " + padding.top + ") " + "scale(" + sx + ", " + sy + ")";

    transformString.pTop = {};
    transformString.pTop.single = "translate(" + (padding.left + width / 2) + ", " + (padding.top - 3) + ")"; 
    transformString.pTop.multiples = "translate(" + (padding.left + width / 2 * sx) + ", " + (padding.top - 3) + ")";
      
    transformString.pLeft = {};
    transformString.pLeft.single = "translate(" + (padding.left - 3) + ", " + (padding.top + height / 2) + ")"; 
    transformString.pLeft.multiples = "translate(" + (padding.left - 3) + ", " + (padding.top + height / 2 * sy) + ")";  

    return transformString;
  }
  
  function transitionToSingle(clickedElement, _trans) {
    var trans = (typeof _trans !== "undefined") ? _trans : d3.transition().duration(1000);
    
    d3.selectAll("g.sankeyFrame")
      .each(function() {
        if (this === clickedElement) {
          console.log("clicked");

          d3.select(this) // transition frame
            .transition(trans)
            .attr("transform", "translate(0, 0)");
            
          d3.select(this).selectAll("g.pTop") // transition top padding
            .transition(trans)
            .attr("transform", function(d) {return d.single;});
          
          d3.select(this).selectAll("text.col.multiples") // hide col title on top
            .transition(trans)
            .style("opacity", 0);
            
          d3.select(this).selectAll("text.col.single") // display row + col title on top
            .transition(trans)
            .style("opacity", 1); 
            
          d3.select(this).selectAll("text.nodeLabel") // display nodeLabels
            .transition(trans)
            .style("opacity", 1); 
          
          d3.select(this).selectAll("g.pLeft") // hide left padding g
            .transition(trans)
            .style("opacity", 0); 
          
          d3.select(this).selectAll(".sankeyNode,.sankeyNodeInfo") // display edge of rectangles
            .transition(trans)
            .style("stroke-width", "1px");          
          
          d3.select(this).selectAll("g.sankeySeq") // transition graph 
            .transition(trans)
            .attr("transform", function(d) {return d.single;});
            
          d3.selectAll(".axis") // show axes for sequence and categories
            .transition().delay(800)
            .style("opacity", 1); 

          d3.selectAll(".coverSankeySeq") // hide surrounding rectangle
            .transition(trans)
            .style("opacity", 0);                         

        } else {
          console.log("not clicked");
          d3.select(this)
              .transition(trans)
              .attr("transform", function(d) {return d.single;})
              .style("opacity", 0);
              
          d3.select(this).selectAll(".sankeyNode,.sankeyNodeInfo") // display edge of rectangles
              .transition(trans)
              .style("stroke-width", "1px");  
        }
      });
    return false;
  }
  
  function transitionToMultiples(clickedElement) {
    var trans = d3.transition()
      .duration(1000);
      
    d3.selectAll("g.sankeyFrame")
      .each(function() {
        if (this === clickedElement) {
          console.log("clicked");
          d3.select(this)
            .transition(trans)
            .attr("transform", function(d) { return d.multiples;});

          d3.select(this).selectAll("g.pTop") // transition top padding
            .transition(trans)
            .attr("transform", function(d) {return d.multiples;});  
            
          d3.select(this).selectAll("text.col.multiples") // display col title on top
            .transition(trans)
            .style("opacity", 1);
            
          d3.select(this).selectAll("text.col.single") // hide row + col title on top
            .transition(trans)
            .style("opacity", 0);           

          d3.select(this).selectAll("text.nodeLabel") // hide nodeLabels
            .transition(trans)
            .style("opacity", 0); 
            
          d3.select(this).selectAll("g.pLeft") // display left padding g
            .transition(trans)
            .style("opacity", 1); 
          
          d3.select(this).selectAll(".sankeyNode,.sankeyNodeInfo") // hide edge of rectangles
            .transition(trans)
            .style("stroke-width", "0px");           
          
          d3.select(this).selectAll("g.sankeySeq") // transition graph 
            .transition(trans)
            .attr("transform", function(d) {return d.multiples;});  

          d3.selectAll(".axis")
            .transition(trans)
            .style("opacity", 0);
            
          d3.selectAll(".coverSankeySeq")
            .transition(trans)
            .style("opacity", 1);     
                      
        } else {
          d3.select(this)
            .transition(trans)
            .attr("transform", function(d) {return d.multiples;})
            .style("opacity", 1);
            
          d3.select(this).selectAll(".sankeyNode,.sankeyNodeInfo") // hide edge of rectangles
            .transition(trans)
            .style("stroke-width", "0px");
        }
      });   
    return true;
  }

  function displaySankeyMenu(selection) {
    var div1 = selection.append("div").attr("class", "sankeyMenu");
    
    // options menu
    var divOm = div1.append("div").attr("class", "OptionsMenu");
    
    divOm.append("div")
      .attr("class", "titleMenu")
      .append("label")
      .text("options");     
    
    if (!(allGraphs.cols === 1 && allGraphs.rows === 1)) {
      var div2 = divOm.append("span")
        .attr("class", "span1")
        .append("input")
        .attr("class", "nodeScaling")
        .attr("type", "checkbox")
        .on("change", updateScaling);
        
      div2.node().checked = scaleGlobal;
      
      divOm.select("span.span1")
        .append("label")
        .text("global scale"); 
      
      divOm.append("br");
    }
        
    var div3 = divOm.append("span")
      .attr("class", "span2")
      .append("input")
      .attr("class", "labelOnOff")
      .attr("type", "checkbox")
      .on("change", updateNodeLabels);
      
    div3.node().checked = showNodeLabels;  
      
    div1.select("span.span2")
      .append("label")
      .text("node labels"); 
      
    // node info menu  
    if (typeof nodeFile === "undefined") { return;}
    
    if (debugOn) {
      console.log("nodeInfoKeys: ");
      console.log(nodeInfoKeys);
    }
    var divNim = d3.select("div.sankeyMenu")
        .append("div")
        .attr("class", "NodeInfoMenu");
   
    divNim.append("div")
        .attr("class", "titleMenu")
        .append("label")
        .text("node info");
          
    divNim = divNim.append("form")
        .selectAll("span")
        .data(nodeInfoKeys) 
        .enter()
      .append("span");
      
    divNim.append("input")
      .attr("type", "radio")
      .attr("name", "menu")
      .attr("value", function(d) { return d; })
      .attr("checked", function(d, i) { if (i === 0) { return "checked"; } })
      .on("change", function change() {
        nodeInfoKey = this.value;
        console.log("nodeInfokey: "+ nodeInfoKey);
        updateNodeInfo();
      }); 

    divNim.append("label")
      .text(function(d) { return d; });
      
    divNim.append("br");        
  }
    
  function updateScaling() {
    var mySankey;
    var parentSelector;
    var graph;
    var trans = d3.transition().duration(1000);

    scaleGlobal = d3.select(".nodeScaling").node().checked;

    allGraphs.forEach( function (col, colIndex) {
      col.forEach( function (container, rowIndex) {
        mySankey = container.sankey;
        graph = container.graph;
      
        if (scaleGlobal) {mySankey.maxValue(allGraphs.maxValue);}
        else {mySankey.maxValue(-1);}
        mySankey.layout();   
      
      // transition links
        parentSelector = "g.sankeySeq.s" + colIndex + "-" + rowIndex;
        d3.select(parentSelector).selectAll(".link")
        .data(graph.links, function(d) { return d.id; }) // data join for clarity. Data attributes have been changed even without join!
        .transition(trans)
        .attr("d", mySankey.link())
        .style("stroke-width", function(d) { return Math.max(1, d.dy) + "px"; });
        
      // transition nodes
        d3.select(parentSelector).selectAll(".node")
         .data(graph.nodes)
         .transition(trans)
         .attr("transform", function(d) {return "translate(" + d.x + "," + d.y + ")"; });
        
        d3.select(parentSelector).selectAll("rect.sankeyNode")
         .transition(trans)
         .attr("height", function(d) { return d.dy; });

        var yOfBottomAxis = d3.select("rect.coverSankeySeq").attr("height");    
        d3.select(parentSelector).selectAll("text.nodeLabel")
         .transition(trans)        
         // .attr("y", function(d) { return d.dy / 2; });
         .attr("y", function(d) {  // adjustment if text would cross x axis           
           var transNode = getTranslation(d3.select(this.parentNode).attr("transform"))[1];
           var pyHeight = parseInt(d3.select(this).style("font-size"));              
           if (transNode + pyHeight > yOfBottomAxis) {
             return d.dy - pyHeight / 2 - 1;
           } 
           else {
             return d.dy / 2;
           }
         });
        
        d3.select(parentSelector).selectAll("rect.sankeyNodeInfo")
         .filter(function(d) {             nodeInfoKeys.forEach( function(key) {
           if (key !== nodeInfoNone) {// skip case for no nodeInfo selection
             d.nodeInfos[key + "_dy"] = mySankey.getNodeHeight(+d.nodeInfos[key]);
           }
           else {
             if (nodeInfoKey === nodeInfoNone) {
               d3.selectAll("rect.sankeyNodeInfo").attr("y", function(d) {return d.dy;});
             }
           }
         });
           return (typeof d.nodeInfos !== "undefined"); })
         
        .attr("height", function() { 
          return d3.select(this).attr("height");
        })
        
        .transition(trans)   
        .attr("y", function(d) {
          if (nodeInfoKey === nodeInfoNone) { return d.dy; }
          else {
            if (debugOn) {
              console.log("value: " + +d.nodeInfos[nodeInfoKey]);
              console.log("newHeight: " + d.nodeInfos[nodeInfoKey + "_dy"]);
            } 
            return d.dy - d.nodeInfos[nodeInfoKey + "_dy"];
          }
        })
        .attr("height", function(d) { 
          if (nodeInfoKey === nodeInfoNone) { return 0; }
          else {return d.nodeInfos[nodeInfoKey + "_dy"]; }
        });
      });
    });
  }
  
  function updateNodeLabels() {
    d3.selectAll("text.nodeLabel").style("display", function() { 
      return d3.select(".labelOnOff").node().checked ? "block" : "none";});
  }
  
  function updateNodeInfo() {
    var trans = d3.transition().duration(1000);
    d3.select("div.NodeInfoMenu")
    .transition(trans)
    .style("border-color", function() { return (nodeInfoKey === nodeInfoNone) ? "rgba(0,0,0,0.1)" : "orange";})
    .style("background-color", function() { 
      return (nodeInfoKey === nodeInfoNone) ? "rgba(0,0,0,0.1)" : "rgba(255,165,0,0.1)";});  
          
    d3.selectAll("rect.sankeyNodeInfo")
    .style("display", "inline")  // reset style to inline if switch from none to other
    .transition(trans)
    .attr("y", function(d) { 
      if (nodeInfoKey === nodeInfoNone) { return d.dy; }
      else {
        if (debugOn) {
          console.log("value: " + +d.nodeInfos[nodeInfoKey]);
          console.log("newHeight: " + d.nodeInfos[nodeInfoKey + "_dy"]);
        } 
        return d.dy - d.nodeInfos[nodeInfoKey + "_dy"];
      }
    })
    .attr("height", function(d) { 
      if (nodeInfoKey === nodeInfoNone) { return 0; }
      else {return d.nodeInfos[nodeInfoKey + "_dy"]; }
    })
    .transition()
    .delay(10)
    .duration(10)
    .style("display", function() { // set style to none if switch from other to none
      if (nodeInfoKey === nodeInfoNone) { return "none"; }
      else { return "inline";} 
    });
  }
  
  ////////////////////////////////////////////////////
  // 4.0 add visualization specific processing here //
  //////////////////////////////////////////////////// 
  
  function createChart(selection, _file) {
    allGraphs = constructSankeyFromCSV(_file); // main data structure build from csv file
    var sankey; // sankeySeq
    var width; // width of drawing area within SVG
    var height; // height of drawing area within SVG
    var sankeyG; // group element containing the sankeySeq graph
    var sankeyF; // group element containing the sankeyFrame = sankeySeq graph + axes/titles
    var node; // selection with nodes
    var graph; // graph for each sankeySeq
    var props; // properties calculated in initialization function
    var multiplesOn = true; // small multiples currently shown?
    var transformString; // object that transform strings for transitioning between small multiples and single
    var svg; 
    
    selection.each(function () {
        // 4.1 insert code here  
      displaySankeyMenu(selection); 
        
      svg = d3.select(this).append("div")
          .attr("class", "sankeyChart")
        .append("svg")
          .attr("width", size[0])
          .attr("height", size[1])
        .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        
      // drawing axes
      props = initialize_whp_and_axes(svg);
      if (allGraphs.cols === 1 && allGraphs.rows === 1) { 
        d3.selectAll(".axis").style("opacity", 1);
        d3.selectAll(".sankeyNode,.sankeyNodeInfo").style("stroke-width", "1px");
      }
      width = props.width;
      height = props.height;
      
      if (debugOn) { console.log("allGraphs:"); console.log(allGraphs); }
      
      allGraphs.forEach( function (col, colIndex) {
        col.forEach( function (container, rowIndex) {
          graph = container.graph;
          if (debugOn) {
            console.log("col: " + container.dimCol);
            console.log("row: " + container.dimRow);
          }       
          
          // setting up sankeySeq
          // sankey = d3.sankeySeq()
          sankey = sankeySeq()
            .size([width, height])
            .sequence(sequence) 
            .categories(categories)
            .nodeWidth(nodeWidth)
            .nodePadding(nodePadding)
            .nodes(graph.nodes)
            .links(graph.links)
            .debugOn(debugOn);
          
          if (scaleGlobal) {sankey.maxValue(allGraphs.maxValue);}
          sankey.layout();   
          container.sankey = sankey;
          
          transformString = initializeFrame(svg, props, allGraphs, colIndex, rowIndex);

          sankeyF = svg.append("g")
          .datum(transformString.sankeyFrame)
          .attr("class", "sankeyFrame f" + colIndex + "-" + rowIndex)
          .attr("transform", transformString.sankeyFrame.multiples)
          .on("click", function () {
            if (allGraphs.cols === 1 && allGraphs.rows === 1) { return;}
            multiplesOn = (multiplesOn) ? transitionToSingle(this) :  transitionToMultiples(this);          
          }); 
          
          sankeyG = sankeyF.append("g")
            .datum(transformString.sankeySeq)
            .attr("class", "sankeySeq s" + colIndex + "-" + rowIndex)
            .attr("transform", transformString.sankeySeq.multiples);
          
          var topP = sankeyF.append("g")
            .datum(transformString.pTop)
            .attr("class", "sankeyPad multiples pTop")
            .attr("transform", transformString.pTop.multiples);
            
          topP.append("text")
            .attr("class", "multiples col c" + colIndex)
            .text(function() {
              var topLabel = ""; // for single Sankey no title
              if (allGraphs.cols === 1 && allGraphs.rows > 1) { topLabel = container.dimRow;} // switch label to top
              else {
                topLabel = container.dimCol;
              }
              return topLabel;
            });         
            
          topP.append("text")
            .attr("class", "single col c" + colIndex)
            .style("opacity", 0)
            .text(function() {
              var topLabel = ""; // for single Sankey no title
              if (allGraphs.cols === 1 && allGraphs.rows > 1) { topLabel = container.dimRow;} // switch label to top
              else {
                topLabel = container.dimRow + "\u00A0\u00A0\u00A0\u00A0" + container.dimCol;
              }
              return topLabel;
            }); 
          
          sankeyF.append("g")
            .datum(transformString.pLeft)
            .attr("class", "sankeyPad multiples pLeft")
            .attr("transform", transformString.pLeft.multiples)
            .append("text")
            .attr("class", "multiples row r" + rowIndex)
            .attr("transform", "rotate(-90)")
            .text(function() {
              var topLabel = ""; // for single Sankey and one dimension no title
              if (allGraphs.cols > 1 && allGraphs.rows > 1) { topLabel = container.dimRow;} 
              return topLabel;
            });         

          // rect as selection area
          sankeyG.append("rect")
            .attr("class", "coverSankeySeq")
            .attr("height", height)
            .attr("width", width + 2) // otherwise global scale transition leads to stroke rendering issues on the rightmost nodes 
            .style("stroke", "black")
            .style("stroke-width", 1)
            .style("fill-opacity", 0);
          
          // tooltip
          tooltip = d3.select("body").append("div").attr("class", "tooltip");
            
          // drawing links
          sankeyG.append("g").selectAll(".link")
            .data(graph.links)
          .enter().append("path")
            .attr("class", function(d) { return "link" + " lsx" + d.source.nameX.replace(/ /g, "_")
              + " lsy" + d.source.nameY.replace(/ /g, "_")
              + " ltx" + d.target.nameX.replace(/ /g, "_")
              + " lty" + d.target.nameY.replace(/ /g, "_"); })
            .attr("d", sankey.link())
            .style("stroke-width", function(d) { return Math.max(1, d.dy) + "px"; })
            .sort(function(a, b) { return b.dy - a.dy; })
            .on("mouseover", function(d) {
              var info = sequenceName + ": " + d.source.nameX + " -> " + d.target.nameX;
              info += "<br>" + categoryName + ": " + d.source.nameY + " -> " + d.target.nameY;
              info += "<br>" + valueName + ": " + formatNumber(d.value);
              tooltip.html(info);
              tooltip.style("visibility", "visible");
            })
            .on("mousemove", function() {
              var twidth = 19; // padding + border + 5
              var theight = 19; // padding + border + 5
              
              var index = tooltip.style("width").indexOf("px");
              if(index != -1)
                twidth += +tooltip.style("width").substr(0, index);
                
              index = tooltip.style("height").indexOf("px");
              if(index != -1)
                theight += +tooltip.style("height").substr(0, index);
           
              var top = (d3.event.pageY - 100 < 0) ? d3.event.pageY + 23 : d3.event.pageY - theight;
              var left = (d3.event.pageX + 250 < window.innerWidth) ? d3.event.pageX + 5 : d3.event.pageX - twidth;

              return tooltip.style("top", top +"px").style("left", left +"px");
            })
            .on("mouseout", function() {
              return tooltip.style("visibility", "hidden");
            });
         
          // drawing nodes
          node = sankeyG.append("g").selectAll(".node")
            .data(graph.nodes)
          .enter().append("g")
            .attr("class", "node")
            .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

          node.append("rect")
            .attr("class", function(d) {
              var res = "sankeyNode" + " nx" + d.nameX.replace(/ /g, "_") + " ny" + d.nameY.replace(/ /g, "_");
              chartAPI.categories().forEach( function(cat, i) {
                if (cat === d.nameY) {
                  res += " color" + (i % 5);
                }
              });
              return res;
            })
            .attr("height", function(d) { return d.dy; })
            .attr("width", sankey.nodeWidth())
            .on("mouseover", function(d) {
              var info = sequenceName + ": " + d.nameX;
              info += "<br>" + categoryName + ": " + d.nameY;
              info += "<br>" + valueName + ": " + formatNumber(d.value);
              tooltip.html(info);
              tooltip.style("visibility", "visible");
            })
            .on("mousemove", positionTooltipNode)
            .on("mouseout", function() {
              return tooltip.style("visibility", "hidden");
            });
          
          var yOfBottomAxis = d3.select("rect.coverSankeySeq").attr("height");
          node.append("text")
            .attr("class", "nodeLabel")
            .style("display", function() { 
              return d3.select(".labelOnOff").node().checked ? "block" : "none";})
            .attr("x", 3 + sankey.nodeWidth())
            .attr("y", function(d) { return d.dy / 2; })
            .attr("dy", ".35em")
            .attr("text-anchor", "start")
            .attr("transform", null)
            .style("opacity", 0)
            .text(function(d) { return d.nameY; })
          .each(function() { // adjust height for lowest category in case text overlaps with x axis
            var transNode = getTranslation(d3.select(this.parentNode).attr("transform"))[1];
            var pyHeight = parseInt(d3.select(this).style("font-size"));              
            if (transNode + pyHeight > yOfBottomAxis) {
              d3.select(this).attr("y", function(d) { return d.dy - pyHeight / 2 - 1; });
            } 
          })  
          .filter(function(d) { return d.x > width * .9; })
            .attr("x", -3)
            .attr("text-anchor", "end");
            // .attr("transform", function(d) { return "translate (" + ((d.dy / 2) + 30) + "," + (d.dy / 2) + ") rotate(90)"; }); 

          //drawing nodeInfos
          node.filter(function(d) { return (typeof d.nodeInfos !== "undefined"); }) // display nodeInfos
            .append("rect")
            .attr("class", "sankeyNodeInfo")
            .attr("y", function(d) { return d.dy;})
            .attr("height", function(d) { 
              nodeInfoKeys.forEach( function(key) {
                if (key !== nodeInfoNone) {// skip case for no nodeInfo selection
                  d.nodeInfos[key + "_dy"] = sankey.getNodeHeight(+d.nodeInfos[key]);
                }
              });
              return 0; })
            .attr("width", sankey.nodeWidth())
            .style("fill", "orange")
            .style("display", function() { // set style to none if nodeInfo == none
              if (nodeInfoKey === nodeInfoNone) { return "none"; }
              else { return "inline";} 
            })
            .on("mouseover", function(d) {
              var info = sequenceName + ": " + d.nameX;
              info += "<br>" + categoryName + ": " + d.nameY;
              info += "<br>" + valueName + " ("+ nodeInfoKey + "): " + d.nodeInfos[nodeInfoKey];
              tooltip.html(info);
              tooltip.style("visibility", "visible");
            })
            .on("mousemove", positionTooltipNode)
            .on("mouseout", function() {
              return tooltip.style("visibility", "hidden");
            });
            
          if (container.transform === "single") { 
            transitionToSingle(sankeyF.node(), d3.transition().duration(0));
          }
        });
      });  
      

    });
  }
   
   // helper function for calculating the position of the tooltip for node and node info
  function positionTooltipNode () {
    var twidth = 19; // padding + border + 5
    var theight = 19; // padding + border + 5
      
    var index = tooltip.style("width").indexOf("px");
    if(index != -1)
      twidth += +tooltip.style("width").substr(0, index);
        
    index = tooltip.style("height").indexOf("px");
    if(index != -1)
      theight += +tooltip.style("height").substr(0, index);

    var top = (d3.event.pageY - 100 < 0) ? d3.event.pageY + 23 : d3.event.pageY - theight;
    var left = (d3.event.pageX + 250 < window.innerWidth) ? d3.event.pageX + 5 : d3.event.pageX - twidth;

    return tooltip.style("top", top +"px").style("left", left +"px");
  }
   
   // helper function for getting the transform attributes
   // from http://stackoverflow.com/questions/38224875/replacing-d3-transform-in-d3-v4
   
  function getTranslation(transform) { 
    // Create a dummy g for calculation purposes only. This will never
    // be appended to the DOM and will be discarded once this function 
    // returns.
    var g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    
    // Set the transform attribute to the provided string value.
    g.setAttributeNS(null, "transform", transform);
    
    // consolidate the SVGTransformList containing all transformations
    // to a single SVGTransform of type SVG_TRANSFORM_MATRIX and get
    // its SVGMatrix. 
    var matrix = g.transform.baseVal.consolidate().matrix;
    
    // As per definition values e and f are the ones for the translation.
    return [matrix.e, matrix.f];
  }
  
  // helper function to apply thousandSeparator
  function formatNumber(str) {
    var format = d3.format(",.0f");
    if (thousandsSeparator === ".") { // German convention
      if (+str % 1 !== 0) {
        return str.split(".").join(",");
      }
      else {
        var newStr = format(str).split(",").join(".");
        return newStr;
      }
    }
    else {    // US convention
      if (+str % 1 !== 0) { 
        return str;
      }
      else {        
        return format(str);
      }
    }
  }  

  // 4.2 update functions
  
  ////////////////////////////////////////////////////
  // 5.0 processing data begins here                //
  //////////////////////////////////////////////////// 

  // 5.1 adjust for visualization specific data processing
  // XHR to load data   
  function readData(csvFile, selection) {
    if (csvFile !== "<pre>") {
      d3.csv(csvFile, function(error1, f) {
        var nodeFileName = _myData.slice(0, _myData.lastIndexOf(".")) + "_nodes" + _myData.slice(_myData.lastIndexOf("."));
        d3.csv(nodeFileName, function(error2, nf) { // load infos from optional nodeInfo file
          if (debugOn) {
            console.log("start");
            console.log(error2);
            console.log(nf);
            console.log("end");
          } 
          nodeFile = nf;
          file = f;

          if (debugOn) {
            console.log("file: ");
            console.log(file);
            console.log("nodeFileName: ");
            console.log(nodeFileName);
            console.log("nodeFile: ");
            console.log(nodeFile);
          }           
          createChart(selection, f);
        });       
      });
    } 
    else {
      file = d3.csvParse(d3.select("pre#data").text());
      nodeFile = d3.csvParse(d3.select("pre#dataNodes").text());
      if (nodeFile.length === 0) {
        var a;
        nodeFile = a; // set to undefined
      }
      if (debugOn) {
        console.log("file: ");
        console.log(file);
        console.log("nodeFile: ");
        console.log(nodeFile);        
      }
      createChart(selection, file);
    }
  } 
  
  // processes sankey from a csv file. Returns the necessary graph data structure. 
  // based on the approach from timelyportfolio, see http://bl.ocks.org/timelyportfolio/5052095
  function constructSankeyFromCSV(_file) {
    //set up graph in same style as original example but empty
    var graph = {}; 
    var allGraphs = []; // array of graphs
    var source, target;
    var columns = _file.columns;
    var dataGroups = [];
    var nodeMap = d3.map();
    var hashKey;
    var data; // data from each group (categories of dimension)
    var container;
    var sourceValues, targetValues; // for iterating over value to find maxValue
    var value, maxValue = 0; // maxValue for scaling option 
    
    console.log(_file.columns);
    if (typeof valueName === "undefined") {valueName = _file.columns[0];}
    
    // processing main file first
    if (_file.columns.length === 5)  { // standard case
      dataGroups = d3.nest()
        .key(function() { return ""; })
        .key(function() { return ""; })
        .entries(_file);
        
      if (typeof nodeFile !== "undefined") {
        nodeFile.forEach(function(node){
          hashKey = node["sourceX"] + "," + node["sourceY"];              
          nodeMap.set(hashKey, node);
          if (debugOn) { console.log(node);}
        });   
        nodeInfoKeys = nodeFile.columns;
        nodeInfoKeys.splice(0,2,nodeInfoNone);  
      }
    } else if (_file.columns.length === 6)  { // one additional dimension
      dataGroups = d3.nest()
        .key(function() { return ""; })
        .key(function(d) { return d[columns[5]]; }).sortKeys(d3.ascending)
        .entries(_file);
        
      if (typeof nodeFile !== "undefined") {
        nodeFile.forEach(function(node){
          hashKey = node[_file.columns[5]] + "," + node["sourceX"] + "," + node["sourceY"];             
          nodeMap.set(hashKey, node);
          if (debugOn) { console.log(node);}
        });   
        nodeInfoKeys = nodeFile.columns;
        nodeInfoKeys.splice(0,3,nodeInfoNone);  
      }
    } else if (_file.columns.length === 7)  { // two additional dimensions
      dataGroups = d3.nest()
        .key(function(d) { return d[columns[6]]; }).sortKeys(d3.ascending)
        .key(function(d) { return d[columns[5]]; }).sortKeys(d3.ascending)
        .entries(_file);
        
      if (debugOn) { console.log("----------- nodeInfos ------------");}
      if (typeof nodeFile !== "undefined") {
        nodeFile.forEach(function(node){
          hashKey = node[_file.columns[6]] + "," + node[_file.columns[5]] + "," + node["sourceX"] + "," + node["sourceY"];              
          nodeMap.set(hashKey, node);
          if (debugOn) { console.log(node);}
        });   
        nodeInfoKeys = nodeFile.columns;
        nodeInfoKeys.splice(0,4,nodeInfoNone);  
      }
    }
    
    allGraphs.rows = d3.nest()
               .key(function(d) { return d[columns[5]];})
               .entries(_file)
               .length;
               
    allGraphs.cols = d3.nest()
               .key(function(d) { return d[columns[6]];})
               .entries(_file)
               .length;          
    
    if (debugOn) {  
      console.log("----------- datagroups ------------");
      console.log(dataGroups);
      console.log("----------nodeMap----------");
      console.log(nodeMap);
    }     
    
    // create data structure containing data in the right representation    
    dataGroups.forEach(function (dim2, col) {
      allGraphs[col] = [];
      dim2.values.forEach(function(dim1) {
        data = dim1.values;
        graph = {"nodes" : [], "links" : []}; 

        if (debugOn) {console.log("graph0: ");}
        
        data.forEach(function (d, i) {          
          if (debugOn) {
            console.log("i: " + i);
            console.log(d);
          }
          
          // data is derived from the hard-coded column order
          source = d[columns[1]] + "_" + d[columns[2]];
          target = d[columns[3]] + "_" + d[columns[4]];   
          graph.nodes.push({ "name": source });
          graph.nodes.push({ "name": target });
          graph.links.push({ "source": source,
            "target": target,
            "id": source + "->" + target,
            "value": +d[columns[0]] });    
        });

        if (debugOn) {
          console.log("graph1: ");
          console.log(JSON.stringify(graph));
        }
         
        graph.nodes = d3.nest()
          .key(function (d) { return d.name; })
          .map(graph.nodes)
          .keys();
        
        if (debugOn) {      
          console.log("graph2: ");
          console.log(JSON.stringify(graph));
        } 
           
        // loop through each link replacing the text with its index from node
        graph.links.forEach(function (d, i) {
          graph.links[i].source = graph.nodes.indexOf(graph.links[i].source);
          graph.links[i].target = graph.nodes.indexOf(graph.links[i].target);
        });

        //now loop through each node to make nodes an array of objects
        // rather than an array of strings
        graph.nodes.forEach(function (d, i) {
          var xValue = d.split("_")[0];
          var yValue = d.split("_")[1];
          graph.nodes[i] = { "name": d, "nameX": xValue, "nameY": yValue };
          
          // add nodeInfos if available
          var nInfos;
          var firstPart = dim2.key === "" ? "" : dim2.key + ",";
          var secondPart = dim1.key === "" ? "" : dim1.key + ",";
          nInfos = nodeMap.get(firstPart + secondPart + xValue + "," + yValue);
            
          if (typeof nInfos !== "undefined") {
            Object.keys(nInfos).forEach(function(key) {
              nInfos[key + "_dy"] = 0;
            });
            graph.nodes[i].nodeInfos = nInfos;        
          }
        });
        
        if (debugOn) {
          console.log("graph 3");
          console.log(JSON.stringify(graph));
          console.log(graph);
        }
        
        // default setting of categories and sequence as an array sorted lexicographically
        if (!sequence) {
          sequence = d3.set(graph.nodes.map(function (d) {return d.nameX;}))
          .values().sort(d3.ascending);
        }
        
        if (!categories) {
          categories = d3.set(graph.nodes.map(function (d) {return d.nameY;}))
          .values().sort(d3.ascending); 
        }
        
        if (debugOn) {
          console.log("categoriesSorted: ");
          console.log(categories);
        }
        
        container = {};
        container.graph = graph;

        container.dimRow = dim1.key;
        container.dimCol = dim2.key;
        
        // computing the value of the largest node
        sourceValues = d3.nest()
          .key(function(d) { return d.source; })
          .rollup(function(values) { return d3.sum(values, function(d) {return +d.value; }); })
          .entries(graph.links);
          
        targetValues = d3.nest()
          .key(function(d) { return d.target; })
          .rollup(function(values) { return d3.sum(values, function(d) {return +d.value; });})
          .entries(graph.links);  
        
        sourceValues = sourceValues.concat(targetValues);
        value = d3.max(sourceValues, function(d) {
          return d.value;});

        maxValue = value > maxValue ? value : maxValue; 
                
        if (allGraphs.cols === 1 && allGraphs.rows === 1) { container.transform = "single";} // standard case
        else { container.transform = "multiples";} // additional dimensions
        
        allGraphs[col].push(container);
      }); 
    });
    if (debugOn) {console.log("maxValue: " + maxValue);}
    allGraphs.maxValue = maxValue;
    return allGraphs;
  }
    
  return chartAPI;
}
