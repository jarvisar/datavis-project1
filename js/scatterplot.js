class Scatterplot {

  constructor(_config, _data, _callback) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: _config.containerWidth || 500,
      containerHeight: _config.containerHeight || 140,
      margin: { top: 40, bottom: 40, right: 30, left: 60 },
      tooltipPadding: _config.tooltipPadding || 15
    }

    this.callback = _callback;
    this.data = _data; 

    this.initVis();
  }

  initVis() {
    let vis = this; 

    // Width and height as the inner dimensions of the chart area- as before
    vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
    vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

    // Define 'svg' as a child-element (g) from the drawing area and include spaces
    // Add <svg> element (drawing space)
    vis.svg = d3.select(vis.config.parentElement)
        .attr('width', vis.config.containerWidth)
        .attr('height', vis.config.containerHeight)

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
      
    //Title
    vis.svg.append("text")
      .attr('transform', `translate(${45}, ${vis.config.margin.top -20 })`)
      .attr("font-size", "16px")
      .attr('text-anchor', 'left')
      .text("Exoplanets by Mass & Radius")
      .style("font-family", "Roboto")
      .style("color", "black");

    // X axis Label    
    vis.svg.append("text")
      .attr("transform", `translate(${vis.width/2 + vis.config.margin.left},${vis.height + vis.config.margin.bottom + 35})`)
      .style("text-anchor", "middle")
      .text("Mass (Earth Mass)")
      .style("font-family", "Roboto")
      .style("color", "black")
      .style("font-size", "14px");

    vis.svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -(vis.height/2) - vis.config.margin.top)
      .attr("y", 15)
      .style("text-anchor", "middle")
      .text("Radius (Earth Radius)")
      .style("font-family", "Roboto")
      .style("color", "black")
      .style("font-size", "14px");

    vis.brushSvg = vis.svg.append('g')
      .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

    vis.chart = vis.svg.append('g')
      .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

    vis.xAxisLine = vis.chart.append("line")
      .attr("x1", 0)
      .attr("y1", vis.height)
      .attr("x2", vis.width)
      .attr("y2", vis.height)
      .attr("stroke", "black")
      .attr("stroke-width", 1);

    vis.yAxisLine = vis.chart.append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", 0)
        .attr("y2", vis.height)
        .attr("stroke", "black")
        .attr("stroke-width", 1);

    vis.updateVis(); //call updateVis() at the end - we aren't using this yet. 
  }


  updateVis() {
    let vis = this;

    vis.svg.selectAll('.y-axis').remove();
    vis.svg.selectAll('.x-axis').remove();
    vis.svg.selectAll('.axis-grid').remove();
    vis.svg.selectAll('.chart').remove();
    vis.svg.selectAll('.planet').remove();
    vis.chart.selectAll('text').remove();

    vis.brushSvgHolder = vis.brushSvg.append('g')
      .attr("class","planet")

    vis.xScale = d3.scaleLog()
      .domain([d3.min(vis.data, d => parseFloat(d.pl_bmasse)), d3.max( vis.data, d => parseFloat(d.pl_bmasse))])
      .range([0, vis.width]);

    vis.yScale = d3.scaleLog()
      .domain([d3.max(vis.data, d => parseFloat(d.pl_rade)), d3.min( vis.data, d => parseFloat(d.pl_rade))]) 
      .range([0, vis.height])
      .nice();

    // Initialize axes
    vis.xAxis = d3.axisBottom(vis.xScale)
      .tickFormat(d3.format('.2f'))
      .ticks(3);

    vis.yAxis = d3.axisLeft(vis.yScale)
      .tickFormat(d3.format('.2f'))
      .ticks(3);

    vis.xAxisGrid = d3.axisBottom(vis.xScale).tickSize(-vis.height).tickFormat('').ticks(3);
    vis.yAxisGrid = d3.axisLeft(vis.yScale).tickSize(-vis.width).tickFormat('').ticks(3);

    // Draw the axis
    vis.xAxisGroup = vis.chart.append('g')
      .attr('class', 'axis x-axis') 
      .attr('transform', `translate(0,${vis.height})`)
      .call(vis.xAxis);

    vis.yAxisGroup = vis.chart.append('g')
      .attr('class', 'axis y-axis')
      .call(vis.yAxis);

    // Create grids.
    vis.chart.append('g')
      .attr('class', 'axis-grid')
      .attr('transform', `translate(0,${vis.height})`)
      .call(vis.xAxisGrid);

    vis.chart.append('g')
      .attr('class', 'axis-grid')
      .call(vis.yAxisGrid);


    let starColorScale = d3.scaleOrdinal()
      .domain([undefined, 'A', 'B', 'F', 'G', 'K', 'M'])
      .range(['#6ebfc2', '#eaeaea', '#424fdb', '#e8ed9a', '#d8e617', '#eda218', '#c94134']);

      // Filter the data for "Our Solar System"
    let ourSolarSystemData = vis.data.filter(d => d.sys_name === "Our Solar System");

    // Draw the circles for the remaining data
    vis.circles = vis.chart.selectAll('.planet:not(.our-solar-system)')
      .data(vis.data)
      .join('circle')
      .attr('class', 'planet')
      .attr('fill', d => {
        if(d.hostname == "Sun"){
          return 'gray'
        } else {
          return starColorScale(d.st_spectype[0])
        }
      })
      .attr('opacity', .8)
      .attr('stroke', 'url(#planet-gradient)') // Add the planet gradient as the stroke
      .attr('stroke-width', 1)
      .attr('r', (d) => 8) 
      .attr('cy', (d) => vis.height) 
      .attr('cx',(d) =>  0 );

    vis.ourSystem = vis.chart.selectAll('.our-solar-system')
      .data(ourSolarSystemData)
      .enter()
      .append('g')
      .attr('class', 'planet our-solar-system')
      .on('mouseover', (event, d) => {
        d3.select('#scatterplot-tooltip')
          .style('display', 'block')
          .style('left', (event.pageX + vis.config.tooltipPadding) + 'px')
          .style('top', (event.pageY + vis.config.tooltipPadding) + 'px')
          .html(`
              <div class="tooltip-title"><b>${d.pl_name}</b></div>
              <div><i>${d.planetType} Planet</i></div>
              <ul>
                <li>Radius: ${d.pl_rade} Re</li>
                <li>Mass: ${d.pl_bmasse} Me</li>
                <li>Orbital Axis: ${d.pl_orbsmax} au</li>
              </ul>
            `);
      })
      .on('mouseleave', () => {
        d3.select('#scatterplot-tooltip').style('display', 'none');
      })
      .on('click',(event,d) =>{
        console.log(d)
        setExoplanetFromScatterplot(d.pl_name)
      });

    // Draw circles for planets in our Solar System
    vis.ourSystemCircles = vis.ourSystem.append('circle')
      .attr('fill', '#e663e6') // Or any color you prefer
      .attr('opacity', .8)
      .attr('stroke', 'url(#planet-gradient)') // Add the planet gradient as the stroke
      .attr('stroke-width', 1)
      .attr('r', (d) => 10)
      .attr('cx', (d) => 0) // Set to 0 to animate later
      .attr('cy', (d) => vis.height);
    
    vis.ourSystemText = vis.ourSystem.append('text')
      .attr('x', (d) => 0)
      .attr('y', (d) => vis.height)
      .attr('text-anchor', 'middle')
      .attr("font-size", "12px")
      .style('fill', '#ddd')
      .style("pointer-events", "none")
      .text((d) => d.pl_name[0]);

  vis.circles
    .on('mouseover', (event,d) => {
      d3.select('#scatterplot-tooltip')
      .style('display', 'block')
      .style('left', (event.pageX + vis.config.tooltipPadding) + 'px')   
      .style('top', (event.pageY + vis.config.tooltipPadding) + 'px')
      .html(`
        <div class="tooltip-title"><b>${d.pl_name}</b></div>
        <div><i>${d.planetType} Planet</i></div>
        <ul>
          <li>Radius: ${d.pl_rade} Re</li>
          <li>Mass: ${d.pl_bmasse} Me</li>
          <li>Orbital Axis: ${d.pl_orbsmax} au</li>
        </ul>
      `);
      })
      .on('mouseleave', () => {
        d3.select('#scatterplot-tooltip').style('display', 'none');
      })
      .on('click',(event,d) =>{
        console.log(d)
        setExoplanetFromScatterplot(d.pl_name)
      });

    vis.brushSvgHolder
      .call( d3.brush()  
        .extent( [ [0,-10], [vis.width + 20,vis.height] ] ) 
        .on('start brush', function({selection}) {
          vis.circles.classed("selected", d => {
            const cx = vis.xScale(d.pl_bmasse);
            const cy = vis.yScale(d.pl_rade);
            return selection[0][0] <= cx && cx <= selection[1][0] && selection[0][1] <= cy && cy <= selection[1][1];
          });
          vis.ourSystem.classed("selected", d => {
            const cx = vis.xScale(d.pl_bmasse);
            const cy = vis.yScale(d.pl_rade);
            return selection[0][0] <= cx && cx <= selection[1][0] && selection[0][1] <= cy && cy <= selection[1][1];
          });
        })
        .on('end', function({selection}) {
          if (selection){
              vis.callback(vis.xScale.invert(selection[0][0]), vis.xScale.invert(selection[1][0]), vis.yScale.invert(selection[1][1]), vis.yScale.invert(selection[0][1]))
            }
        })
      )
    
    vis.circles.transition()
      .duration(1000)
      .attr('cx',(d) =>  vis.xScale(parseFloat(d.pl_bmasse)))
      .attr('cy', (d) => vis.yScale(parseFloat(d.pl_rade)));

    vis.ourSystemCircles.transition()
      .duration(1000)
      .attr('cy', (d) => vis.yScale(parseFloat(d.pl_rade))) 
      .attr('cx',(d) =>  vis.xScale(parseFloat(d.pl_bmasse)));

    vis.ourSystemText.transition()
      .duration(1000)
      .attr('x', (d) => vis.xScale(d.pl_bmasse)) 
      .attr('y',(d) =>  vis.yScale(d.pl_rade) + 4.5);
  }

 renderVis() { 

  }
}
