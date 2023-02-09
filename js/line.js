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
      
    let vis = this; //this is a keyword that can go out of scope, especially in callback functions, 
                    //so it is good to create a variable that is a reference to 'this' class instance

    //set up the width and height of the area where visualizations will go- factoring in margins               
    vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
    vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

    //reusable functions for x and y 
        //if you reuse a function frequetly, you can define it as a parameter
        //also, maybe someday you will want the user to be able to re-set it.
    vis.xValue = d => d.key; 
    vis.yValue = d => d.count;

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
        .call(vis.xAxis);
    
    // Append y-axis group
    vis.yAxisG = vis.chart.append('g')
        .attr('class', 'axis y-axis')
        .call(vis.yAxis); 

        // Empty tooltip group (hidden by default)
    vis.tooltip = vis.chart.append('g')
        .attr('class', 'tooltip')
        .style('display', 'none');

    vis.tooltip.append('circle')
        .attr('r', 4);

    vis.tooltip.append('text');

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
            
            vis.tooltip.select('text')
                .attr('transform', `translate(${vis.xScale(d.key )},${(vis.yScale(d.count) - 15)})`)
                .text(Math.round(d.count) + " Exoplanets")
                .style('z-index', '10');
  
             vis.tooltip.select('rect')
                  .attr('transform', `translate(${vis.xScale(d.key)},${0})`)
                  .style('z-index', '10');
        })
        .on('click', function(event){
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
        })

            
    vis.updateVis();


  }


  //leave this empty for now
 updateVis() { 
    let vis = this;

   // Initialize area generator- helper function 
    vis.area = d3.area()
        .x(d => vis.xScale(vis.xValue(d)))
        .y1(d => vis.yScale(vis.yValue(d)))
        .y0(vis.height);

    // Add area path
    vis.chart.append('path')
        .data([vis.data]) 
        .attr('fill', '#e9eff5')
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
        .attr('d', vis.line)
        .style('z-index', '5');

 }


 //leave this empty for now...
 renderVis() { 
    
  }



}