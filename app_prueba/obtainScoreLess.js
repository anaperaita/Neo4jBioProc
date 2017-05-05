var neo4j = require('neo4j-driver').v1;

const testFolder = './tests/';
const fs = require('fs');
var driver = neo4j.driver("bolt://localhost", neo4j.auth.basic("neo4j", "la1Reinona"));
var session = driver.session();

function getNodesWithScoresLessThan(score){

   var lista=session
     .run( "MATCH (p1:Sequence)-[r:ALLIGNS]->(p2:Sequence) WHERE r.score < {val}"
     +"return p1.nucleotides AS sequence1, r.score as score, p2.nucleotides as sequence2",{val:score} ).
     then( function( result ) {
        var lista=[]
  
        for(var i = 0; i < result.records.length; i ++) {
          lista.push({sequence1: result.records[i].get("sequence1"),score: result.records[i].get("score"), sequence2: result.records[i].get("sequence2")})
          console.log(result.records[i].get("sequence1") + " , " + result.records[i].get("score") + ", " + result.records[i].get("sequence2") )
             
        }
         session.close();
         driver.close();
         return lista
       });
       
       return lista
}

console.log(getNodesWithScoresLessThan(10))
