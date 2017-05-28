var neo4j = require('neo4j-driver').v1;

const testFolder = './tests/';
const fs = require('fs');

var driver = neo4j.driver("bolt://localhost", neo4j.auth.basic("neo4j", "la1Reinona"));
var session = driver.session();


function edgeRecordsToListElem(records){

   console.log("Edge" + records.get("Sequence1") + " , " + records.get("score") + ", " + records.get("Sequence2") )
   return {Sequence1: records.get("Sequence1"),
                NodeId1:records.get("NodeId1"),
                score: records.get("score"),
                EdgeId: records.get("EdgeId"),
                Sequence2: records.get("Sequence2"),
                NodeId2: records.get("NodeId2")}
}

function nodeRecordsToListElem(records){

   console.log("Node " + records.get("Sequence1") )
   return {Sequence: records.get("Sequence1"),
                NodeId:records.get("NodeId1")
                }
}


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
  
  //Añade una cadena de adn y la alinea con las demás
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

//Obtiene los nodos con scores menores que el argumento score
  self.getNodesWithScores = function(score, type,typeAttr, sign){

    var lista=session
      .run( "MATCH (p1:"+type+")-[r:ALLIGNS]->(p2:"+type+") WHERE r.score "+sign+" {val} "
      +"return ID(p1) AS NodeId1, p1."+typeAttr+" AS Sequence1,ID(r) AS EdgeId, r.score as score, ID(p2) AS NodeId2, p2."+typeAttr+" as Sequence2",{val:score} ).
      then( function( result ) {
          var lista=[]
    
          for(var i = 0; i < result.records.length; i ++) {
             lista.push( edgeRecordsToListElem(result.records[i]))
          }
          session.close();
          driver.close();
          return lista
        });
        
        return lista
  }

//Obtiene los nodos con scores menores que el argumento score
  self.getNodesWithScoresDNALessThan = function(score){
    return self.getNodesWithScores(score, "DNASequence","nucleotides", "<");
    
  }

//Obtiene los nodos con scores mayores que el argumento score
    self.getNodesWithScoresDNAHigherThan = function(score){
    return self.getNodesWithScores(score, "DNASequence","nucleotides", ">");
    
  }

  //Obtiene los nodos con scores menores que el argumento score
  self.getNodesWithScoresProteinsLessThan = function(score){
    return self.getNodesWithScores(score, "AminoacydSequence", "aminoacyds", "<");
    
  }

//Obtiene los nodos con scores mayores que el argumento score
    self.getNodesWithScoresProteinsHigherThan = function(score){
    return self.getNodesWithScores(score, "AminoacydSequence","aminoacyds", ">");
    
  }

  self.getAllNodes = function( type,typeAttr){

    var lista=session
      .run( "MATCH (p1:"+type+")"
      +"return ID(p1) AS NodeId1, p1."+typeAttr+" AS Sequence1" ).
      then( function( result ) {
          var lista=[]
    
          for(var i = 0; i < result.records.length; i ++) {
            lista.push( nodeRecordsToListElem(result.records[i]))
          }
          session.close();
          driver.close();
          return lista
        });
        
        return lista
  }

  self.getAllNodesDNA = function(){
    return self.getAllNodes("DNASequence","nucleotides");
  }

  self.getAllNodesProteins = function(){
    return self.getAllNodes("AminoacydSequence","aminoacyds");
  }

self.generateProteins = function(){
  
  session 
      .run( "MATCH (p1:DNASequence) WHERE NOT (p1:DNASequence) -[:TRANSLATES] -> () CALL blast.proteinTranslation(p1) return p1")
      .then( function( result ) {
          session.run("MATCH(p1:AminoacydSequence) WITH p1 "+
              "MATCH (p2:AminoacydSequence) WHERE p1<>p2 "+
              "AND NOT (p1:AminoacydSequence) -[:ALLIGNS] -> (p2:AminoacydSequence) "+
              "CALL blast.swexec(p1, p2) return p1").then(function( result ) {

          session.close();
          driver.close();
        })
        
        session.run("MATCH(p1:AminoacydSequence) "+
              "WHERE NOT (p1:AminoacydSequence) -[:STRUCTURES] -> () "+
              "CALL blast.proteinStructure(p1) return p1")
              .then(function( result ) {
                session.close();
                driver.close();
              })
      })
}

// devuelve las protrinas a partir de una lista de ADN
  self.getProteinsFromADN=function(adn){
     var lista=session
      .run( "MATCH (p1:DNASequence)-[r:TRANSLATES]->(p2: AminoacydSequence) WHERE p1.nucleotides IN {val}"
      +"return p1.nucleotides AS DNASequence, p2.aminoacyds as AminoacydSequence",{val:adn} ).
      then( function( result ) {
          var lista=[]
    
          for(var i = 0; i < result.records.length; i ++) {
            lista.push({DNASequence: result.records[i].get("DNASequence"), AminoacydSequence: result.records[i].get("AminoacydSequence")})
            console.log(result.records[i].get("DNASequence") + " , " + result.records[i].get("AminoacydSequence") )
              
          }
          session.close();
          driver.close();
          return lista
        });
        
        return lista
  }

//Obtiene la estructura de las proteinas
  self.getStructureFromProteins=function(proteins){
     var lista=session
      .run( "MATCH (p1:AminoacydSequence)-[r:STRUCTURES]->(p2: Structure) WHERE p1.aminoacyds IN {val}"
      +"return  p1.aminoacyds as AminoacydSequence, p2.structure AS Structure,",{val:proteins} ).
      then( function( result ) {
          var lista=[]
    
          for(var i = 0; i < result.records.length; i ++) {
            lista.push({ AminoacydSequence: result.records[i].get("AminoacydSequence"), Structure: result.records[i].get("Structure")})
            console.log(result.records[i].get("DNASequence") + " , " + result.records[i].get("AminoacydSequence") )
              
          }
          session.close();
          driver.close();
          return lista
        });
        
        return lista
  }
//Obtiene los datos a partir de adn
  self.getDataFromADN=function(adn){
     var lista=session
      .run( "MATCH (p1:DNASequence)-[r:INFO]->(p2: AminoacydSequence) WHERE p1.nucleotides IN {val} "
      +"return p1.nucleotides AS DNASequence, p2.aminoacyds as AminoacydSequence",{val:adn} ).
      then( function( result ) {
          var lista=[]
    
          for(var i = 0; i < result.records.length; i ++) {
            lista.push({DNASequence: result.records[i].get("DNASequence"), AminoacydSequence: result.records[i].get("AminoacydSequence")})
            console.log(result.records[i].get("DNASequence") + " , " + result.records[i].get("AminoacydSequence") )
              
          }
          session.close();
          driver.close();
          return lista
        });
        
        return lista
  }

//Setea el nodo de info para todos los nodos 
  self.setDataOfADN=function(adn, data){
    session 
      .run( "MATCH (p1:DNASequence) WHERE p1.nucleotides in {seq}" +
            "CREATE UNIQUE (p1) -[:INFO]-> (:Info {data} )",{seq:adn, data:data})
      .then( function( result ) {
        session.close();
        driver.close();
      })
      

     
  }


//Guarda todos los datos de un fichero fasta
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
