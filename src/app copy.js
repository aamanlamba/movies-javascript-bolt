var api = require('./neo4jApi');

$(function () {
  renderGraph();
 // search();
  searchSystem();

  $("#search").submit(e => {
    e.preventDefault();
    search();
  });
});


function searchSystem() {
    var query = $("#search").find("input[name=search]").val();
    //console.log(query);
    api
    .searchSys(query)
    .then(systems => {
          var t = $("table#results2 tbody").empty();
          
          if (systems) {
          systems.forEach(sys => {
                     //     console.log("<li>" + sys.name + " Org:" + sys.Org + " ADS:" + sys.isADS + "</li>");
                         $("<tr><td class='movie'>" + sys.name + "</td><td>" + sys.Org + "</td><td>" + sys.isADS + "</td></tr>").appendTo(t)
                         
                         });
          
          }
          });
}





function renderGraph() {
  var width = 800, height = 800;
  var force = d3.layout.force()
    .charge(-200).linkDistance(30).size([width, height]);

  var svg = d3.select("#graph").append("svg")
    .attr("width", "100%").attr("height", "100%")
    .attr("pointer-events", "all");

  api
    .getGraphSys()
    .then(graph => {
      force.nodes(graph.nodes).links(graph.links).start();

      var link = svg.selectAll(".link")
        .data(graph.links).enter()
        .append("line").attr("class", "link");

      var node = svg.selectAll(".node")
        .data(graph.nodes).enter()
        .append("circle")
        .attr("class", d => {
          return "node " + d.label
        })
        .attr("r", 10)
        .call(force.drag);

      // html title attribute
      node.append("title")
        .text(d => {
          return d.title;
        });

      // force feed algo ticks
      force.on("tick", () => {
        link.attr("x1", d => {
          return d.source.x;
        }).attr("y1", d => {
          return d.source.y;
        }).attr("x2", d => {
          return d.target.x;
        }).attr("y2", d => {
          return d.target.y;
        });

        node.attr("cx", d => {
          return d.x;
        }).attr("cy", d => {
          return d.y;
        });
      });
    });
}
