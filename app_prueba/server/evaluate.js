var neo4j = require('neo4j-driver').v1;
const fs = require('fs');

var driver = neo4j.driver("bolt://localhost", neo4j.auth.basic("neo4j", "la1Reinona"));
var session = driver.session();


//Transforma un record de la base de datos a una estructura enviable de arista
function edgeRecordsToListElem(records){

   console.log("Edge" + records.get("Sequence1") + " , " + records.get("score") + ", " + records.get("Sequence2") )
   return {     NodeId1:records.get("NodeId1"),
                score: records.get("score"),
                EdgeId: records.get("EdgeId"),
                NodeId2: records.get("NodeId2")}
}

//Transforma un record de la base de datos a una estructura enviable de nodo
function nodeRecordsToListElem(records){

   console.log("Node " + records.get("Sequence1") )
   return {Sequence: records.get("Sequence1"),
                NodeId:records.get("NodeId1"),
                Name:records.get("Name"),
                InfoId:records.get("InfoId") 
                }
}

//Transforma un record de la base de datos a una estructura enviable de info

function infoRecordToGraph(record){
  return {InfoName: record.get("InfoName"),
          InfoSciName: record.get("InfoSciName"),
          InfoStartCodons: record.get("InfoStartCodons"),
          InfoId: record.get("InfoId"),
          DNASequence: record.get("DNASequence"), 
          DNAId: record.get("DNAId"),
          AminoacydSequence: record.get("AminoacydSequence"),
          AminoacydId: record.get("AminoacydId"),
          Structure: record.get("Structure"),
          StructureId: record.get("StructureId")}

}

function onlyInfoRecordToGraph(record){
  return {InfoName: record.get("InfoName"),
          InfoSciName: record.get("InfoSciName"),
          InfoStartCodons: record.get("InfoStartCodons"),
          InfoId: record.get("InfoId")
          }

}

