class Scatterplot {

  /**
   * Class constructor with basic chart configuration
   * @param {Object}
   * @param {Array}
   */
  constructor(_config, _data, _callback) {
    // Configuration object with defaults
    // Important: depending on your vis and the type of interactivity you need
    // you might want to use getter and setter methods for individual attributes
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: _config.containerWidth || 600,
      containerHeight: _config.containerHeight || 400,
      margin: _config.margin || {top: 25, right: 20, bottom: 20, left: 35}
    }
    this.data = _data;
    this.callback = _callback;
    this.selectedValues = [];
    this.initVis();
  }
  
  /**
   * This function contains all the code that gets excecuted only once at the beginning.
   * (can be also part of the class constructor)
   * We initialize scales/axes and append static elements, such as axis titles.
   * If we want to implement a responsive visualization, we would move the size
   * specifications to the updateVis() function.
   */
  initVis() {
    // We recommend avoiding simply using the this keyword within complex class code
    // involving SVG elements because the scope of this will change and it will cause
    // undesirable side-effects. Instead, we recommend creating another variable at
    // the start of each function to store the this-accessor
    let vis = this;

    // Calculate inner chart size. Margin specifies the space around the actual chart.
    // You need to adjust the margin config depending on the types of axis tick labels
    // and the position of axis titles (margin convetion: https://bl.ocks.org/mbostock/3019563)
    vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
    vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

 
    vis.xScale = d3.scaleLinear()
        .range([0, vis.width]);

    vis.yScale = d3.scaleLinear()
        .range([vis.height, 0]);

    // Initialize axes
    vis.xAxis = d3.axisBottom(vis.xScale)
        .ticks(6)
        .tickSize(-vis.height - 10)
        .tickPadding(10)
        .tickFormat(d => d + ' km');

    vis.yAxis = d3.axisLeft(vis.yScale)
        .ticks(6)
        .tickSize(-vis.width - 10)
        .tickPadding(10);


    // Define size of SVG drawing area
    vis.svg = d3.select(vis.config.parentElement)
        .attr('width', vis.config.containerWidth)
        .attr('height', vis.config.containerHeight);
        vis.svg.selectAll('.axis').remove();
 
    vis.svg.selectAll('.axis-title').remove();
    // Append group element that will contain our actual chart 
    // and position it according to the given margin config
    vis.chart = vis.svg.append('g')
        .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

    // Append empty x-axis group and move it to the bottom of the chart
    vis.xAxisG = vis.chart.append('g')
        .attr('class', 'axis x-axis')
        .attr('transform', `translate(0,${vis.height})`);
    
    // Append y-axis group
    vis.yAxisG = vis.chart.append('g')
        .attr('class', 'axis y-axis');

    // Append both axis titles
    vis.chart.append('text')
        .attr('class', 'axis-title')
        .attr('y', vis.height + 5)
        .attr('x', vis.width + 10)
        .attr('dy', '.71em')
        .style('text-anchor', 'end')
        .text('Radius');

    vis.svg.append('text')
        .attr('class', 'axis-title')
        .attr('x', 0)
        .attr('y', 0)
        .attr('dy', '.71em')
        .text('Mass');

    // Specificy accessor functions
    vis.xValue = d => d.pl_rade;
    vis.yValue = d => d.pl_bmasse;

    // Set the scale input domains
    vis.xScale.domain([0, d3.max(vis.data, vis.xValue)]);
    vis.yScale.domain([0, d3.max(vis.data, vis.yValue)]);

    vis.updateVis();
  }

  /**
   * This function contains all the code to prepare the data before we render it.
   * In some cases, you may not need this function but when you create more complex visualizations
   * you will probably want to organize your code in multiple functions.
   */
  updateVis() {
    let vis = this;
    
   
    
    vis.renderVis();
  }

  /**
   * This function contains the D3 code for binding data to visual elements.
   * We call this function every time the data or configurations change.
   */
  renderVis() {
    let vis = this;
    vis.svg.selectAll('.point').remove();
    
    // Add circles
    const circles = vis.chart.selectAll('.point')
        .data(vis.data)
        .enter()
      .append('circle')
        .attr('class', 'point')
        .attr('r', 4)
        .attr('cy', d => vis.yScale(vis.yValue(d)))
        .attr('cx', d => vis.xScale(vis.xValue(d)))
        .attr('fill', "#69b3a2")

    // Update the axes/gridlines
    // We use the second .call() to remove the axis and just show gridlines
    vis.xAxisG
        .call(vis.xAxis)
        .call(g => g.select('.domain').remove());

    vis.yAxisG
        .call(vis.yAxis)
        .call(g => g.select('.domain').remove())

    // Define scales
    const xScale = d3.scaleLinear()
    .domain(d3.extent(vis.data, d => d.pl_rade)).nice()
    .range([vis.config.margin.left, vis.width - vis.config.margin.right + 50]);

    const yScale = d3.scaleLog()
    .domain(d3.extent(vis.data, d => d.pl_bmasse)).nice()
    .range([vis.height + vis.config.margin.top, 20]);

    // Define brush
    const brush = d3.brush()
    .extent([[vis.config.margin.left, vis.config.margin.top], [vis.width + vis.config.margin.right + vis.config.margin.left, vis.height + vis.config.margin.top]])
    .on("start brush", brushed)
    .on("end", applyFilter);
    
    vis.svg.call(brush);

    

    function brushed({selection}) {
      vis.selectedValues = [];
      if (selection) {
          const [[x0, y0], [x1, y1]] = selection;
          vis.selectedValues = vis.data.filter(d => xScale(d.pl_rade) >= x0 && xScale(d.pl_rade) < x1 && yScale(d.pl_bmasse) >= y0 && yScale(d.pl_bmasse) < y1);
          console.log(vis.selectedValues);
          circles
              .style("stroke", "transparent")
              .filter(d => xScale(d.pl_rade) >= x0 && xScale(d.pl_rade) < x1 && yScale(d.pl_bmasse) >= y0 && yScale(d.pl_bmasse) < y1)
              .style("stroke", "steelblue");
      } else {
          circles.style("stroke", "transparent");
          vis.selectedValues = vis.data;
      }
      
    }

    function applyFilter({selection}) {
      vis.selectedValues = [];
      if (selection) {
          const [[x0, y0], [x1, y1]] = selection;
          vis.selectedValues = vis.data.filter(d => xScale(d.pl_rade) >= x0 && xScale(d.pl_rade) < x1 && yScale(d.pl_bmasse) >= y0 && yScale(d.pl_bmasse) < y1);
          vis.callback(vis.selectedValues);
          circles
              .style("stroke", "transparent")
              .filter(d => xScale(d.pl_rade) >= x0 && xScale(d.pl_rade) < x1 && yScale(d.pl_bmasse) >= y0 && yScale(d.pl_bmasse) < y1)
              .style("stroke", "steelblue");
      } else {
          circles.style("stroke", "transparent");
          vis.selectedValues = vis.data;
      }
      //vis.callback(value);
    }

    circles
    .style("stroke", "transparent")
    .filter(d => vis.selectedValues.includes(d))
    .style("stroke", "steelblue");

    // Add a div for the tooltip
    d3.select("body")
    .append("div")
    .attr("id", "scatterplot-tooltip")
    .style("display", "none")
    .style("position", "absolute")
    .style("z-index", "10")
    .style("background-color", "white")
    .style("padding", "10px")
    .style("border", "1px solid #ddd");

    // Tooltip event listeners
    circles
      .on('mouseover', (event,d) => {
        d3.select('#scatterplot-tooltip')
          .style('display', 'block')
          .style('left', (event.pageX + 15) + 'px')   
          .style('top', (event.pageY + 15) + 'px')
          .html(`
            <div class="tooltip-title">${d.pl_name}</div>
            <ul>
              <li>${d.pl_rade} Re</li>
              <li>${d.pl_bmasse} Me</li>
            </ul>
          `);
      })
      .on('mouseleave', () => {
        d3.select('#scatterplot-tooltip').style('display', 'none');
      });
    
  }

  /**
   * Change the position slightly to better see if multiple symbols share the same coordinates (test)
   */
  jitter(value) {
    var num = Math.floor(Math.random()*5) + 1; // this will get a number between 1 and 5;
    num *= Math.round(Math.random()) ? 1 : -1; // this will add minus sign in 50% of cases
    console.log(num);
    return value + num;
  }
}


