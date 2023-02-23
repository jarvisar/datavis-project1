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

    // Append a circle for each data point
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
      .attr('cx', vis.width/2)
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

      vis.svg.selectAll('.planet')
        .data(vis.data)
        .enter()
        .append('circle')
        .attr('class', 'planet')
        .attr('r', d => (d.pl_rade * 7))
        .attr('fill', d => {
          const mass = d.pl_bmasse;
          if (mass < 0.00001) {
            return '#555555'; // asteroidan
          } else if (mass >= 0.00001 && mass < 0.1) {
            return 'grey'; // mercurian
          } else if (mass >= 0.1 && mass < 0.5) {
            return 'yellow'; // subterran
          } else if (mass >= 0.5 && mass < 2) {
            return 'green'; // terran
          } else if (mass >= 2 && mass < 10) {
            return 'brown'; // superterran
          } else if (mass >= 10 && mass < 50) {
            return 'blue'; // Neptunian
          } else if (mass >= 50 && mass <= 5000) {
            return 'orange'; // Jovian
          } else {
            return 'black'; // default color
          }
        })
        .attr('cx', d => xScale(d.pl_orbsmax))
        .attr('cy', vis.height/2)
        .on('mouseover', (event, d) => {
          let planetType = "";
          if (d.pl_bmasse < 0.00001) {
            planetType = "Asteroidan";
          } else if (d.pl_bmasse >= 0.00001 && d.pl_bmasse < 0.1) {
            planetType = "Mercurian";
          } else if (d.pl_bmasse >= 0.1 && d.pl_bmasse < 0.5) {
            planetType = "Subterran";
          } else if (d.pl_bmasse >= 0.5 && d.pl_bmasse < 2) {
            planetType = "Terran";
          } else if (d.pl_bmasse >= 2 && d.pl_bmasse < 10) {
            planetType = "Superterran";
          } else if (d.pl_bmasse >= 10 && d.pl_bmasse < 50) {
            planetType = "Neptunian";
          } else if (d.pl_bmasse >= 50 && d.pl_bmasse <= 5000) {
            planetType = "Jovian";
          }
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
  }

  renderVis(brushEnabled) {
    let vis = this;

    
      
  }

}

