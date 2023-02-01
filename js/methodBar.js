class MethodBar {
 
  constructor(_config, _data) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: _config.containerWidth || 500,
      containerHeight: _config.containerHeight || 140,
      margin: {top: 40, right: 50, bottom: 10, left: 50}
    }
	
	this.data = _data; 

    this.initVis();
  }
  
   
  initVis(){
	  
	let vis = this;
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
	
	const counts = {};
	vis.data.forEach(d => {
		if (!counts[d.discoverymethod]) {
		  counts[d.discoverymethod] = 1;
		} else {
		  counts[d.discoverymethod]++;
		}
	});
	// Convert the counts object to an array of objects
	const dataArray = [];
	for (let key in counts) {
		dataArray.push({method: key, count: counts[key]});
	}

	vis.svg = d3.select(vis.config.parentElement)
	  .attr('width', vis.config.containerWidth)
	  .attr('height', vis.config.containerHeight)
	  .classed('svg', true);

	// Set the dimensions of the chart
	const width = vis.config.containerWidth;
	const height = vis.config.containerHeight;
	const margin = 40;

	// Set the scales
	vis.xScale = d3.scaleBand()
	.domain(dataArray.map(d => d.method))
	.range([margin, width - margin])
	.padding(0.1);

	vis.yScale = d3.scaleLinear()
	.domain([0, d3.max(dataArray, d => d.count)])
	.range([height - margin, margin]);

	vis.svg.append("text")
	.attr("x", width/2)
	.attr("y", 20)
	.attr("text-anchor", "middle")
	.style("font-family", "Roboto")
	.style("font-size", "14px")
	.text("Exoplanets by Discovery Method");
		// Add the y axis
	vis.svg.append('g')
		.attr('transform', `translate(${margin}, 0)`)
		.call(d3.axisLeft(vis.yScale));
	
	vis.updateVis(dataArray);
  }

  updateVis(dataArray){
    let vis = this;
    vis.rects = vis.svg.selectAll('rect')
		.data(dataArray)
		.enter()
		.append('rect')
		.attr('x', d => vis.xScale(d.method))
		.attr('y', d => vis.yScale(d.count))
		.attr('width', vis.xScale.bandwidth())
		.attr('height', d => vis.config.containerHeight - vis.config.margin.top - vis.yScale(d.count))
		.style('fill', '#66d9ef')
		.attr('class', (d) => d.method.replace(/\s+/g, '-').toLowerCase())

	vis.rects.on('mouseover', (event, d) => {
		d3.select("." + d.method.replace(/\s+/g, '-').toLowerCase())
			.style('filter', 'brightness(90%)');
	})

	vis.rects.on('mouseleave', (event, d) => {
		d3.select("." + d.method.replace(/\s+/g, '-').toLowerCase())
			.style('filter', 'none');
	});

	// Add the x axis
	vis.svg.append('g')
		.attr('transform', `translate(0, ${vis.config.containerHeight - vis.config.margin.top})`)
		.call(d3.axisBottom(vis.xScale))
		.selectAll("text")
		.style("text-anchor", "start")
		.style("word-wrap", "break-word")
		.style("font-family", "Roboto")
		.style("color", "black")
		.style("font-size", "9px")
		.attr("dx", "0.5em")
		.attr("dy", "-0.5em")
		.attr("transform", "rotate(-90)");

	vis.rects.on('click', (event, d) => {
		console.log(d);
	});
  }
}
