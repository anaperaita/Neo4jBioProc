var neo4j = require('neo4j-driver').v1;

const testFolder = './tests/';
const fs = require('fs');

var driver = neo4j.driver("bolt://localhost", neo4j.auth.basic("neo4j", "la1Reinona"));
var session = driver.session();

var evaluate = function (){ 
  var self = this;
  self.getAllign =function(cadena){

    session 
      .run( "MATCH (p1:DNASequence), (p2:DNASequence) WHERE p1<>p2 CALL blast.swexec(p1, p2) return p1",{seq:x}).then( function( result ) {
        session.close();
        driver.close();
      }).catch(function(error) {
        session.close();
        driver.close();
      });
  }
            
  self.addAndAllign = function(cadena){
    console.log(cadena)

    session 
      .run( "CREATE(p1:DNASequence{nucleotides:{seq}}) WITH p1 "+
            "MATCH (p2:DNASequence) WHERE p1<>p2 "+
            "CALL blast.swexec(p1, p2) return p1",{seq:cadena})
      .then( function( result ) {
        session.close();
        driver.close();
      })
  }

  self.getNodesWithScoresLessThan = function(score){

    var lista=session
      .run( "MATCH (p1:DNASequence)-[r:ALLIGNS]->(p2:DNASequence) WHERE r.score < {val}"
      +"return p1.nucleotides AS DNASequence1, r.score as score, p2.nucleotides as DNASequence2",{val:score} ).
      then( function( result ) {
          var lista=[]
    
          for(var i = 0; i < result.records.length; i ++) {
            lista.push({DNASequence1: result.records[i].get("DNASequence1"),score: result.records[i].get("score"), DNASequence2: result.records[i].get("DNASequence2")})
            console.log(result.records[i].get("DNASequence1") + " , " + result.records[i].get("score") + ", " + result.records[i].get("DNASequence2") )
              
          }
          session.close();
          driver.close();
          return lista
        });
        
        return lista
  }

  self.populate = function(filepath){

    //Lee todos los archivos
      fs.readFile(filepath, 'utf8', function (err,data) {
          if (err) {
            return console.log(err);
          }
          data.split(RegExp("[ \n]")).filter(x =>{return x.charAt(0)!='>'}).forEach( x =>{
          self.addAndAllign(x)
            
          })
      })
  }
}

module.exports = evaluate;
