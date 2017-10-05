pt.calSolution = pt.calSolution || {};

pt.calSolution.init = function() {
			var maxNumber = 367;
		var currentCard = 0;
		var solution = 0;
		var width = 1000,
			height = 900,
			z = 20,
			x = width / z,
			y = height / z;
		
		var solutionDays = d3.timeDays(new Date(2016, 0, 1), new Date(2017, 0, 1));	
		var solutionFormat = d3.timeFormat("%B %e");
		var myDaysFormat = d3.timeFormat("%e");
		var shuffleSolution = true;
		var shuffleMap, unShuffleMap;
				
		console.log(getMagicNumbers(maxNumber)); 
		
		// var myDiv = d3.select("body").append("div").attr("class", "center");
		var myDiv = d3.select("#calSolution div.center");
		
		/*
		myDiv.append("h1").attr("class", "task").text("I will try to guess your birthday after asking 9 yes/no questions!");
		myDiv.append("h5").attr("class", "task").text("Don't say your birthday out loud!");
		myDiv.append("h3").attr("class", "task").text("Is your birthday marked on the following calendar?");
		*/
		
		var svg = d3.select("section#calSolution").append("svg")
			.attr("width", width)
			.attr("height", height)
			
		var myCards = getMagicNumbers(maxNumber);
		getShuffleMap(maxNumber);
		drawCards(svg);	
			
		var answers = svg.selectAll("g.answer")
			.data(["yes","no"])
			.enter()
			.append("g")
			.attr("class", "answer")
			.attr("transform", function (d, i) { return "translate(" + (380 + i * 200) + ", 60)";});;
				
		answers.append("text")
			.text(function (d) { return d;})
			.attr("y", "0.3em")
			.attr("class", "answer")
			.style("font-size", "24px");	
			
		answers.append("circle")
			.attr("r", 50)
			.style("stroke", function(d, i) {return (i === 0) ? "green" : "red"})
			.style("fill", "lightgrey")
			.style("fill-opacity", 0.4)
			.on("mouseover", function(d, i) {
				var col = (i === 0) ? "green" : "red"; 
				d3.select(this).style("fill", col).style("stroke-width", 3);})
			.on("mouseout", function() {
				d3.select(this).style("fill", "lightgrey").style("stroke-width", 1);})
			.on("click", nextCard);	
		
		d3.select(".card.c" + currentCard)
			.transition()
			.attr("transform", "translate(170, 110) scale(0.8)");		
			
		function drawCards(_selection) {
			// calendar implementation from http://kathyz.github.io/d3-calendar/
			var width = 960,
			height = 750,
			cellSize = 25; // cell size

			var no_months_in_a_row = Math.floor(width / (cellSize * 7 + 50));
			var shift_up = cellSize * 3;

			var day = d3.timeFormat("%w"), // day of the week
					day_of_month = d3.timeFormat("%e") // day of the month
					day_of_year = d3.timeFormat("%j")
					week = d3.timeFormat("%U"), // week number of the year
					month = d3.timeFormat("%m"), // month number
					year = d3.timeFormat("%Y"),
					percent = d3.format(".1%"),
					format = d3.timeFormat("%Y-%m-%d");				

			var color = d3.scaleQuantize()
					.domain([-.05, .05])
					.range(d3.range(11).map(function(d) { return "q" + d + "-11"; }));

			var selection = _selection.selectAll("g")
				.data(myCards)
				.enter()
				.append("g")
				.attr("class", function (d,i) { return "card c" + i;})
				.attr("transform", function (d, i) { return "translate(" + (68 + (i - 1) * 110) + ", 660) scale(0.1)";});
			
			function daysData(d, i) { 
				var allDays = d3.timeDays(new Date(2016, 0, 1), new Date(2017, 0, 1));				
				allDays.forEach(function(element, index, array) {
					array[index] = { value: element, card: i};
				});
				return allDays; 
			}; 
			
			var rect = selection.selectAll(".day")
					.data(daysData)
				.enter().append("rect")
					//.attr("class", function(d, i) { return (myCards[d.card].indexOf(i) != -1) ? "day color" : "day nocolor";})
					.attr("class", function(d, i) { return (myCards[d.card].indexOf(shuffleMap.get(i)) != -1) ? "day color" : "day nocolor";})
					.attr("width", cellSize)
					.attr("height", cellSize)
					.attr("x", function(data) {
						var d = data.value;
						var month_padding = 1.2 * cellSize*7 * ((month(d)-1) % (no_months_in_a_row));
						return day(d) * cellSize + month_padding; 
					})
					.attr("y", function(data) { 
						var d = data.value;	
						var week_diff = week(d) - week(new Date(year(d), month(d)-1, 1) );
						var row_level = Math.ceil(month(d) / (no_months_in_a_row));
						return (week_diff*cellSize) + row_level*cellSize*8 - cellSize/2 - shift_up;
					})
					.datum(format);
			
			var myDays = selection.selectAll("text.mydays")
				.data(d3.timeDays(new Date(2016, 0, 1), new Date(2017, 0, 1)))
				.enter().append("text")
				.attr("class", "mydays")
				.text(function(d) {return myDaysFormat(d);})
				.attr("x", function(d) {
					var month_padding = 1.2 * cellSize*7 * ((month(d)-1) % (no_months_in_a_row));
					return day(d) * cellSize + month_padding + cellSize / 2; 
				})
				.attr("y", function(d) { 
					var week_diff = week(d) - week(new Date(year(d), month(d)-1, 1) );
					var row_level = Math.ceil(month(d) / (no_months_in_a_row));
					return (week_diff*cellSize) + row_level*cellSize*8 - cellSize/2 - shift_up + cellSize - 6;
				})

			var month_titles = selection.selectAll(".month-title")  
						.data(d3.timeMonths(new Date(2016, 0, 1), new Date(2017, 0, 1)))
					.enter().append("text")
						.text(monthTitle)
						.attr("x", function(d, i) {
							var month_padding = 1.2 * cellSize*7* ((month(d)-1) % (no_months_in_a_row));
							return month_padding;
						})
						.attr("y", function(d, i) {
							var week_diff = week(d) - week(new Date(year(d), month(d)-1, 1) );
							var row_level = Math.ceil(month(d) / (no_months_in_a_row));
							return (week_diff*cellSize) + row_level*cellSize*8 - cellSize - shift_up;
						})
						.attr("class", "month-title")
						.attr("d", monthTitle);
		}
		
		function dayTitle (t0) {
      return t0.toString().split(" ")[2];
    }
    function monthTitle (t0) {
      // return t0.toLocaleString("en-us", { month: "long" }); // doesn't work in Safari
	  	var monthFormat = d3.timeFormat("%B");
	  	return monthFormat(t0);
    }
		
		function getShuffleMap(upperBound){
			var shuffledArray = d3.range(1, upperBound, 1);
			if (shuffleSolution) {d3.shuffle(shuffledArray);}
			shuffleMap = d3.map();
			unShuffleMap = d3.map();
			shuffledArray.forEach(function (element, index) {
				shuffleMap.set(index, element);
				unShuffleMap.set(element, index);
			});				
		}

		function getMagicNumbers(upperBound) {
			var cards = [];
			var firstNumber;
			var max = Math.log(upperBound) * Math.LOG2E; // polyfill for IE where Math.log2 doesn't work				
			// for (i = 0; i < Math.log2(upperBound); i++) {
			
			for (i = 0; i < max; i++) {
				cards[i] = [];
				firstNumber = Math.pow(2, i);
				for (number = 1; number <= upperBound; number++) {
					if (((Math.floor(number /firstNumber)) % 2) != 0) {
						cards[i].push(number);  
					}
				}
			}
			// d3.shuffle(cards);
			return cards;
		}    

		function nextCard(d, i) {
			d3.selectAll("circle").style("fill", "lightgrey").style("stroke-width", 1);
			if (d === "yes") {solution = solution + myCards[currentCard][0];}
			// remove card	
			d3.select(".card.c" + currentCard)
				.transition()
				.attr("transform", "translate(400, 400) scale(0)");
				
			currentCard++;	
			if (currentCard < myCards.length) {
			// display next card
			console.log("next");
			d3.select(".card.c" + currentCard)
				.transition()
				.attr("transform", "translate(170, 110) scale(0.8)");
			}
			else {
				d3.selectAll("circle").remove();
				d3.selectAll("text").remove();
				d3.selectAll(".task").remove();
				myDiv.append("h3").text("Please focus now!");
				solution = unShuffleMap.get(solution);
				var solutionOutput = (solution <= 366) ? solutionFormat(solutionDays[solution]) : "That was too hard!?"
				console.log("solution: " + solution);
				console.log("solution date: " + solutionOutput);
				svg.append("rect")
					.attr("class", "solution")
					.attr("x", 50)
					.attr("y", 50)
					.attr("width", 900)
					.attr("height", 250)
					.style("fill", "lightblue");
					
				svg.append("text")
					.attr("class", "solution")
					.text(solutionOutput)
					.attr("x", 500)
					.attr("y", 200)
					.style("font-size", "100px")
					.style("stroke", "black")
					.style("opacity", 0)	
					.transition().duration(12000)
					.style("opacity", 1);				
			}
		}
		
		// Production steps of ECMA-262, Edition 5, 15.4.4.14
		// Reference: http://es5.github.io/#x15.4.4.14
		if (!Array.prototype.indexOf) {
			Array.prototype.indexOf = function(searchElement, fromIndex) {

				var k;

				// 1. Let o be the result of calling ToObject passing
				//    the this value as the argument.
				if (this == null) {
					throw new TypeError('"this" is null or not defined');
				}

				var o = Object(this);

				// 2. Let lenValue be the result of calling the Get
				//    internal method of o with the argument "length".
				// 3. Let len be ToUint32(lenValue).
				var len = o.length >>> 0;

				// 4. If len is 0, return -1.
				if (len === 0) {
					return -1;
				}

				// 5. If argument fromIndex was passed let n be
				//    ToInteger(fromIndex); else let n be 0.
				var n = +fromIndex || 0;

				if (Math.abs(n) === Infinity) {
					n = 0;
				}

				// 6. If n >= len, return -1.
				if (n >= len) {
					return -1;
				}

				// 7. If n >= 0, then Let k be n.
				// 8. Else, n<0, Let k be len - abs(n).
				//    If k is less than 0, then let k be 0.
				k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

				// 9. Repeat, while k < len
				while (k < len) {
					// a. Let Pk be ToString(k).
					//   This is implicit for LHS operands of the in operator
					// b. Let kPresent be the result of calling the
					//    HasProperty internal method of o with argument Pk.
					//   This step can be combined with c
					// c. If kPresent is true, then
					//    i.  Let elementK be the result of calling the Get
					//        internal method of o with the argument ToString(k).
					//   ii.  Let same be the result of applying the
					//        Strict Equality Comparison Algorithm to
					//        searchElement and elementK.
					//  iii.  If same is true, return k.
					if (k in o && o[k] === searchElement) {
						return k;
					}
					k++;
				}
				return -1;
			};
		}
}