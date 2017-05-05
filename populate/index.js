var express = require('express');

var neo4j = require('neo4j-driver').v1;

const testFolder = './tests/';
const fs = require('fs');
var driver = neo4j.driver("bolt://localhost", neo4j.auth.basic("neo4j", "la1Reinona"));

var session = driver.session();


//Lee todo del directorio
fs.readdir(testFolder, (err, files) => {
  //De todos los archivos
  files.forEach(file => {
    //Lee todos los archivos
    fs.readFile(testFolder+file, 'utf8', function (err,data) {
        if (err) {
          return console.log(err);
        }
        data.split(RegExp("[ \n]")).filter(x =>{return x.charAt(0)!='>'}).forEach( x =>{
        console.log(x)
        session
          .run( "CREATE (p1: Sequence {nucleotides:{seq}}) "
            +"WITH p1 MATCH (p2:Sequence) WHERE p1<>p2 "
            +"CALL blast.swexec(p1, p2) return p1",{seq:x})
          .then( function( result ) {
              session.close();
              driver.close();
            })
          
        })    
    });
  });
});
/*process.stdout.write("MATCH\n")
session
   .run( "MATCH (p1:Sequence), (p2:Sequence) WHERE p1<>p2 CALL blast.swexec(p1, p2) return p1")
   .then( function( result ) {
      process.stdout.write("MATCH2\n")
       session.close();
       driver.close();
     }).catch(function(error) {
       session.close();
       driver.close();
     });*/