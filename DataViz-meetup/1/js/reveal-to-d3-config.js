/* global d3 */

var pt = pt || {};

pt.slideIdToFunctions = {
  'example3_output': {
    'init': function() {
      pt.example3_output.init();
    }
  },
  'example4_output': {
    'init': function() {
      pt.example4_output.init();
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
  d3.select('#title-slide #titleSlide svg').remove();
  
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

  d3.select('#intro-orientation #introOrientation svg').remove();
  d3.select('#orientation-grey #orientationGrey svg').remove();
  d3.select('#orientation-color-hex #orientationColorHex svg').remove();
  d3.select('#orientation-final #orientationFinal svg').remove();
  
  d3.select('#intro-slider #sliderIntro svg').remove();
  d3.selectAll('#baby-names-final svg').remove();
  d3.select('#slider-move-code #sliderMoveCode svg').remove();
  d3.select('#growth-bmi #growthBMI svg').remove();

  d3.select('#intro-animated-gradient #animatedGradientIntro svg').remove();
  d3.select('#sankey-example #sankey svg').remove();
  d3.select('#stretched-chord #stretchedChord svg').remove();
  d3.select('#stretched-chord-final #stretchedChordFinal svg').remove();
  d3.select("#minard #svgMinard defs").remove();

  d3.select("#intro-gooey #introGooey svg").remove();
  d3.select('#gooey-golf #gooeyGolf svg').remove();
  d3.select('#gooey-code #gooeyCode svg').remove();
  d3.select('#biggest-cities #biggestCities svg').remove();
  d3.select('#collision-detection #collisionDetection svg').remove();

  d3.select("#intro-glow #glowIntro svg").remove();
  d3.select('#radar-chart #radarChart svg').remove();
  d3.select("#glow-code #glowCode svg").remove();
  d3.select('#spiro-graph #spiroGraph svg').remove();

  d3.select('#intro-fuzzy #introFuzzy svg').remove();
  //pt.fuzzyIntro.stopRepeat = true;
  d3.select('#fuzzy-code #fuzzyCode svg').remove();
  d3.select('#animal-speeds #animalSpeeds svg').remove();

  d3.select("#intro-colorAdd #introColorAdd svg").remove();
  d3.select('#colorAdd-blend-modes #colorAddBlendModes svg').remove();
  d3.select('#colorAdd-code #colorAddCode svg').remove();
  //clearInterval(pt.colorAddCode.infinityLoop);

  d3.select('#end-slide #endSlide svg').remove();

}