// Operaciones contra la base de datos
var evaluate = function (){ 
  var self = this;
  // Alinea una cadena
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
  self.addAndAllign = function(cadena, infoId){
    console.log(cadena)

    session 
      .run( "CREATE(p1:DNASequence{nucleotides:{seq}}) WITH p1 "+
            "MATCH (p2:DNASequence) WHERE p1<>p2 "+
            "CALL blast.swexec(p1, p2) return p1",{seq:cadena})
      .then( function( result ) {
        
        session.close();
        driver.close();
        
      }).then(function(){
        self.setDataOfADN(cadena, infoId);
      })
  }

//Obtiene los nodos con scores menores que el argumento score
  self.getNodesWithScores = function(score,pattern,type,typeAttr, sign){

    var lista=session
      .run( "MATCH (p1:"+type+")-[r:ALLIGNS]->(p2:"+type+") "
      + "WHERE r.score "+sign+" {val} AND p1."+typeAttr+" =~ {pattern} AND p2."+typeAttr+" =~ {pattern} "
      +"return ID(p1) AS NodeId1, p1."+typeAttr+" AS Sequence1,"
      +"ID(r) AS EdgeId, r.score as score, ID(p2) AS NodeId2,"
      +" p2."+typeAttr+" as Sequence2",{val:score, pattern:pattern} ).
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
  self.getNodesWithScoresDNALessThan = function(score, pattern){
    return self.getNodesWithScores(score, pattern, "DNASequence","nucleotides", "<");
    
  }

//Obtiene los nodos con scores mayores que el argumento score
  self.getNodesWithScoresDNAHigherThan = function(score, pattern){
    return self.getNodesWithScores(score, pattern, "DNASequence","nucleotides", ">");
    
  }

  //Obtiene los nodos con scores menores que el argumento score
  self.getNodesWithScoresProteinsLessThan = function(score, pattern){
    return self.getNodesWithScores(score, pattern, "AminoacydSequence", "aminoacyds", "<");
    
  }

//Obtiene los nodos con scores mayores que el argumento score
  self.getNodesWithScoresProteinsHigherThan = function(score, pattern){
    return self.getNodesWithScores(score, pattern, "AminoacydSequence","aminoacyds", ">");
    
  }

  //Obtiene todos los nodos que siguen un patrón
  self.getAllNodes = function(pattern, query){
    var lista=session
      .run(query ,{ pattern:pattern} ).
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

//Obtiene todos los nodos de tipo adn y sus alineaciones
  self.getAllNodesDNA = function(pattern){
    query = "MATCH (p1:DNASequence)-[:INFO]->(i:Info) WHERE p1.nucleotides =~ {pattern} "
      +"return ID(p1) AS NodeId1, p1.nucleotides AS Sequence1, i.name AS Name,"
      +" i.startCodons AS StartCodons, ID(i) AS InfoId"
    return self.getAllNodes(pattern,query);
  }

//Obtiene todos los nodos de tipo proteina y sus alineaciones
  self.getAllNodesProteins = function(pattern){
      query = "MATCH (p1:AminoacydSequence)<-[:TRANSLATES]-(:DNASequence)-[:INFO]->(i:Info)"
      +" WHERE p1.aminoacyds =~ {pattern} "
      +" WITH distinct p1,i "
      +"return ID(p1) AS NodeId1, p1.aminoacyds AS Sequence1, i.name AS Name,"
      +" i.startCodons AS StartCodons, i.sciname AS SciName, ID(i) AS InfoId"
    return self.getAllNodes(pattern,query);
  }

//Genera proteinas a partir del adn y aminoacidos a partir de las proteinas
self.generateProteins = function(){
  
  session 
      .run( "MATCH (p1:DNASequence) WHERE NOT (p1:DNASequence) -[:TRANSLATES] -> () CALL blast.proteinTranslation(p1) return p1")
      .then( function( result ) {
          session.close();
          driver.close();
          session.run("MATCH(p1:AminoacydSequence) WITH p1 "+
              "MATCH (p2:AminoacydSequence) WHERE p1<>p2 "+
              "AND NOT (p1:AminoacydSequence) -[:ALLIGNS] -> (p2:AminoacydSequence) "+
              "CALL blast.swexec(p1, p2) return p1").then(function( result ) {
              session.close();
              driver.close();
              session.run("MATCH(p1:AminoacydSequence) "+
                "WHERE NOT (p1:AminoacydSequence) -[:STRUCTURES] -> () "+
                "CALL blast.proteinStructure(p1) return p1")
                .then(function( result ) {
                  session.close();
                  driver.close();
                })

        })
        

      })
}


//Setea el nodo de info para todos los nodos 
  self.setDataOfADN=function(adn, infoId){
    session 
      .run( "MATCH (p1:DNASequence), (i1:Info) WHERE p1.nucleotides in {seq} AND i1.infoId = {infoId}" +
            "CREATE UNIQUE (p1) -[:INFO]-> (i1),(i1) -[:INFO]-> (p1) ",{seq:adn, infoId:infoId})
      .then( function( result ) {
        session.close();
        driver.close();
        self.generateProteins()
      })
     
  }

 //Obtiene los datos a partir de adn
  self.getDataFromInfo=function(infoId){
     var lista=session
      .run( "START i1=NODE("+infoId+") MATCH(i1) WITH i1 "
      +"OPTIONAL MATCH (i1)-[r:INFO]->(p1:DNASequence)-[:TRANSLATES]->(a1:AminoacydSequence)-[:STRUCTURES]->(s1:Structure) "
      +"return i1.name AS InfoName, i1.sciname AS InfoSciName, i1.startCodons As InfoStartCodons, ID(i1) As InfoId, "
      +" p1.nucleotides AS DNASequence, ID(p1) as DNAId, a1.aminoacyds as AminoacydSequence, ID(a1) as AminoacydId, s1.structure as Structure , ID(s1) as StructureId",{val:infoId} ).
      then( function( result ) {
          var lista=[]
    
          for(var i = 0; i < result.records.length; i ++) {
            lista.push(infoRecordToGraph(result.records[i]))
            //console.log(result.records[i].get("DNASequence") + " , " + result.records[i].get("AminoacydSequence") )
              
          }
          session.close();
          driver.close();
          return lista
        });
        
        return lista
  }

  //Obtiene todos los nodos de tipo info
  self.getAllInfo=function(){
     var lista=session
      .run( "MATCH (i1: Info) "
      +"return i1.name AS InfoName, i1.sciname AS InfoSciName, i1.startCodons As InfoStartCodons,"
      +" ID(i1) as InfoId" ).
      then( function( result ) {
          var lista=[]
    
          for(var i = 0; i < result.records.length; i ++) {
            lista.push(onlyInfoRecordToGraph(result.records[i]));
              
          }
          session.close();
          driver.close();
          return lista
        });
        
        return lista
  }

  //Crea el nodo de informacion
  self.createInfoNode=function(infoId, name,sciname, startCodons){
    query = "CREATE (i1:Info{infoId:{infoId}, startCodons:{startCodons}";
    queryData={infoId:infoId,startCodons:startCodons}
    if(name!=null){
      query+=", name:{name}";
      queryData.name= name;
    }
    if(sciname!=null){
      query+=", sciname:{sciname}";
      queryData.sciname= sciname;
    }
    
    query+="})";
    session 
      .run( query, queryData)
      .then( function( result ) {
        session.close();
        driver.close();
      })
     
  }

// Parsea los codones de inicio
  self.parseStartCodons=function(startCodons){
    regExp = new RegExp('^([T,G,C,A]{3})(,[T,G,C,A]{3})*$');
    if(!regExp.test(startCodons)){
      return [];
    }
    else{
      return startCodons.split(',')
    }
  }


//Guarda todos los datos de un fichero fasta
  self.populate = function(filepath, infoId){

    //Lee todos los archivos
      fs.readFile(filepath, 'utf8', function (err,data) {
          if (err) {
            return console.log(err);
          }
          data.split(">.*\n").forEach( x =>{
            salida=x.replace(/(\r?\n|\r|[^ATGC])/gm, '')
            self.addAndAllign(salida, infoId);
            
            
          })
      })


  }
}

module.exports = evaluate;
