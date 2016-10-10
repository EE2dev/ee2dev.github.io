/* global d3 */

var pt = pt || {};

pt.slideIdToFunctions = {
  'title': {
    'init': function() {
      pt.title.init();
    }
  },	
  'bug': {
    'init': function() {
      pt.bug.init();
    }
  },	
  'squid': {
    'init': function() {
			console.log("squid start!");
      pt.squid.init();
    }
  },
  'calSolution': {
    'init': function() {
      pt.calSolution.init();
    }
  },
  'cardSolution': {
    'init': function() {
      pt.cardSolution.init();
    }
  },
  'example5_output': {
    'init': function() {
      pt.example5_output.init();
    }
  },
  'example6_output': {
    'init': function() {
      pt.example6_output.init();
    }
  },  
  'example7_output': {
    'init': function() {
      pt.example7_output.init();
    }
  }  
/*
  ,'colorAdd-code': {
    'init': function() {
      pt.colorAddCode.init();
    },
    '-1': function() {
      pt.colorAddCode.screenMode();
    },
    0: function() {
      pt.colorAddCode.noMode();
    },
    1: function() {
      pt.colorAddCode.screenModeRainbow();
    },
    2: function() {
      pt.colorAddCode.screenModeGreen();
    },
    3: function() {
      pt.colorAddCode.multiplyModeGreen();
    },
    4: function() {
      pt.colorAddCode.multiplyModeRainbow();
    },
    5: function() {
      pt.colorAddCode.multiplyModePurple();
    }
  }*/
};

function removeSVGs() {

  //Remove (heavy) all existing svgs currently running
	
  d3.select('canvas.title').remove();
	d3.select('canvas.bug').remove();
	d3.select("div#kraken svg").remove();
	d3.select("#calSolution svg").remove();
	d3.select("#cardSolution svg").remove();
  
  d3.select('#intro-gradient #introGradient svg').remove();
  d3.select('#traffic-accidents #trafficAccidents svg').remove();
  d3.select("#legend-code-orientation #legendCodeOrientation svg").remove();
  d3.select('#legend-code-two #legendCodeTwo svg').remove();
  d3.select('#legend-code-multi #legendCodeMulti svg').remove();
  d3.select('#smooth-legend-SOM #SOMchart svg').remove();
  d3.select('#weather-radial #weatherRadial svg').remove();

  d3.select("#intro-planets #introPlanets svg").remove();
  d3.select("#planets-code #planetsCode svg").remove();
  d3.select("#stars-hr-diagram #starsHRDiagram svg").remove();



}
