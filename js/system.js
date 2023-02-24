class System {

  /**
   * Class constructor with basic chart configuration
   * @param {Object}
   * @param {Array}
   */
  constructor(_config, _data, _globalData) {
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
    this.globalData = _globalData;
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
      .attr('height', vis.height)
      .attr('x', 0)
      .attr('y', 0);

    vis.svg.append("text")
      .attr("x", vis.width/2)
      .attr("y", 30)
      .attr("text-anchor", "middle")
      .style("font-family", "Roboto")
      .style("font-size", "24px")
      .text("Host System Viewer")
      .style('text-decoration', 'underline')
      .attr('class', 'chart-title');

    vis.chart = vis.svg.append('g')
      .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

    vis.chart.append('defs')
      .append('clipPath')
      .attr('id', 'clipSys')
      .attr('class', 'clip')
      .append('rect')
      .attr('width', vis.width)
      .attr('height', vis.height);

    vis.chartHolder = vis.chart.append('g') 
      .attr('clip-path', 'url(#clipSys)');
  }

  updateVis() {
    let vis = this;
    console.log(vis.globalData);
    let minOrbsmax = d3.min(vis.data, d => d.pl_orbsmax);
    let maxOrbsmax = d3.max(vis.data, d => d.pl_orbsmax);

    // Create an xScale
    vis.xScale = d3.scaleLinear()
      .domain([minOrbsmax, maxOrbsmax])
      .range([((vis.data[0].st_rad * 50) + 100 + (vis.data[0].pl_rade * 3)), vis.width - (vis.data[0].pl_rade * 3) - 30]);

    vis.rScale = d3.scaleLog()
      .domain(d3.extent(vis.data, d => parseFloat(d.pl_bmasse)))
      .range([5, 15]);

    let data = vis.data;
    console.log(vis.width)
    console.log(vis.height)
    // Remove any existing circles

    let starColorScale = d3.scaleOrdinal()
      .domain(['A', 'F', 'G', 'K', 'M'])
      .range(['#ffffff', '#fff5ee', '#ffff00', '#ffa500', '#ff0000']);

    vis.svg.selectAll('.star').remove();
    vis.svg.selectAll('.planet').remove();
    vis.svg.selectAll('.system-description').remove();
    vis.svg.selectAll('.star-name').remove();
    vis.svg.selectAll('.planet-name').remove();
    vis.svg.selectAll('.no-data').remove();
    
    vis.svg.append("text")
      .attr("x", vis.width/2)
      .attr("y", vis.height - 10)
      .attr("text-anchor", "middle")
      .style("font-family", "Roboto")
      .style("font-size", "18px")
      .text( "This system consists of " + vis.data.length + (vis.data.length == 1 ? " planet" : " planets") + (vis.data[0].sy_dist != undefined ? " and is " + vis.data[0].sy_dist + " parsecs away from Earth" : "") + ".")
      .attr('class', 'system-description');

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
      .attr('cx', d => (d.st_rad * 50) + 20)
      .attr('cy', vis.height/2)
      .on('mouseover', (event, d) => {
        console.log("test")
        d3.select('#system-tooltip')
          .style('display', 'block')
          .style('left', (event.pageX + 15) + 'px')   
          .style('top', (event.pageY + 15 - window.pageYOffset) + 'px')
          .html(`
            <div class="tooltip-title">${d.hostname}</div>
            <ul>
              <li>Radius: ${d.st_rad} solar units</li>
              <li>Mass: ${d.st_mass} solar units</li>
              <li>Type: ${d.st_spectype != "" ? d.st_spectype : " <i>Type Not Available</i>"}</li>
            </ul>
          `);
      })
      .on('mouseleave', () => {
        d3.select('#system-tooltip').style('display', 'none');
      });

    vis.svg.append('text')
      .attr('x', (vis.data[0].st_rad * 50) + 25)
      .attr('y', ((vis.height/2) - (vis.data[0].st_rad * 50) - 40))
      .attr("text-anchor", "middle")
      .attr('class', "star-name")
      .text(vis.data[0].hostname)
      .style('pointer-events', 'none');

    if (vis.data[0].st_rad == ""){
      vis.svg.append('text')
      .attr('x', vis.width/2)
      .attr("y", vis.height - 50)
      .attr("text-anchor", "middle")
      .attr('class', "no-data")
      .text("Stellar Data Not Available")
      .style('text-decoration', 'underline');

      vis.svg.select('.star-name')
      .attr('x', vis.width/2)
      .attr("y", vis.height - 70)
    }

    vis.planetColorScale = d3.scaleOrdinal()
      .domain(['Asteroidan', 'Mercurian', 'Subterran', 'Terran', 'Superterran', 'Neptunian', 'Jovian'])
      .range(['#555555', 'grey', 'yellow', 'green', 'brown', 'blue', 'orange']);

    vis.planetGradient = vis.svg.append("defs")
      .append("radialGradient")
      .attr("id", "planet-shadow")
      .attr("cx", "50%")
      .attr("cy", "50%")
      .attr("r", "50%")
      .attr("fx", "80%")
      .attr("fy", "50%");
    
    vis.planetGradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#000000")
      .attr("stop-opacity", 0.8);
    
    vis.planetGradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#ffffff")
      .attr("stop-opacity", 0.0);

    vis.planetLinearGradient = vis.svg.append("defs")
      .append("linearGradient")
      .attr("id", "planet-gradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "100%");
      
    vis.planetLinearGradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#ffffff")
      .attr("stop-opacity", 0.8);
      
    vis.planetLinearGradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#000000")
      .attr("stop-opacity", 0.8);

    console.log(vis.data)
    vis.svg.selectAll('.planet')
      .data(vis.data)
      .enter()
      .append('circle')
      .attr('class', 'planet')
      .attr('r', d => vis.rScale(parseFloat(d.pl_bmasse)))
      .attr('fill', d => vis.planetColorScale(getPlanetType(d.pl_bmasse)))
      .attr('cx', d => vis.xScale(d.pl_orbsmax))
      .attr('stroke', 'url(#planet-gradient)') // Add the planet gradient as the stroke
      .style('filter', 'url(#planet-shadow)') // Add the radial shadow as a filter to the circle
      .style('box-shadow', '0px 0px 10px rgba(0, 0, 0, 0.8)') // Add the radial shadow as a CSS box-shadow property to the circle
      .attr('cy', vis.height/2)
      .on('mouseover', (event, d) => {
        const planetType = getPlanetType(d.pl_bmasse);
        d3.select('#system-tooltip')
          .style('display', 'block')
          .style('left', (event.pageX + 15) + 'px')   
          .style('top', (event.pageY + 15 - window.pageYOffset) + 'px')
          .html(`
            <div class="tooltip-title">${d.pl_name}</div>
            <ul>
              <li>Radius: ${d.pl_rade} Re</li>
              <li>Mass: ${d.pl_bmasse} Me</li>
              <li>Type: ${planetType}</li>
              <li>Orbital Axis: ${d.pl_orbsmax} au</li>
            </ul>
          `);
      })
      .on('mouseleave', () => {
        d3.select('#system-tooltip').style('display', 'none');
      });

    vis.svg.selectAll('.planet-name')
      .data(vis.data)
      .enter()
      .append('text')
      .attr('x', d => vis.xScale(d.pl_orbsmax))
      .attr('y', d => ((vis.height/2) - vis.rScale(parseFloat(d.pl_bmasse)) - 10))
      .attr("text-anchor", "middle")
      .attr('class', "star-name")
      .text(d => d.pl_name)
      .attr("font-size", "12px")
      .style('pointer-events', 'none');

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

