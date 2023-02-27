class Histogram {
 
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

    // Define 'svg' as a child-element (g) from the drawing area and include spaces
    // Add <svg> element (drawing space)
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
	// Add the x axis

	// Set the scales
	vis.xScale = d3.scaleBand()
		.domain(dataArray.map(d => d.key))
		.range([margin, width - margin])
		.padding(0.1);
	
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

	
	vis.yScale = d3.scaleLinear()
		.domain([0, d3.max(dataArray, d => d.count)])
		.range([height - margin, margin]);

	vis.svg.append("text")
		.attr("x", width/2)
		.attr("y", 20)
		.attr("text-anchor", "middle")
		.style("font-family", "Roboto")
		.style("font-size", "14px")
		.text(vis.title)
		.attr('class', 'chart-title');

	vis.svg.selectAll('.axis-title').remove();
	vis.charttitle = vis.svg.append("text")
		.attr("x", vis.width/2 - 25)
		.attr("y", vis.height + 45)
		.attr("text-anchor", "right")
		.style("font-family", "Roboto")
		.style("font-size", "12px")
		.text("Distance from Earth (parsecs)")
		.attr('class', 'axis-title');

	// Add the y axis
	vis.svg.append('g')
		.attr('transform', `translate(${margin}, 0)`)
		.call(d3.axisLeft(vis.yScale).ticks(6))
		.attr('class', 'y-axis');

    vis.rects = vis.svg.selectAll('rect')
        .data(dataArray)
        .join('rect')
        .attr('x', d => vis.xScale(d.key))
        .attr('y', d => vis.yScale(d.count))
        .attr('width', vis.xScale.bandwidth())
        .attr('height', d => vis.config.containerHeight - vis.config.margin.top - vis.yScale(d.count))
        .style('fill', vis.color)
		.style('transition', 'all 0.5 ease')
        .attr('class', (d) => "bar-" + formatString(vis.title, d))

    vis.rects.on('mouseover', (event, d) => {
        let barClass = "bar-" + formatString(vis.title, d);
        d3.select("." + barClass)
            .style('filter', `brightness(80%)`)
			.style('cursor', 'pointer');
		d3.select('#barchart-tooltip')
			.style('display', 'block')
			.style('left', (event.pageX + 15) + 'px')   
			.style('top', (event.pageY + 15) + 'px')
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
            .style('filter', `brightness(100%)`);
		d3.select('#barchart-tooltip')
			.style('display', 'none')
    });

	function formatString(input, d){
		return input.replace(/\s+/g, '-').replace(/[/\\*]/g, "").replace(/\#/g, "").replace(/\(/g, "").replace(/\)/g, "").toLowerCase() + d.key.replace(/\s+/g, '-').replace(/[/\\*]/g, "").replace(/>/g, "").replace(/\(/g, "").replace(/\)/g, "").toLowerCase();
	}

    vis.rects.on('click', (event, d) => {
        let barClass = "bar-" + formatString(vis.title, d);
		vis.clicked = {};
        vis.clicked[barClass] = true;
		console.log(d.key);
		vis.callback(d.key);
		d3.select('#barchart-tooltip')
			.style('display', 'none')
        vis.rects.style('filter', 'brightness(100%)');
		d3.select("." + "bar-" + formatString(vis.title, d))
		;
    });
  }

  updateVis(){
	let vis = this;
	let dataArray = vis.data;
    vis.clicked = {};

	const width = vis.config.containerWidth;
	const height = vis.config.containerHeight;
	const margin = 40;

	vis.svg.selectAll('.chart-title').remove();
	
	vis.yScale = d3.scaleLinear()
		.domain([0, d3.max(dataArray, d => d.count)])
		.range([height - margin, margin]);

	vis.svg.append("text")
		.attr("x", width/2)
		.attr("y", 20)
		.attr("text-anchor", "middle")
		.style("font-family", "Roboto")
		.style("font-size", "14px")
		.text(vis.title)
		.attr('class', 'chart-title');

	vis.rects = vis.svg.selectAll('rect')
        .data(dataArray)
        .join('rect')
		.attr('class', 'bar-rect-' + vis.title.replace(/\s+/g, '-').replace(/[/\\*]/g, "").replace(/\#/g, "").toLowerCase())

	vis.rects.transition()
		.duration(1000)
		.attr('x', d => vis.xScale(d.key))
		.attr('y', d => vis.yScale(d.count))
		.attr('width', vis.xScale.bandwidth())
		.attr('height', d => vis.config.containerHeight - vis.config.margin.top - vis.yScale(d.count))
		.style('fill', vis.color)
		.attr('class', (d) => "bar-" + formatString(vis.title, d))
		.on('end', () => {
			vis.rects.on('mouseover', (event, d) => {
			let barClass = "bar-" + formatString(vis.title, d);
			d3.select("." + barClass)
				.style('filter', `brightness(80%)`)
				.style("cursor", "pointer");
			d3.select('#barchart-tooltip')
				.style('display', 'block')
				.style('left', (event.pageX + 15) + 'px')   
				.style('top', (event.pageY + 15) + 'px')
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
					.style('filter', `brightness(100%)`);
				d3.select('#barchart-tooltip')
					.style('display', 'none')
			});
	});

	function formatString(input, d){
		return input.replace(/\s+/g, '-').replace(/[/\\*]/g, "").replace(/\#/g, "").replace(/\(/g, "").replace(/\)/g, "").toLowerCase() + d.key.replace(/\s+/g, '-').replace(/[/\\*]/g, "").replace(/>/g, "").replace(/\(/g, "").replace(/\)/g, "").toLowerCase();
	}

	vis.svg.selectAll('.axis-title').remove();
	vis.charttitle = vis.svg.append("text")
		.attr("x", vis.width/2 - 25)
		.attr("y", vis.height + 45)
		.attr("text-anchor", "right")
		.style("font-family", "Roboto")
		.style("font-size", "12px")
		.text("Distance from Earth (parsecs)")
		.attr('class', 'axis-title');

    vis.rects.on('click', (event, d) => {
        let barClass = "bar-" + formatString(vis.title, d);
		vis.clicked = {};
        vis.clicked[barClass] = true;
		console.log(d.key);
		vis.callback(d.key);
		d3.select('#barchart-tooltip')
			.style('display', 'none')
        vis.rects.style('filter', 'brightness(100%)');
		d3.select("." + "bar-" + formatString(vis.title, d))
		;
    });

  }

}
