class SystemStarBar {
 
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
	const counts = {};
	vis.data.forEach(d => {
		if (!counts[d.sy_snum]) {
		  counts[d.sy_snum] = 1;
		} else {
		  counts[d.sy_snum]++;
		}
	});

	// Convert the counts object to an array of objects
	const dataArray = [];
	for (let key in counts) {
	dataArray.push({sy_snum: key, count: counts[key]});
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
	.domain(dataArray.map(d => d.sy_snum))
	.range([margin, width - margin])
	.padding(0.1);

	vis.yScale = d3.scaleLinear()
	.domain([0, d3.max(dataArray, d => d.count)])
	.range([height - margin, margin]);

	// Add title
	vis.svg.append("text")
	.attr("x", width/2)
	.attr("y", 20)
	.attr("text-anchor", "middle")
	.style("font-family", "Roboto")
	.style("font-size", "14px")
	.text("Exoplanets by # of Stars in their System");

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
      .attr('x', d => vis.xScale(d.sy_snum))
      .attr('y', d => vis.yScale(d.count))
      .attr('width', vis.xScale.bandwidth())
      .attr('height', d => vis.config.containerHeight - vis.config.margin.top - vis.yScale(d.count))
      .style('fill', '#0483e9')
	  .attr('class', (d) => "sbar-"+d.sy_snum);

	vis.rects.on('mouseover', (event, d) => {
		d3.select("." + "sbar-"+d.sy_snum)
			.style('filter', 'brightness(85%)');
		})

	vis.rects.on('mouseleave', (event, d) => {
		d3.select("." + "sbar-"+d.sy_snum)
			.style('filter', 'none');
		});
  }
}

