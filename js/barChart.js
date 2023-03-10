class BarChart {
 
  constructor(_config, _data, _title, _callback, _color) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: _config.containerWidth || 500,
      containerHeight: _config.containerHeight || 140,
      margin: {top: 40, right: 40, bottom: 10, left: 40}
    }
	
	this.callback = _callback;
	this.color = _color;
	this.title = _title;
	this.data = _data; 
	this.initVis();
  }
  
   
  initVis(){
	let vis = this;
	let dataArray = vis.data;

	// Width and height as the inner dimensions of the chart area- as before
    vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
    vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

    vis.svg = d3.select(vis.config.parentElement)
        .attr('width', vis.config.containerWidth)
        .attr('height', vis.config.containerHeight)

    vis.chart = vis.svg.append('g')
        .attr('transform', `translate(${vis.config.margin.left}, ${vis.config.margin.top})`);

	vis.svg = d3.select(vis.config.parentElement)
	  .attr('width', vis.config.containerWidth)
	  .attr('height', vis.config.containerHeight)
	  .classed('svg', true);

	// Set the dimensions of the chart
	const width = vis.config.containerWidth;
	const height = vis.config.containerHeight;
	const margin = 40;

	// Set xScale
	vis.xScale = d3.scaleBand()
		.domain(dataArray.map(d => d.key))
		.range([margin, width - margin])
		.padding(0.1);

	// Draw axis if not discovery method or habitability barcharts
	if(vis.title != "Exoplanets by Discovery Method" || vis.title != "Exoplanets by Habitability" ){
		vis.svg.append('g')
		.attr('transform', `translate(0, ${vis.config.containerHeight - vis.config.margin.top})`)
		.call(d3.axisBottom(vis.xScale))
		.selectAll("text")
		.style("text-anchor", "middle")
		.style("word-wrap", "break-word")
		.style("font-family", "Roboto")
		.style("color", "black")
		.style("font-size", "9px")
		.style("pointer-events", "none")
		.attr('class', 'x-axis');
	}

	vis.updateVis();
  }

  updateVis(){
	let vis = this;
	let dataArray = vis.data;

	const width = vis.config.containerWidth;
	const height = vis.config.containerHeight;
	const margin = 40;

	// Prevents duplicate titles and axis
	vis.svg.selectAll('.y-axis').remove();
	vis.svg.selectAll('.chart-title').remove();
	
	// Set yScale
	vis.yScale = d3.scaleLinear()
		.domain([0, d3.max(dataArray, d => d.count)])
		.range([height - margin, margin]);

	// Add chart titles
	vis.charttitle = vis.svg.append("text")
		.attr("x", width/2)
		.attr("y", 20)
		.attr("text-anchor", "middle")
		.style("font-family", "Roboto")
		.style("font-size", "0.875em")
		.text(vis.title)
		.attr('class', 'chart-title');
	
	// Add the y axis
	vis.svg.append('g')
		.attr('transform', `translate(${margin}, 0)`)
		.call(d3.axisLeft(vis.yScale).ticks(5))
		.attr('class', 'y-axis');

	// Used to create a class for each bar (formats input string into valid CSS class name)
	function formatString(input, d){
		return input.replace(/\s+/g, '-').replace(/[/\\*]/g, "").replace(/\#/g, "").toLowerCase() + d.key.replace(/\s+/g, '-').replace(/[/\\*]/g, "").toLowerCase();
	}

	// Add bars to chart
    vis.rects = vis.svg.selectAll('rect')
        .data(dataArray)
        .join('rect')
		.attr('x', d => vis.xScale(d.key))
		.attr('y', d => vis.height)
		.attr('width', vis.xScale.bandwidth())
		.attr('height', d => 0)
		.style('fill', vis.color)
		.attr('class', (d) => "bar-" + formatString(vis.title, d))


	if(vis.title == "Exoplanets by Discovery Method"){
		// Discovery methods are vertical on x-axis
		vis.svg.selectAll('.x-axis').remove();
		vis.svg.selectAll('.axis-title').remove();
		vis.svg.append('g')
		.attr('transform', `translate(0, ${vis.config.containerHeight - vis.config.margin.top})`)
		.call(d3.axisBottom(vis.xScale))
		.selectAll("text")
		.on("click", (event, d) => {
			vis.callback(d);
		})
		.style("text-anchor", "start")
		.style("word-wrap", "break-word")
		.style("font-family", "Roboto")
		.style("color", "black")
		.style("font-size", "9px")
		.attr("dx", "0.5em")
		.attr("dy", "-0.5em")
		.attr("transform", "rotate(-90)")
		.style("cursor", "pointer")
		.attr('class', 'x-axis')
		.style('z-index', '10');

		vis.charttitle = vis.svg.append("text")
			.attr("x", vis.width/2 + 75)
			.attr("y", vis.height + 40)
			.attr("text-anchor", "middle")
			.style("font-family", "Roboto")
			.style("font-size", "12px")
			.text("Discovery Method")
			.attr('class', 'axis-title');

	} else if(vis.title == "Exoplanets by Habitability"){
		// Habitability is vertical on x-axis
		vis.svg.selectAll('.x-axis').remove();
		vis.svg.selectAll('.axis-title').remove();
		vis.svg.append('g')
			.attr('transform', `translate(0, ${vis.config.containerHeight - vis.config.margin.top})`)
			.call(d3.axisBottom(vis.xScale))
			.selectAll("text")
			.on("click", (event, d) => {
				vis.callback(d);
			})
			.style("text-anchor", "start")
			.style("word-wrap", "break-word")
			.style("font-family", "Roboto")
			.style("color", "black")
			.style("font-size", "9px")
			.attr("dx", "0.5em")
			.attr("dy", "-0.5em")
			.attr("transform", "rotate(-90)")
			.style("cursor", "pointer")
			.attr('class', 'x-axis')
			.style('z-index', '10');

		vis.charttitle = vis.svg.append("text")
			.attr("x", vis.width/2 + vis.config.margin.left)
			.attr("y", vis.height + 40)
			.attr("text-anchor", "middle")
			.style("font-family", "Roboto")
			.style("font-size", "12px")
			.text("Habitability")
			.attr('class', 'axis-title');
	} else if(vis.title == "Exoplanets by # of Stars in System") {
		// Add axis title
		vis.svg.selectAll('.axis-title').remove();
		vis.charttitle = vis.svg.append("text")
			.attr("x", vis.width/2 + 55)
			.attr("y", vis.height + 45)
			.attr("text-anchor", "middle")
			.style("font-family", "Roboto")
			.style("font-size", "12px")
			.text("# of Stars")
			.attr('class', 'axis-title');
	} else if(vis.title == "Exoplanets by # of Planets in System") {
		// Add axis title
		vis.svg.selectAll('.axis-title').remove();
		vis.charttitle = vis.svg.append("text")
			.attr("x", vis.width/2 + 55)
			.attr("y", vis.height + 45)
			.attr("text-anchor", "middle")
			.style("font-family", "Roboto")
			.style("font-size", "12px")
			.text("# of Planets")
			.attr('class', 'axis-title');
	} else if(vis.title == "Exoplanets by Star Type") {
		// Add axis title
		vis.svg.selectAll('.axis-title').remove();
		vis.charttitle = vis.svg.append("text")
			.attr("x", vis.width/2 + 55)
			.attr("y", vis.height + 45)
			.attr("text-anchor", "middle")
			.style("font-family", "Roboto")
			.style("font-size", "12px")
			.text("Star Type")
			.attr('class', 'axis-title');
	} 

    vis.rects.on('click', (event, d) => {
        let barClass = "bar-" + formatString(vis.title, d);
		console.log(d.key);
		d3.select('#barchart-tooltip') 
			.style('display', 'none'); // Remove tooltip on click
		vis.callback(d.key); // Callback to main function to filter data
        vis.rects.style('filter', 'brightness(100%)'); // Reset brightness
		d3.select("." + "bar-" + formatString(vis.title, d));
    });

	vis.rects.transition()
		.duration(1000)
		.attr('y', (d) => vis.yScale(d.count) ) 
		.attr('height', (d) => vis.config.containerHeight - vis.config.margin.top - vis.yScale(d.count))		
		.on('end', () => {
			vis.rects.on('mouseover', (event, d) => {
			let barClass = "bar-" + formatString(vis.title, d);
			d3.select("." + barClass)
				.style('filter', `brightness(80%)`) // Darken bars on mouseover
				.style("cursor", "pointer");
			d3.select('#barchart-tooltip')
				.style('display', 'block')
				.style('left', (event.pageX + 15) + 'px')   
				.style('top', (event.pageY + 15) + 'px')	// Add tooltip
				.html(`
					<div class="tooltip-title">${vis.title}</div>	
					<ul>
					<li><div>Key: <i>${d.key}</i></div>
					<li><div>Count: <i>${d.count}</i></div>
					</ul>
			  	`);
			})
			vis.rects.on('mouseleave', (event, d) => {
				let barClass = "bar-" + formatString(vis.title, d);
				d3.select("." + barClass)
					.style('filter', `brightness(100%)`); // Reset brightness
				d3.select('#barchart-tooltip')
					.style('display', 'none'); // Remove tooltip
			});
		});

  }

  renderVis(){
	// let vis = this;
	// let dataArray = vis.data;
    // vis.clicked = {};

	// const width = vis.config.containerWidth;
	// const height = vis.config.containerHeight;
	// const margin = 40;

	// vis.svg.selectAll('.y-axis').remove();
	// vis.svg.selectAll('.chart-title').remove();

	// vis.yScale = d3.scaleLinear()
	// .domain([0, d3.max(dataArray, d => d.count)])
	// .range([height - margin, margin]);

	// vis.charttitle = vis.svg.append("text")
	// 	.attr("x", width/2)
	// 	.attr("y", 20)
	// 	.attr("text-anchor", "middle")
	// 	.style("font-family", "Roboto")
	// 	.style("font-size", "0.875em")
	// 	.text(vis.title)
	// 	.attr('class', 'chart-title');

	// // Add the y axis
	// vis.svg.append('g')
	// 	.attr('transform', `translate(${margin}, 0)`)
	// 	.call(d3.axisLeft(vis.yScale).ticks(5))
	// 	.attr('class', 'y-axis');

	// function formatString(input, d){
	// 	return input.replace(/\s+/g, '-').replace(/[/\\*]/g, "").replace(/\#/g, "").toLowerCase() + d.key.replace(/\s+/g, '-').replace(/[/\\*]/g, "").toLowerCase();
	// }

    // vis.rects = vis.svg.selectAll('rect')
    //     .data(dataArray)
    //     .join('rect')
    //     .attr('x', d => vis.xScale(d.key))
    //     .attr('y', d => vis.yScale(d.count))
    //     .attr('width', vis.xScale.bandwidth())
    //     .attr('height', d => vis.config.containerHeight - vis.config.margin.top - vis.yScale(d.count))
    //     .style('fill', vis.color)
    //     .attr('class', (d) => "bar-" + formatString(vis.title, d))

    // vis.rects.on('mouseover', (event, d) => {
    //     let barClass = "bar-" + formatString(vis.title, d);
    //     d3.select("." + barClass)
    //         .style('filter', `brightness(80%)`)
	// 		.style("cursor", "pointer");
	// 	d3.select('#barchart-tooltip')
	// 		.style('display', 'block')
	// 		.style('left', (event.pageX + 15) + 'px')   
	// 		.style('top', (event.pageY + 15) + 'px')
	// 		.html(`
	// 			<div class="tooltip-title" style="padding: 5px">${vis.title}</div>
	// 			<ul>
	// 			<li><div>Key: <i>${d.key}</i></div>
	// 			<li><div>Count: <i>${d.count}</i></div>
	// 			</ul>
	// 	  	`);
    // })

    // vis.rects.on('mouseleave', (event, d) => {
    //     let barClass = "bar-" + formatString(vis.title, d);
    //     d3.select("." + barClass)
    //         .style('filter', `brightness(100%)`);
	// 	d3.select('#barchart-tooltip')
	// 		.style('display', 'none');
    // });

	// if(vis.title == "Exoplanets by Discovery Method"){
	// 	vis.svg.selectAll('.x-axis').remove();
	// 	vis.svg.append('g')
	// 	.attr('transform', `translate(0, ${vis.config.containerHeight - vis.config.margin.top})`)
	// 	.call(d3.axisBottom(vis.xScale))
	// 	.selectAll("text")
	// 	.on("click", (event, d) => {
	// 		vis.callback(d);
	// 	})
	// 	.style("text-anchor", "start")
	// 	.style("word-wrap", "break-word")
	// 	.style("font-family", "Roboto")
	// 	.style("color", "black")
	// 	.style("font-size", "9px")
	// 	.attr("dx", "0.5em")
	// 	.attr("dy", "-0.5em")
	// 	.attr("transform", "rotate(-90)")
	// 	.style("cursor", "pointer")
	// 	.attr('class', 'x-axis')
	// 	.style('z-index', '10');

	// 	vis.charttitle = vis.svg.append("text")
	// 		.attr("x", vis.width/2 + 75)
	// 		.attr("y", vis.height + 40)
	// 		.attr("text-anchor", "middle")
	// 		.style("font-family", "Roboto")
	// 		.style("font-size", "12px")
	// 		.text("Discovery Method")
	// 		.attr('class', 'axis-title');
	// } else if(vis.title == "Exoplanets by # of Stars in their System") {
	// 	vis.svg.selectAll('.axis-title').remove();
	// 	vis.charttitle = vis.svg.append("text")
	// 		.attr("x", vis.width/2 + 55)
	// 		.attr("y", vis.height + 45)
	// 		.attr("text-anchor", "middle")
	// 		.style("font-family", "Roboto")
	// 		.style("font-size", "12px")
	// 		.text("# of Stars")
	// 		.attr('class', 'axis-title');
	// } else if(vis.title == "Exoplanets by # of Planets in their System") {
	// 	vis.svg.selectAll('.axis-title').remove();
	// 	vis.charttitle = vis.svg.append("text")
	// 		.attr("x", vis.width/2 + 55)
	// 		.attr("y", vis.height + 45)
	// 		.attr("text-anchor", "middle")
	// 		.style("font-family", "Roboto")
	// 		.style("font-size", "12px")
	// 		.text("# of Planets")
	// 		.attr('class', 'axis-title');
	// } else if(vis.title == "Exoplanets by Star Type") {
	// 	vis.svg.selectAll('.axis-title').remove();
	// 	vis.charttitle = vis.svg.append("text")
	// 		.attr("x", vis.width/2 + 55)
	// 		.attr("y", vis.height + 45)
	// 		.attr("text-anchor", "middle")
	// 		.style("font-family", "Roboto")
	// 		.style("font-size", "12px")
	// 		.text("Star Type")
	// 		.attr('class', 'axis-title');
	// } else if(vis.title == "Exoplanets by Habitability"){
	// 	vis.svg.selectAll('.x-axis').remove();
	// 	vis.svg.selectAll('.axis-title').remove();
	// 	vis.svg.append('g')
	// 		.attr('transform', `translate(0, ${vis.config.containerHeight - vis.config.margin.top})`)
	// 		.call(d3.axisBottom(vis.xScale))
	// 		.selectAll("text")
	// 		.on("click", (event, d) => {
	// 			vis.callback(d);
	// 		})
	// 		.style("text-anchor", "start")
	// 		.style("word-wrap", "break-word")
	// 		.style("font-family", "Roboto")
	// 		.style("color", "black")
	// 		.style("font-size", "9px")
	// 		.attr("dx", "0.5em")
	// 		.attr("dy", "-0.5em")
	// 		.attr("transform", "rotate(-90)")
	// 		.style("cursor", "pointer")
	// 		.attr('class', 'x-axis')
	// 		.style('z-index', '10');

	// 	vis.charttitle = vis.svg.append("text")
	// 		.attr("x", vis.width + 10)
	// 		.attr("y", vis.height + 40)
	// 		.attr("text-anchor", "middle")
	// 		.style("font-family", "Roboto")
	// 		.style("font-size", "12px")
	// 		.text("Habitability")
	// 		.attr('class', 'axis-title');
	// }

    // vis.rects.on('click', (event, d) => {
    //     let barClass = "bar-" + formatString(vis.title, d);
	// 	vis.clicked = {};
    //     vis.clicked[barClass] = true;
	// 	console.log(d.key);
	// 	d3.select('#barchart-tooltip')
	// 		.style('display', 'none');
	// 	vis.callback(d.key);
    //     vis.rects.style('filter', 'brightness(100%)'); // 2 seconds;
	// 	d3.select("." + "bar-" + formatString(vis.title, d))
	// 	;
    // });

  }

}
