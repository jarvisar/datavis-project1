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
      .join('svg')
      .attr('width', vis.width)
      .attr('height', vis.width)
      .attr('x', 0)
      .attr('y', 0);

    vis.svg.append("text")
      .attr("x", vis.width/2)
      .attr("y", 20)
      .attr("text-anchor", "middle")
      .style("font-family", "Roboto")
      .style("font-size", "24px")
      .text("Host System Viewer")
      .attr('class', 'chart-title');

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

    let starColorScale = d3.scaleOrdinal()
      .domain(['A', 'F', 'G', 'K', 'M'])
      .range(['#ffffff', '#fff5ee', '#ffff00', '#ffa500', '#ff0000']);

    vis.svg.selectAll('.star').remove();
    vis.svg.selectAll('.planet').remove();

    // Create a linear gradient for the star stroke
    const starGradient = vis.svg.append("defs")
      .append("linearGradient")
      .attr("id", "star-gradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "100%");

    // Add color stops to the gradient
    starGradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#ffffff")
      .attr("stop-opacity", 0.8);

    starGradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#808080")
      .attr("stop-opacity", 0.8);

    // Append a star circle for each data point
    vis.svg.selectAll('.star')
      .data(vis.data)
      .enter()
      .append('circle')
      .attr('class', 'star')
      .attr('r', d => (d.st_rad * 50))
      .attr('fill', d => {
        if (d.st_spectype) {
          let letter = d.st_spectype[0];
          return starColorScale(letter);
        } else {
          return '#808080'; // Default color if st_spectype is undefined or null
        }
      })
      .attr('stroke', 'url(#star-gradient)')
      .attr('stroke-width', 2)
      .attr('cx',10)
      .attr('cy', vis.height/2)
      .on('mouseover', (event, d) => {
        d3.select('#system-tooltip')
          .style('display', 'block')
          .style('left', (event.pageX + 15) + 'px')   
          .style('top', (event.pageY + 15) + 'px')
          .html(`
            <div class="tooltip-title">Star Name: ${d.hostname}</div>
            <ul>
              <li>Radius: ${d.st_rad} Re</li>
              <li>Mass: ${d.st_mass} Me</li>
              <li>Type: ${d.st_spectype} Me</li>
            </ul>
          `);
      })
      .on('mouseleave', () => {
        d3.select('#system-tooltip').style('display', 'none');
      });

      const planetColorScale = d3.scaleOrdinal()
        .domain(['Asteroidan', 'Mercurian', 'Subterran', 'Terran', 'Superterran', 'Neptunian', 'Jovian'])
        .range(['#555555', 'grey', 'yellow', 'green', 'brown', 'blue', 'orange']);

      const planetGradient = vis.svg.append("defs")
        .append("radialGradient")
        .attr("id", "planet-shadow")
        .attr("cx", "50%")
        .attr("cy", "50%")
        .attr("r", "50%")
        .attr("fx", "80%")
        .attr("fy", "50%");
      
      planetGradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", "#000000")
        .attr("stop-opacity", 0.8);
      
      planetGradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", "#ffffff")
        .attr("stop-opacity", 0.0);

      const planetLinearGradient = vis.svg.append("defs")
        .append("linearGradient")
        .attr("id", "planet-gradient")
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "100%")
        .attr("y2", "100%");
        
      planetLinearGradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", "#ffffff")
        .attr("stop-opacity", 0.8);
        
      planetLinearGradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", "#000000")
        .attr("stop-opacity", 0.8);

      vis.svg.selectAll('.planet')
        .data(vis.data)
        .enter()
        .append('circle')
        .attr('class', 'planet')
        .attr('r', d => (d.pl_rade * 7))
        .attr('fill', d => planetColorScale(getPlanetType(d.pl_bmasse)))
        .attr('cx', d => xScale(d.pl_orbsmax))
        .attr('stroke', 'url(#planet-gradient)') // Add the planet gradient as the stroke
        .style('filter', 'url(#planet-shadow)') // Add the radial shadow as a filter to the circle
        .style('box-shadow', '0px 0px 10px rgba(0, 0, 0, 0.8)') // Add the radial shadow as a CSS box-shadow property to the circle
        .attr('cy', vis.height/2)
        .on('mouseover', (event, d) => {
          const planetType = getPlanetType(d.pl_bmasse);
          d3.select('#system-tooltip')
            .style('display', 'block')
            .style('left', (event.pageX + 15) + 'px')   
            .style('top', (event.pageY + 15) + 'px')
            .html(`
              <div class="tooltip-title">${d.pl_name}</div>
              <ul>
                <li>Radius: ${d.pl_rade} Re</li>
                <li>Mass: ${d.pl_bmasse} Me</li>
                <li>Type: ${planetType}</li>
              </ul>
            `);
        })
        .on('mouseleave', () => {
          d3.select('#system-tooltip').style('display', 'none');
        });

        function getPlanetType(mass) {
          if (mass < 0.00001) {
            return 'Asteroidan';
          } else if (mass >= 0.00001 && mass < 0.1) {
            return 'Mercurian';
          } else if (mass >= 0.1 && mass < 0.5) {
            return 'Subterran';
          } else if (mass >= 0.5 && mass < 2) {
            return 'Terran';
          } else if (mass >= 2 && mass < 10) {
            return 'Superterran';
          } else if (mass >= 10 && mass < 50) {
            return 'Neptunian';
          } else if (mass >= 50 && mass <= 5000) {
            return 'Jovian';
          } else {
            return 'Unknown';
          }
        }
        
  }

  

  renderVis(brushEnabled) {
    let vis = this;

    
      
  }

}
