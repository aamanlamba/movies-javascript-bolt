require('file?name=[name].[ext]!../node_modules/neo4j-driver/lib/browser/neo4j-web.js');
var Movie = require('./models/Movie');
var MovieCast = require('./models/MovieCast');
var System = require('./models/System');
var _ = require('lodash');

var neo4j = window.neo4j.v1;
var driver = neo4j.driver("bolt://localhost", neo4j.auth.basic("neo4j", "abcde"));

function searchSys(queryString){
    var session = driver.session();
    return session
    .run(
            'MATCH (system:System) \
             RETURN system',
             {name: '(?i).*' + queryString + '.*'}
        )
    .then (
           result => {
           session.close();
           return result.records.map(record => {
                return new System(record.get('system'));
            });
        })
    .catch(error => {
           session.close();
           throw error;
    });
}


function searchMovies(queryString) {
  var session = driver.session();
  return session
    .run(
      'MATCH (movie:Movie) \
      WHERE movie.title =~ {title} \
      RETURN movie',
      {title: '(?i).*' + queryString + '.*'}
    )
    .then(result => {
      session.close();
      return result.records.map(record => {
        return new Movie(record.get('movie'));
      });
    })
    .catch(error => {
      session.close();
      throw error;
    });
}

function getMovie(title) {
  var session = driver.session();
  return session
    .run(
      "MATCH (movie:Movie {title:{title}}) \
      OPTIONAL MATCH (movie)<-[r]-(person:Person) \
      RETURN movie.title AS title, \
      collect([person.name, \
           head(split(lower(type(r)), '_')), r.roles]) AS cast \
      LIMIT 1", {title})
    .then(result => {
      session.close();

      if (_.isEmpty(result.records))
        return null;

      var record = result.records[0];
      return new MovieCast(record.get('title'), record.get('cast'));
    })
    .catch(error => {
      session.close();
      throw error;
    });
}

function getGraph() {
  var session = driver.session();
  return session.run(
    'MATCH (m:Movie)<-[:ACTED_IN]-(a:Person) \
    RETURN m.title AS movie, collect(a.name) AS cast \
    LIMIT {limit}', {limit: 100})
    .then(results => {
      session.close();
      var nodes = [], rels = [], i = 0;
      results.records.forEach(res => {
        nodes.push({title: res.get('movie'), label: 'movie'});
        var target = i;
        i++;

        res.get('cast').forEach(name => {
          var actor = {title: name, label: 'actor'};
          var source = _.findIndex(nodes, actor);
          if (source == -1) {
            nodes.push(actor);
            source = i;
            i++;
          }
          rels.push({source, target})
        })
      });

      return {nodes, links: rels};
    });
}

function getGraphSys(){
    var session = driver.session();
    return session.run(
        'MATCH (m:System)-[r:DataFlow*..]-(p:System) \
        RETURN m.name as system,collect(p.name) as connSystems \
        LIMIT {limit}',{limit:50})
    .then (results => {
           session.close();
           var nodes = [],rels=[],i=0;
           results.records.forEach(res=>{
                nodes.push({title:res.get('system'),label:'system'});
                var target = i;
                i++;
            res.get('connSystems').forEach(name=>{
                var sys2 = {title:name,label: 'system'};
                var source = _.findIndex(nodes,sys2);
                if (source == -1){
                   nodes.push(sys2);
                   source = i;
                   i++;
               }
               rels.push({source,target})
                   })
               });
           return {nodes,links:rels};
           });
}

exports.searchSys = searchSys;
exports.getGraphSys = getGraphSys;
exports.searchMovies = searchMovies;
exports.getMovie = getMovie;
exports.getGraph = getGraph;

