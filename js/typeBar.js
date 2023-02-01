class TypeBar {
 
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
	
	const counts = {'A': 0, 'F': 0, 'G': 0, 'K': 0, 'M': 0, 'N/A': 0 };
	vis.data.forEach(d => {
		if (['A', 'F', 'G', 'K', 'M', 'undefined'].includes(d.st_spectype[0])) {
			counts[d.st_spectype[0]] = counts[d.st_spectype[0]] + 1 || 1;
		} else {
			counts['N/A'] = counts['N/A'] + 1 || 1;
		}
	});

	// Convert the counts object to an array of objects
	const dataArray = [];
	for (let key in counts) {
		dataArray.push({st_spectype: key, count: counts[key]});
	}

	vis.svg = d3.select(vis.config.parentElement)
	  .attr('width', vis.config.containerWidth)
	  .attr('height', vis.config.containerHeight)

	// Set the dimensions of the chart
	const width = vis.config.containerWidth;
	const height = vis.config.containerHeight;
	const margin = 40;

	// Set the scales
	vis.xScale = d3.scaleBand()
	.domain(dataArray.map(d => d.st_spectype))
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
	.text("Exoplanets by Star Type");

	// Add the x axis
	vis.svg.append('g')
	.attr('transform', `translate(0, ${height - margin})`)
	.call(d3.axisBottom(vis.xScale));

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
		.attr('x', d => vis.xScale(d.st_spectype))
		.attr('y', d => vis.yScale(d.count))
		.attr('width', vis.xScale.bandwidth())
		.attr('height', d => vis.config.containerHeight - vis.config.margin.top - vis.yScale(d.count))
		.style('fill', '#1a0f35')
		.attr('class', (d) => d.st_spectype.replace(/[/\\*]/g, ""));

	vis.rects.on('mouseover', (event, d) => {
		console.log("." + d.st_spectype.replace(/[/\\*]/g, ""));
		d3.select("." + d.st_spectype.replace(/[/\\*]/g, ""))
			.style('filter', 'brightness(140%)');
		})
	
	vis.rects.on('mouseleave', (event, d) => {
		d3.select("." + d.st_spectype.replace(/[/\\*]/g, ""))
			.style('filter', 'none');
		});
	}
}
