class TimelineCircles {

  constructor(_config, _data, _callback) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: _config.containerWidth || 500,
      containerHeight: _config.containerHeight || 140,
      margin: { top: 40, bottom: 40, right: 50, left: 60 },
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

      
        //Title
    vis.svg.append("text")
       .attr('transform', `translate(${vis.width/2 - 80}, ${vis.config.margin.top -20 })`)
       .attr("font-size", "20px")
       .text("Exoplanets By Mass and Radius")
       .style("font-family", "system-ui")
        .style("color", "black")
        .style("font-size", "20px");
    // X axis Label    
    vis.svg.append("text")
       .attr("transform", `translate(${vis.width/2 + vis.config.margin.left},${vis.height + vis.config.margin.bottom + 35})`)
       .style("text-anchor", "middle")
       .text("Mass (Earth Masses)")
       .style("font-family", "system-ui")
        .style("color", "black")
        .style("font-size", "18x");
    vis.svg.append("text")
       .attr("transform", "rotate(-90)")
       .attr("x", -(vis.height/2) - vis.config.margin.top)
       .attr("y", 15)
       .style("text-anchor", "middle")
       .text("Radius (Earth Radii)")
       .style("font-family", "system-ui")
        .style("color", "black")
        .style("font-size", "18px");

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
    vis.svg.selectAll('.chart').remove();
    vis.svg.selectAll('.plan').remove();
    vis.chart.selectAll('text').remove();
  vis.brushSvgHolder = vis.brushSvg.append('g')
    .attr("class","plan")
  // Initialize linear and ordinal scales (input domain and output range)
  vis.xScale = d3.scaleLog()
    .domain([d3.min(vis.data, d => parseFloat(d.pl_bmasse)), d3.max( vis.data, d => parseFloat(d.pl_bmasse))])
    .range([0, vis.width]);
  vis.yScale = d3.scaleLog()
    .domain([d3.max(vis.data, d => parseFloat(d.pl_rade)), d3.min( vis.data, d => parseFloat(d.pl_rade))]) 
    .range([0, vis.height])
    .nice();

  vis.rScale = d3.scaleLog()
    .domain(d3.extent(vis.data, d=> parseFloat(d.pl_bmasse)))
    .range([10, 10]);
  let fakeData = vis.data
  let fakeData3 = vis.data
  let aCount = d3.count(fakeData.filter( d => d.starType == "A" ), d => d.sy_snum);
  let allCount = d3.count(fakeData3, d => d.pl_bmasse);
  let ticks = 1
  if(aCount != allCount){
    ticks = 2
  }
  // Initialize axes
  vis.xAxis = d3.axisBottom(vis.xScale)
    .tickFormat(d3.format('.2f'))
    .ticks(ticks);

  vis.yAxis = d3.axisLeft(vis.yScale)
    .tickFormat(d3.format('.2f'))
    .ticks(ticks);

  // Draw the axis
  vis.xAxisGroup = vis.chart.append('g')
    .attr('class', 'axis x-axis') 
    .attr('transform', `translate(0,${vis.height})`)
    .call(vis.xAxis);

  vis.yAxisGroup = vis.chart.append('g')
    .attr('class', 'axis y-axis')
    .call(vis.yAxis);

  console.log(vis.data)

  let starColorScale = d3.scaleOrdinal()
    .domain(['A', 'F', 'G', 'K', 'M'])
    .range(['#3399FF', '#FFFFFF', '#FFFF99', '#FF9933', '#FF3333']);

  vis.circles = vis.chart.selectAll('circle')
    .data(vis.data)
    .join('circle')
    .attr('class','plan')
    .attr('fill', d => starColorScale(d.st_spectype[0]))
    .attr('opacity', .8)
    .attr('stroke', "gray")
    .attr('stroke-width', 2)
    .attr('r', (d) => 0) 
    .attr('cy', (d) => vis.height ) 
    .attr('cx',(d) =>  0 );
  vis.circles
    .on('mouseover', (event,d) => {
      d3.select('#tooltip')
      .style('display', 'block')
      .style('left', (event.pageX + vis.config.tooltipPadding) + 'px')   
      .style('top', (event.pageY + vis.config.tooltipPadding) + 'px')
      .html(`
              <div class="tooltip-title">${d.pl_name}</div>
              <div><i>Star Type: ${d.starType}</i></div>
              <ul>
                <li>Mass: ${d.pl_bmasse} Earth Masses</li>
                <li>Radius: ${d.pl_rade} Earth Radii</li>
              </ul>
            `);
      })
      .on('mouseleave', () => {
        d3.select('#tooltip').style('display', 'none');
      })
      .on('click',(event,d) =>{
        console.log(d)
        populateExoplanetSystemBrowser(d.pl_name)
      });
    
