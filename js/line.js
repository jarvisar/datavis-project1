class Line {

  constructor(_config, _data, _callback) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: _config.containerWidth || 500,
      containerHeight: _config.containerHeight || 140,
      margin: { top: 10, bottom: 30, right: 50, left: 50 }
    }

    this.data = _data;
    this.callback = _callback;

    // Call a class function
    this.initVis();
  }

  initVis() {
      
    let vis = this;

    //set up the width and height of the area where visualizations will go- factoring in margins               
    vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
    vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

    //reusable functions for x and y 
        //if you reuse a function frequetly, you can define it as a parameter
        //also, maybe someday you will want the user to be able to re-set it.
    vis.xValue = d => d.key; 
    vis.yValue = d => d.count;

    this.updateVis(true);
  }


  //leave this empty for now
 updateVis(firstTime = false) { 
    let vis = this
    const formatYear = d3.format("");

    if (firstTime != true){
        vis.svg.selectAll('path').remove()
        vis.svg.selectAll('.axis').remove()
        vis.svg.selectAll('text').remove()
    }

    //setup scales
    vis.xScale = d3.scaleLinear()
        .domain(d3.extent(vis.data, vis.xValue)) //d3.min(vis.data, d => d.year), d3.max(vis.data, d => d.year) );
        .range([0, vis.width]);

    vis.yScale = d3.scaleLinear()
        .domain( d3.extent(vis.data, vis.yValue) )
        .range([vis.height, 0])
        .nice(); //this just makes the y axes behave nicely by rounding up

    // Define size of SVG drawing area
    vis.svg = d3.select(vis.config.parentElement)
        .attr('width', vis.config.containerWidth)
        .attr('height', vis.config.containerHeight);

    // Append group element that will contain our actual chart (see margin convention)
    vis.chart = vis.svg.append('g')
        .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

    // Initialize axes
    vis.xAxis = d3.axisBottom(vis.xScale);
    vis.yAxis = d3.axisLeft(vis.yScale);

    // Append x-axis group and move it to the bottom of the chart
    vis.xAxisG = vis.chart.append('g')
        .attr('class', 'axis x-axis')
        .attr('transform', `translate(0,${vis.height})`)
        .call(d3.axisBottom(vis.xScale).tickFormat(formatYear).ticks(6));
    
    // Append y-axis group
    vis.yAxisG = vis.chart.append('g')
        .attr('class', 'axis y-axis')
        .call(vis.yAxis); 

    vis.charttitle = vis.svg.append("text")
		.attr("x", vis.width/2 + vis.config.margin.left)
		.attr("y", 20)
		.attr("text-anchor", "middle")
		.style("font-family", "Roboto")
		.style("font-size", "16px")
		.text("Exoplanets by Discovery Year")
		.attr('class', 'chart-title');

    vis.charttitle = vis.svg.append("text")
        .attr("x", vis.width/2 + vis.config.margin.left)
        .attr("y", vis.height + 40)
        .attr("text-anchor", "middle")
        .style("font-family", "Roboto")
        .style("font-size", "14px")
        .text("Discovery Year")
        .attr('class', 'axis-title');
            
    // Initialize area generator- helper function 
    vis.area = d3.area()
        .x(d => vis.xScale(vis.xValue(d)))
        .y1(d => vis.yScale(vis.yValue(d)))
        .y0(vis.height);

    // Add area path
    vis.chart.append('path')
        .data([vis.data]) 
        .attr('fill', '#e9eff5')
        .attr('class', 'path')
        .attr('d', vis.area);

    //Initialize line generator helper function
    vis.line = d3.line()
        .x(d => vis.xScale(vis.xValue(d)))
        .y(d => vis.yScale(vis.yValue(d)));

    // Add line path 
    vis.chart.append('path')
        .data([vis.data])
        .attr('stroke',  '#8693a0')
        .attr('stroke-width', 2)
        .attr('fill', 'none')
        .attr('class', 'path')
        .attr('d', vis.line)
        .style('z-index', '5');

    // Empty tooltip group (hidden by default)
    vis.tooltip = vis.chart.append('g')
        .attr('class', 'tooltip')
        .style('display', 'none');

    vis.tooltip.append('circle')
        .attr('r', 4)
        .style('stroke', '#104494')
        .style('stroke-width', 1.5)
        .attr('fill', 'transparent');

    vis.bisectYear = d3.bisector(d => d.key).left;
    const trackingArea = vis.chart.append('rect')
        .attr('width', vis.width)
        .attr('height', vis.height)
        .attr('fill', 'none')
        .attr('pointer-events', 'all')
        .on('mouseenter', () => {
            vis.tooltip.style('display', 'block');
        })
        .on('mouseleave', () => {
        vis.tooltip.style('display', 'none');
        d3.select('#scatterplot-tooltip').style('display', 'none');
        })
        .on('mousemove', function(event) {
            // Get date that corresponds to current mouse x-coordinate
            const xPos = d3.pointer(event, this)[0]; // First array element is x, second is y
            const key = vis.xScale.invert(xPos);
            
            // Find nearest data point
            const index = vis.bisectYear(vis.data, key, 1);
            const a = vis.data[index - 1];
            const b = vis.data[index];
            const d = b && (key - a.key > b.key - key) ? b : a; 

            // Update tooltip
            vis.tooltip.select('circle')
                .attr('transform', `translate(${vis.xScale(d.key)},${vis.yScale(d.count)})`)
                .style('z-index', '10');

            d3.select('#year-tooltip')
                .style('display', 'block')
                .style('left', (vis.xScale(d.key)) + 'px')   
                .style('top', (vis.yScale(d.count)) + 'px')
                .html(`
                  <div style="text-align: center"><b>${d.key}</b></div>
                  <div style="text-align: center">${d.count} Exoplanets</div>
                `);
        })
        .on('click', function(event){
            vis.tooltip.style('display', 'none');
            trackingArea.on('mousemove', null);
            // Get date that corresponds to current mouse x-coordinate
            const xPos = d3.pointer(event, this)[0]; // First array element is x, second is y
            const key = vis.xScale.invert(xPos);

            // Find nearest data point
            const index = vis.bisectYear(vis.data, key, 1);
            const a = vis.data[index - 1];
            const b = vis.data[index];
            const d = b && (key - a.key > b.key - key) ? b : a; 
            console.log(d.key);
            vis.callback(d.key);
        });
 }

}