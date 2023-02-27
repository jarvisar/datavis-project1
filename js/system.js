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
    let minOrbsmax = d3.min(vis.data, d => parseFloat(d.pl_orbsmax));
    let maxOrbsmax = d3.max(vis.data, d => parseFloat(d.pl_orbsmax));

    // Create an xScale
    if (vis.data[0].st_rad == ""){
      vis.xScale = d3.scaleLinear()
        .domain([minOrbsmax, maxOrbsmax])
        .range([((50) + 110 + (parseFloat(vis.data[0].pl_rade) * 3)), vis.width - (parseFloat(vis.data[0].pl_rade) * 3) - 30]);
    } else {
      vis.xScale = d3.scaleLinear()
        .domain([minOrbsmax, maxOrbsmax])
        .range([((parseFloat(vis.data[0].st_rad) * 50) + 110 + (parseFloat(vis.data[0].pl_rade) * 3)), vis.width - (parseFloat(vis.data[0].pl_rade) * 3) - 30]);
    }

    vis.rScale = d3.scaleLog()
      .domain(d3.extent(vis.data, d => parseFloat(d.pl_rade)))
      .range([5, 20]);

    let starColorScale = d3.scaleOrdinal()
      .domain([undefined, 'A', 'B', 'F', 'G', 'K', 'M'])
      .range(['#6ebfc2', '#eaeaea', '#424fdb', '#e8ed9a', '#d8e617', '#eda218', '#c94134']);

    vis.svg.selectAll('.star').remove();
    vis.svg.selectAll('.planet').remove();
    vis.svg.selectAll('.system-description').remove();
    vis.svg.selectAll('.star-name').remove();
    vis.svg.selectAll('.planet-name').remove();
    vis.svg.selectAll('.no-data').remove();
    vis.svg.selectAll('.orbit').remove();
    
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
        d3.select('#system-tooltip')
          .style('display', 'block')
          .style('left', (event.pageX + 15) + 'px')   
          .style('top', (event.pageY + 15 - window.pageYOffset) + 'px')
          .html(`
            <div class="tooltip-title"><b>${d.hostname}</b></div>
            <div><i>${d.st_spectype != "" ? d.st_spectype + " Star" : "Unknown Star Type"}</i></div>
            <ul>
              <li>Radius: ${d.st_rad} solar units</li>
              <li>Mass: ${d.st_mass} solar units</li>

            </ul>
          `);
      })
      .on('mouseleave', () => {
        d3.select('#system-tooltip').style('display', 'none');
      });

    vis.svg.append('text')
      .attr('x', (vis.data[0].st_rad * 50) + 20)
      .attr('y', ((vis.height/2) - (vis.data[0].st_rad * 50) - 20))
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

    vis.orbits = vis.svg.selectAll('.orbit')
      .data(vis.data)
      .enter()
      .append('circle')
      .attr('class', 'orbit')
      .attr('cx', d => (d.st_rad * 50) + 20)
      .attr('cy', vis.height/2)
      .attr('r', d => vis.xScale(d.pl_orbsmax) - (d.st_rad * 50) - 20)
      .attr('stroke', 'gray')
      .attr('stroke-width', 1)
      .attr('fill', 'none');

    let unknownOffset = 0;
    vis.planets = vis.svg.selectAll('.planet')
      .data(vis.data)
      .enter()
      .append('circle')
      .attr('class', 'planet')
      .attr('r', d => vis.rScale(parseFloat(d.pl_rade)))
      .attr('fill', d => vis.planetColorScale(d.planetType))
      .attr('cx', d => {
        if (d.pl_orbsmax != ""){
          return vis.xScale(d.pl_orbsmax)
        } else {
          let offset = unknownOffset;
          unknownOffset += (vis.rScale(parseFloat(d.pl_rade)) * 2) + 10;
          return vis.rScale(parseFloat(d.pl_rade)) + 10 + offset;
      }})
      .attr('stroke', 'url(#planet-gradient)')
      .style('filter', 'url(#planet-shadow)')
      .style('box-shadow', '0px 0px 10px rgba(0, 0, 0, 0.8)')
      .attr('cy', d => {
        if (d.pl_orbsmax != ""){
          console.log(d.pl_orbsmax);
          return vis.height/2;
        } else {
          return vis.height - vis.rScale(parseFloat(d.pl_rade)) - 10;
      }})
      .on('mouseover', (event, d) => {
        d3.select('#system-tooltip')
          .style('display', 'block')
          .style('left', (event.pageX + 15) + 'px')   
          .style('top', (event.pageY + 15 - window.pageYOffset) + 'px')
          .html(`
            <div class="tooltip-title"><b>${d.pl_name}</b></div>
            <div><i>${d.planetType} Planet</i></div>
            <ul>
              <li>Radius: ${d.pl_rade} Re</li>
              <li>Mass: ${d.pl_bmasse} Me</li>
              <li>Orbital Axis: ${d.pl_orbsmax == "" ? "Unknown" : d.pl_orbsmax} au</li>
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

