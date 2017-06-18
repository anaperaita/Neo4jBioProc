
/*var txtFile = "test.txt";
var alphabet="ACTG";
var fs = require('fs');
var wstream = fs.createWriteStream('myOutput.txt');


for(var k=0; k<20; k++){
					

					
	for(var i=0; i<20; i++){
		str = "";
		for(var j=0; j<200; j++){
			str += alphabet.charAt(Math.floor(Math.random()*(alphabet.length+1)));
							
		}
		wstream.write("CREATE (p1:DNASequence {nucleotides:'"+str+"'});\n");
		}

	wstream.write("MATCH (p1:DNASequence), (p2:DNASequence) WHERE p1<>p2 CALL bio.swexec(p1, p2) return count(p1);\n");
					

	}

wstream.end();*/


var txtFile = "test.txt";
var alphabet="ACTG";
var fs = require('fs');
var wstream = fs.createWriteStream('generalOut3.txt');
//wstream.write("CREATE (i:Info{startCodons:['ATG']});\n");


for(var k=0; k<200; k++){
					
					
	for(var i=0; i<20; i++){
		str = "";
		for(var j=0; j<5000; j++){
			str += alphabet.charAt(Math.floor(Math.random()*(alphabet.length+1)));
							
		}
		wstream.write("MATCH (i:Info) CREATE(p1:DNASequence{nucleotides:'"+str+"'})-[:INFO]-(i) WITH p1 "+
            "MATCH (p2:DNASequence) WHERE p1<>p2 "+
            "CALL bio.swexec(p1, p2) return count(p1);\n");
		wstream.write("MATCH (p1:DNASequence) WHERE NOT (p1:DNASequence) -[:TRANSLATES] -> () CALL bio.proteinTranslation(p1) return count(p1);\n");
		wstream.write("MATCH(p1:AminoacydSequence) WITH p1 "+
              "MATCH (p2:AminoacydSequence) WHERE p1<>p2 "+
              "AND NOT (p1:AminoacydSequence) -[:ALLIGNS] -> () "+
              "CALL bio.swexec(p1, p2) return count(p1);\n");
		wstream.write("MATCH(p1:AminoacydSequence) "+
                "WHERE NOT (p1:AminoacydSequence) -[:STRUCTURES] -> () "+
                "CALL bio.proteinStructure(p1) return count(p1);\n")

	}

	//wstream.write("MATCH (p1:DNASequence), (p2:DNASequence) WHERE p1<>p2 CALL bio.swexec(p1, p2) return p1;\n");
					

}

wstream.end();



