let pathDurations = [];
let pathEndpoints = [];
let app; // the main class in stars.js to create the particles

const containerDiv = "div.chart";
const explosionStrength = 0.002;
const transitionSpeed = 7;
const pause = 5000; // pause in milliseconds in between the pages 
const COLOR = 1;
const IMAGE = 2;
const starOptions = {
	mouseListener: false,
	frames: createFrames(5, 80, 80),
	maxParticles: 2000,
	background: COLOR,
	backgroundColor: "#111111",
	blendMode: "lighter",
	filterBlur: 50,
	filterContrast: 300,
	useBlurFilter: true,
	useContrastFilter: true
};
const STARS = 0;
const ROTATION = 1;
const SCALE = 2;

let index = 0;
let myText = [];
let t1 = ["Congratulations", "to your", "50th birthday !!"];
t1.defaultLine = STARS;
t1.punchLine = STARS;
let t2 = ["All the best wishes", "in terms of", "health, happiness, success and great TV series", "by Antonia and Mihael"];
t2.defaultLine = ROTATION;
t2.punchLine = STARS;
let t3 = ["This animation", "has been implemented specifically for", "Donna Ankerst"];
t3.defaultLine = SCALE;
t3.punchLine = STARS;
let t4 = ["And talk number two", "will be", "'Demystifying black boxes - Why dashboards are failing and design will save us'", "by Evelyn Münster"];
t4.defaultLine = STARS;
t4.punchLine = STARS;
myText.push(t1);
myText.push(t2);
myText.push(t3);
//myText.push(t4);
animate(myText[index]);

function animate(myText){
	WebFont.load({
		google: { families: ["Indie Flower"]},
		fontactive: function(familyName, fvd){ //This is called once font has been rendered in browser
			display(myText);
		},
	});
}

function display(myText) {
	if (typeof myText.defaultLine === "undefined") { myText.defaultLine = STARS; }
	if (typeof myText.punchLine === "undefined") { myText.defaultLine = STARS; }

	displayText(myText);
	createPaths();
	intializeStars();
	animateStars(myText.defaultLine, myText.punchLine);
}

function displayText(_textArray) {
	let sel = d3.select(containerDiv);
	
	// add headers for all strings by wrapping each letter around a span
	// which can be styled individually
	for (let ta = 0; ta < _textArray.length; ta++) {
		let sel2 = sel.append("div")
				.attr("class", "widthForIE h" + ta)
			.append("div")
			  .attr("class", "header h" + ta)
			.append("h1")
			  .attr("class", "trans");
	
		let myString = _textArray[ta];
		for (let i = 0; i < myString.length; i++) {
			sel2.append("span")
			  .attr("class", (ta < _textArray.length -1) ? "rotate" : "burst " + "color-" + (i % 5))
			  .text(myString[i]); 
		}
	}
}

function createPaths() {
	let bBox = d3.select(containerDiv).node().getBoundingClientRect();
	var w = window.innerWidth
	|| document.documentElement.clientWidth
	|| document.body.clientWidth;
	
	var h = window.innerHeight
	|| document.documentElement.clientHeight
	|| document.body.clientHeight;

	let sel = d3.select(containerDiv)
	  .append("div")
		.attr("class", "paths")
	  .append("svg")
		.attr("width", w)
		.attr("height", h);
  
	const container = d3.select(containerDiv).node().getBoundingClientRect();
  
	d3.selectAll(containerDiv + " h1")
	  .each(function(d,i) {
			let bBox = d3.select(this).node().getBoundingClientRect();
			let xTranslate = d3.select("div.chart").node().getBoundingClientRect().x;
			let pos = {};
			pos.width = bBox.width;
			pos.xStart = (container.width - bBox.width) / 2;
			pos.yStart = bBox.y + (bBox.height / 2) - container.y;

			let p = sel.append("path")
				.attr("class", "header hidden trans " + "h" + i)
				.attr("d", (d) => {
					let str =  "M" + pos.xStart + ", " + pos.yStart
				+ " L" + (pos.width + pos.xStart) + ", " + pos.yStart;
					return str;
				});
		
			let duration = p.node().getTotalLength() * transitionSpeed;
			pathDurations.push(duration);
	  });
}

function intializeStars() {
	let bBox = d3.select(containerDiv).node().getBoundingClientRect();
	d3.select(containerDiv).insert("div", ".widthForIE.h0")
		.attr("class", "stars")
	  .append("canvas")
		.attr("id", "view")
		.attr("width", bBox.width)
		.attr("height", bBox.height);

	starOptions.texture = document.querySelector("#star-texture-white");
	starOptions.view = document.querySelector("#view");
	let background = new Image();
	background.src = backgroundImage;
	starOptions.backgroundImage = background;
	
	app = new App(starOptions);
	window.addEventListener("load", app.start());
	window.focus();
}