  let leftData1 = vis.data
  let leftData2 = leftData1.filter(d => d.starType == "SUN")
  let leftData3 = leftData2.filter(d => d.pl_name != "Mercury")
  let leftData4 = leftData3.filter(d => d.pl_name != "Mars")
  let leftData5 = leftData4.filter(d => d.pl_name != "Earth")
  let leftData6 = leftData5.filter(d => d.pl_name != "Neptune")
  let leftData7 = leftData6.filter(d => d.pl_name != "Jupiter")
  vis.textarea = vis.svg.append('g')
          .attr('class','plan')
          .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);
  vis.textarea1 = vis.svg.append('g')
          .attr('class','plan')
          .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);
  vis.textarea2 = vis.svg.append('g')
          .attr('class','plan')
          .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

  vis.textleft1 = vis.textarea.selectAll("text")
    .data(leftData7)
    .join("text")
    .text(d => d.pl_name)
    .attr('class','plan')
    .attr("x", d => 0)
    .attr("y", d => vis.height)
    .attr("text-anchor", "end")
    .attr("dy", 1)
    .attr("dx", -15)
    .style("font-weight", "bold")
    .style("font-size", "15px");
  let rightData = vis.data
  let rightData1 = rightData.filter(d => d.starType == "SUN")
  let rightData2 = rightData1.filter(d => d.pl_name != "Venus")
  let rightData3 = rightData2.filter(d => d.pl_name != "Saturn")
  let rightData4 = rightData3.filter(d => d.pl_name != "Uranus")
  let rightData5 = rightData4.filter(d => d.pl_name != "Jupiter")

    vis.textRight2 = vis.textarea1.selectAll("text")
    .data(rightData5)
    .join("text")
    .text(d => d.pl_name)
    .attr('class','plan')
    .attr("x", d => 0)
    .attr("y", d => vis.height)
    .attr("text-anchor", "start")
    .attr("dy", 1)
    .attr("dx", 15)
    .style("font-weight", "bold")
    .style("font-size", "15px");
  let oss = vis.data
  let ossCount = d3.count(oss.filter((d)=>d.starType=="SUN"), d => d.pl_bmasse)
  if(ossCount > 0 && allCount >ossCount){
    let jupiterData = vis.data
    let jupiterData1 = jupiterData.filter(d => d.pl_name == "Jupiter")

    vis.textRight3 = vis.textarea2.selectAll("text")
    .data(jupiterData1)
    .join("text")
    .text(d => d.pl_name)
    .attr('class','plan')
    .attr("x", d => 0)
    .attr("y", d => vis.height)
    .attr("text-anchor", "end")
    .attr("dy", -3)
    .attr("dx", -15)
    .style("font-weight", "bold")
    .style("font-size", "15px");
  }
  else{
    let jupiterData2 = vis.data
    let jupiterData3 = jupiterData2.filter(d => d.pl_name == "Jupiter")

    vis.textRight3 = vis.textarea2.selectAll("text")
    .data(jupiterData3)
    .join("text")
    .text(d => d.pl_name)
    .attr('class','plan')
    .attr("x", d => 0)
    .attr("y", d => vis.height)
    .attr("text-anchor", "end")
    .attr("dy", -3)
    .attr("dx", -15)
    .style("font-weight", "bold")
    .style("font-size", "15px");
  }
  vis.brushSvgHolder
    .call( d3.brush()  
      .extent( [ [0,-10], [vis.width + 20,vis.height] ] ) 
      .on('start brush', function({selection}) {
              if (selection) vis.updateChart(selection);
            })
      .on('end', function({selection}) {
        if (selection){
            var x0 = vis.xScale.invert(selection[0][0]),
            x1 = vis.xScale.invert(selection[1][0]),
            y0 = vis.yScale.invert(selection[1][1]),
            y1 = vis.yScale.invert(selection[0][1]);
           vis.callback(x0,x1,y0,y1)
         }
            })
    )
    
  vis.circles.transition()
        .duration(1000)
      .attr('r', (d) => vis.rScale(parseFloat(d.pl_bmasse)) ) 
      .attr('cy', (d) => vis.yScale(parseFloat(d.pl_rade)) ) 
      .attr('cx',(d) =>  vis.xScale(parseFloat(d.pl_bmasse)) );
 
  vis.textleft1.transition()
        .duration(1000)
      .attr("x", d => vis.xScale(d.pl_bmasse))
      .attr("y", d => vis.yScale(d.pl_rade))
    
  vis.textRight2.transition()
        .duration(1000)
      .attr("x", d => vis.xScale(d.pl_bmasse))
      .attr("y", d => vis.yScale(d.pl_rade))
  vis.textRight3.transition()
        .duration(1000)
      .attr("x", d => vis.xScale(d.pl_bmasse))
      .attr("y", d => vis.yScale(d.pl_rade))
    
    }

 renderVis() { 

  }

  // Function that is triggered when brushing is performed
  updateChart(selection) {
    let vis = this;
    let extent = selection

    vis.circles.classed("selected", function(d){ return vis.isBrushed(extent, vis.xScale(d.pl_bmasse), vis.yScale(d.pl_rade) ) } )
  }

  // A function that return TRUE or FALSE according if a dot is in the selection or not
  isBrushed(brush_coords, cx, cy) {
    let vis = this;
       var x0 = brush_coords[0][0],
           x1 = brush_coords[1][0],
           y0 = brush_coords[0][1],
           y1 = brush_coords[1][1];
      return x0 <= cx && cx <= x1 && y0 <= cy && cy <= y1;    // This return TRUE or FALSE depending on if the points is in the selected area
  }
}
