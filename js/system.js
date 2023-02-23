class System {

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
    this.brushEnabled = false;
    this.initVis();
  }
  
  initVis() {
    let vis = this;

    vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
    vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

    vis.svg = d3.select(vis.config.parentElement)
      .append('svg')
      .attr('viewBox', `0 0 ${vis.width} ${vis.height}`)
      .attr('width', '100%')
      .attr('height', '100%');

  }

  updateVis() {
    let vis = this;

    let minOrbsmax = d3.min(vis.data, d => d.pl_orbsmax);
    let maxOrbsmax = d3.max(vis.data, d => d.pl_orbsmax);

    // Create an xScale
    let xScale = d3.scaleLinear()
      .domain([minOrbsmax, maxOrbsmax])
      .range([vis.width/2 + 100, vis.width/2 + 400]);

    let data = vis.data;
    console.log(vis.width)
    console.log(vis.height)
    // Remove any existing circles

    vis.svg.selectAll('.star').remove();
    vis.svg.selectAll('.planet').remove();

    // Append a circle for each data point
    vis.svg.selectAll('.star')
      .data(vis.data)
      .enter()
      .append('circle')
      .attr('class', 'star')
      .attr('r', d => (d.st_rad * 50))
      .attr('fill', 'orange')
      .attr('cx', vis.width/2)
      .attr('cy', vis.height/2)
      .on('mouseover', (event, d) => {
        d3.select('#system-tooltip')
          .style('display', 'block')
          .style('left', (event.pageX + 15) + 'px')   
          .style('top', (event.pageY + 15) + 'px')
          .html(`
            <div class="tooltip-title">${d.hostname}</div>
            <ul>
              <li>${d.st_rad} Re</li>
              <li>${d.st_mass} Me</li>
            </ul>
          `);
      })
      .on('mouseleave', () => {
        d3.select('#system-tooltip').style('display', 'none');
      });

    vis.svg.selectAll('.planet')
      .data(vis.data)
      .enter()
      .append('circle')
      .attr('class', 'planet')
      .attr('r', d => (d.pl_rade * 5))
      .attr('fill', 'blue')
      .attr('cx', d => xScale(d.pl_orbsmax))
      .attr('cy', vis.height/2)
      .on('mouseover', (event, d) => {
        d3.select('#system-tooltip')
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
        d3.select('#system-tooltip').style('display', 'none');
      });
  }

  renderVis(brushEnabled) {
    let vis = this;

    
      
  }

}