function starsAlongPath(path) {
	let l = path.getTotalLength();
	return function(d, i, a) {
		return function(t) {
			let p = path.getPointAtLength(t * l);
			app.spawn(p.x , p.y);
			return "translate(0,0)";
		};
	};
}

function animateStars(defaultLine, punchLine) {
	let durations = pathDurations.concat(pathDurations);
	let chainedSel = d3.selectAll(".trans").data(durations);
	chainedTransition(chainedSel);

	function chainedTransition(_chainedSel, _index = 0) {
		const num_headers = _chainedSel.size() / 2;
		let nextSel = _chainedSel.filter((d,i) => (i % num_headers) === _index);
		switch (defaultLine) {
			case STARS: 
				transitionDefault(nextSel);
				break;
			case ROTATION:
				transitionDefaultRotate(nextSel);
				break;
			case SCALE:
				transitionDefaultScale(nextSel);
				break;
			default:
				transitionDefault(nextSel);
		}

		function transitionDefault(_selection){
			if (_index === num_headers - 1) { transitionLast(_selection); }
			else {
				// the header
				let thisSel = _selection.filter((d,i) => i === 0);
				let duration = thisSel.node().__data__;
				let letters = thisSel.selectAll("span");
				let numLetters = letters.size();
				letters
				  .transition()
				  .duration(1000)
				  .delay((d,i) => 1000 + i / numLetters * duration)
				  .ease(d3.easeLinear)
				  .style("opacity", 1);
				// the path
				let sel = _selection.filter((d,i) => i === 1);
				sel.transition()
				  .duration(d => d)
				  .delay(1000)
				  .ease(d3.easeLinear)
				  .attrTween("transform", starsAlongPath(sel.node()))
				  .on ("end", function() {
						_index = _index + 1;
						if (num_headers > _index) { 
							nextSel = _chainedSel.filter((d,i) => (i % num_headers) === _index);
							transitionDefault(nextSel);
						} 
				  });
			}
		}
    
		function transitionDefaultRotate(_selection){
			if (_index === num_headers - 1) { transitionLast(_selection); }
			else {
				let letters = _selection.filter((d,i) => i === 0).selectAll("span");
				letters
				  .style("-webkit-transform", "rotate(-0deg) scale(.001)")
				  .transition()
				  .duration(2000)
				  .delay((d,i) => i * 200)
				  .style("opacity", 1)
				  .style("-webkit-transform", "rotate(-720deg) scale(1)")
				  .on ("end", function(d,i) {
						if (i === letters.size()-1) {
							_index = _index + 1;
							if (num_headers > _index) { 
								nextSel = _chainedSel.filter((d,i) => (i % num_headers) === _index);
								transitionDefaultRotate(nextSel);
							} 
						}
				  });
			}
		}

		function transitionDefaultScale(_selection){
			if (_index === num_headers - 1) { transitionLast(_selection); }
			else {
				let letters = _selection.filter((d,i) => i === 0).selectAll("span");
				const fs = letters.style("font-size");
				letters
				  .style("font-size", "0px")
				  .transition()
				  .duration(2000)
				  .delay((d,i) => i * 200)
				  .style("opacity", 1)
				  .style("font-size", fs)
				  .on ("end", function(d,i) {
						if (i === letters.size()-1) {
							_index = _index + 1;
							if (num_headers > _index) { 
								nextSel = _chainedSel.filter((d,i) => (i % num_headers) === _index);
								transitionDefaultScale(nextSel);
							} 
						}
				  });
			}
		}

		function transitionLast(_selection){
			setTimeout( function() { 
				app.setActivate(false);
				switch (punchLine) {
					default:
						transitionPunch(_selection);
				}
			}, 1000);
		}

		function transitionPunch(_selection){
			starOptions.texture = document.querySelector("#star-texture");
			let app2 = new App(starOptions);
			window.addEventListener("load", app2.start());
			window.focus();
			// the header
			let letters = _selection.filter((d,i) => i === 0).selectAll("span");
			letters.transition()
			  .duration(0)
			  .style("opacity", 1);

			// the path
			let path = _selection.filter((d,i) => i === 1).node();
			let l = path.getTotalLength();
			
			for (let t = 0; t < 1; t = t + explosionStrength) { 
				let p = path.getPointAtLength(t * l);
				app2.spawn(p.x , p.y);        
			}

			setTimeout( function() {
				app2.setActivate(false); 
				pathDurations = [];
				pathEndpoints = [];
				d3.select("div.chart").remove();
				d3.select("body").append("div").attr("class", "chart");
				index = index + 1;
				if (index >= myText.length) {index = 0;} 
				display(myText[index]);
			}, pause);
		}
	}
}