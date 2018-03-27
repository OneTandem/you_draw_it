d3.tsv('superstore_simplified.tsv', function(error, data) {
  console.log(error)
  console.log(data)

  // the x value (in data coordinates) where to clip to
  const clippingPoint = 2012;
  const clippingValue = data.filter(p => { return p.year == clippingPoint})[0].debt;

  data.forEach(d => {
    d.year = +d.year;
    d.debt = +d.debt;
  })
  //data = originalData;


  var ƒ = d3.f

  var sel = d3.select('body').html('')
  var c = d3.conventions({
    parentSel: sel, 
    totalWidth: sel.node().offsetWidth, 
    height: 400, 
    margin: {left: 50, right: 50, top: 30, bottom: 30}
  })

  c.svg.append('rect').at({width: c.width, height: c.height, opacity: 0})

  var maxYValue = d3.max(data, d => { return d.debt; });
  var maxXValue = d3.max(data, d => { return d.year; });

  //c.x.domain([2001, 2015])
  c.x.domain(d3.extent(data, d => { return d.year; }))
  c.y.domain([0, maxYValue])

  c.xAxis.tickFormat(ƒ())
  //c.yAxis.ticks(5).tickFormat(d => d + '%')
  c.yAxis.ticks(5);

  var area = d3.area().x(ƒ('year', c.x)).y0(ƒ('debt', c.y)).y1(c.height)
  var line = d3.area().x(ƒ('year', c.x)).y(ƒ('debt', c.y))

  var clipRect = c.svg
    .append('clipPath#clip')
    .append('rect')
    .at({width: c.x(clippingPoint) - 2, height: c.height})

  var correctSel = c.svg.append('g').attr('clip-path', 'url(#clip)')

  correctSel.append('path.area').at({d: area(data)})
  correctSel.append('path.line').at({d: line(data)})
  yourDataSel = c.svg.append('path.your-line')

  //c.drawAxis()

  var xAxisSel = c.svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + c.height + ')')
        .call(c.xAxis);

    var yAxisSel = c.svg.append('g')
        .attr('class', 'y axis')
        .call(c.yAxis);


  yourData = data
    .map(function(d){ return {year: d.year, debt: d.debt, defined: 0} })
    .filter(function(d){
      if (d.year == clippingPoint) d.defined = true
      return d.year >= clippingPoint
    })

  var completed = false

  var drag = d3.drag()
    .on('drag', function(){
      var pos = d3.mouse(this)
      var year = clamp(d3.min(data, d => { return d.year; }), d3.max(data, d => { return d.year; }), c.x.invert(pos[0]))      
      var debt = clamp(0, c.y.domain()[1], c.y.invert(pos[1]))

      yourData.forEach(function(d){
        if (Math.abs(d.year - year) < .5) {
          // fix the value of the clipping point to the real one to allow continuity in the line
          d.debt = (d.year == clippingPoint) ? clippingValue : debt;
          d.defined = true
        }
      })

      yourDataSel.at({d: line.defined(ƒ('defined'))(yourData)})

      // d3.mean just evaluates if all the values in "defined" is 1
      if (!completed && d3.mean(yourData, ƒ('defined')) == 1){
        completed = true
        clipRect.transition()
                .duration(1000)
                  .attr('width', c.x(maxXValue))
      }
    })

  c.svg.call(drag)



  function clamp(a, b, c){ return Math.max(a, Math.min(b, c)) }
});
