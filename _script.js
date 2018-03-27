var originalData = [
  {"year": 2001,    "debt": 31.4},
  {"year": 2002,    "debt": 32.6},
  {"year": 2003,    "debt": 34.5},
  {"year": 2004,    "debt": 35.5},
  {"year": 2005,    "debt": 35.6},
  {"year": 2006,    "debt": 35.3},
  {"year": 2007,    "debt": 35.2},
  {"year": 2008,    "debt": 39.3},
  {"year": 2009,    "debt": 52.3},
  {"year": 2010,    "debt": 60.9},
  {"year": 2011,    "debt": 65.9},
  {"year": 2012,    "debt": 70.4},
  {"year": 2013,    "debt": 72.6},
  {"year": 2014,    "debt": 74.4},
  {"year": 2015,    "debt": 73.6},
]


// this scripts adapts the code from Adam Pearce published at https://bl.ocks.org/1wheel/07d9040c3422dac16bd5be741433ff1e

// load the SuperStore dataset
d3.csv('superstore.csv', function(error, data) {
  //data = originalData;

  console.log(data)

  parseDate = d3.timeParse("%m/%d/%Y");
  parseShortDate = d3.timeParse("%m/%Y");

  data.forEach(d => {
    d.date = parseDate(d['Order Date']);
  });

  console.log(data)

  // group data by month
  var nested_data = d3.nest()
    .key(function(d) { 
      splitDate = d['Order Date'].split('/');
      return parseShortDate(splitDate[0] + "/" + splitDate[2]);
    })
    .rollup(function(leaves) { return d3.sum(leaves, function(d){ return d.Sales }) })
    .entries(data);

  console.log(nested_data);
  
  var ƒ = d3.f

  var sel = d3.select('body').html('')
  var c = d3.conventions({
    parentSel: sel, 
    totalWidth: sel.node().offsetWidth, 
    height: 400, 
    margin: {left: 50, right: 50, top: 30, bottom: 30}
  })

  c.svg.append('rect').at({width: c.width, height: c.height, opacity: 0});

  d3.conventions({x: d3.scaleTime()})
  console.log(d3.extent(nested_data, d => { return d.key; }))
  console.log(c.x)

  //c.x.domain([2001, 2015])//
  c.x.domain(d3.extent(nested_data, d => { return d.key; }))
  console.log(c.x.domain())
  c.y.domain([0, d3.max(nested_data, d => { return d.value; })])

  /*c.xAxis.ticks(4).tickFormat(ƒ())
  c.yAxis.ticks(5).tickFormat(d => d + '%')*/
  c.xAxis.ticks(4);
  c.yAxis.ticks(5);

  console.log(ƒ('key', c.x))
  /*var area = d3.area().x(ƒ('key', c.x)).y0(ƒ('value', c.y)).y1(c.height)
  var line = d3.area().x(ƒ('key', c.x)).y(ƒ('value', c.y))*/
  var area = d3.area()
            .x(d => { 
              console.log(c.x.domain())
              console.log(d.key)
              console.log(c.x(d.key))
              return c.x(d.key)} )
            .y0(d => { return c.y(d.value)} )
            .y1(c.height)
  var line = d3.area()
            .x(d => { return c.x(d.key) })
            .y(d => { return c.y(d.value) })


  var clipRect = c.svg
    .append('clipPath#clip')
    .append('rect')
    //.at({width: c.x(2008) - 2, height: c.height})
    .at({width: sel.node().offsetWidth/2 - 2, height: c.height})

  var correctSel = c.svg.append('g').attr('clip-path', 'url(#clip)')

  correctSel.append('path.area').at({d: area(nested_data)})
  correctSel.append('path.line').at({d: line(nested_data)})
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
      if (d.year == 2008) d.defined = true
      return d.year >= 2008
    })

  var completed = false

  var drag = d3.drag()
    .on('drag', function(){
      var pos = d3.mouse(this)
      var year = clamp(2009, 2016, c.x.invert(pos[0]))
      var debt = clamp(0, c.y.domain()[1], c.y.invert(pos[1]))

      yourData.forEach(function(d){
        if (Math.abs(d.year - year) < .5){
          d.debt = debt
          d.defined = true
        }
      })

      yourDataSel.at({d: line.defined(ƒ('defined'))(yourData)})

      if (!completed && d3.mean(yourData, ƒ('defined')) == 1){
        completed = true
        clipRect.transition().duration(1000).attr('width', c.x(2015))
      }
    })

  c.svg.call(drag)



  function clamp(a, b, c){ return Math.max(a, Math.min(b, c)) }
});
