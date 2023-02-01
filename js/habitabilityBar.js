class HabitabilityBar {
 
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
	const counts = {'Habitable': 0, 'Too Cold': 0, 'Too Hot': 0};

	vis.data.forEach(d => {
	  switch (d.st_spectype[0]) {
		case 'A':
		  if (d.pl_orbsmax >= 8.5 && d.pl_orbsmax <= 12.5) {
			counts['Habitable']++;
		  } else if (d.pl_orbsmax < 8.5) {
			counts['Too Cold']++;
		  } else {
			counts['Too Hot']++;
		  }
		  break;
		case 'F':
		  if (d.pl_orbsmax >= 1.5 && d.pl_orbsmax <= 2.2) {
			counts['Habitable']++;
		  } else if (d.pl_orbsmax < 1.5) {
			counts['Too Cold']++;
		  } else {
			counts['Too Hot']++;
		  }
		  break;
		case 'G':
		  if (d.pl_orbsmax >= 0.95 && d.pl_orbsmax <= 1.4) {
			counts['Habitable']++;
		  } else if (d.pl_orbsmax < 0.95) {
			counts['Too Cold']++;
		  } else {
			counts['Too Hot']++;
		  }
		  break;
		case 'K':
		  if (d.pl_orbsmax >= 0.38 && d.pl_orbsmax <= 0.56) {
			counts['Habitable']++;
		  } else if (d.pl_orbsmax < 0.38) {
			counts['Too Cold']++;
		  } else {
			counts['Too Hot']++;
		  }
		  break;
		case 'M':
		  if (d.pl_orbsmax >= 0.08 && d.pl_orbsmax <= 0.12) {
			counts['Habitable']++;
		  } else if (d.pl_orbsmax < 0.08) {
			counts['Too Cold']++;
		  } else {
			counts['Too Hot']++;
		  }
		  break;
		default:
		  break;
	  }
	});
	// Convert the counts object to an array of objects
	const dataArray = [];
	for (let key in counts) {
		dataArray.push({habitable: key, count: counts[key]});
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
	.domain(dataArray.map(d => d.habitable))
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
	.text("Exoplanets by Habitability");

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
		.attr('x', d => vis.xScale(d.habitable))
		.attr('y', d => vis.yScale(d.count))
		.attr('width', vis.xScale.bandwidth())
		.attr('height', d => vis.config.containerHeight - vis.config.margin.top - vis.yScale(d.count))
		.style('fill', '#a1e9f7')
		.attr('class', (d) => d.habitable.replace(/\s+/g, '-').toLowerCase());

	vis.rects.on('mouseover', (event, d) => {
		console.log("." + d.habitable.replace(/\s+/g, '-').toLowerCase());
		d3.select("." + d.habitable.replace(/\s+/g, '-').toLowerCase())
			.style('filter', 'brightness(92%)');
		})
	
	vis.rects.on('mouseleave', (event, d) => {
		d3.select("." + d.habitable.replace(/\s+/g, '-').toLowerCase())
			.style('filter', 'none');
		});
  }
}
