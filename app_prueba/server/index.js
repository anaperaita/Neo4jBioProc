
var types = require('./../common/commonTypes.js')
var GraphType= types.GraphType;
var AllignType = types.AllignType;
var evaluate = require('./evaluate.js')
const config = require('./config.js');
var express = require('express');
var multer  = require('multer')
var app = express();
var evaluateInstance = new evaluate();

app.set('port', process.env.PORT || config.server.port);
app.set('views', __dirname + '/../views');
app.set('view engine', 'jade');

app.use('/stylesheets', express.static(__dirname + '/../stylesheets'));
app.use('/node_modules', express.static(__dirname + '/../node_modules'));
app.use('/views', express.static(__dirname + '/../views'));
app.use('/common', express.static(__dirname + '/../common'));
// parse multipart 
var multer  = require('multer')
var upload = multer({ dest: 'uploads/' })


app.set('view engine', 'jade');


app.get('/', function (req, res) {
    res.render('index.jade', { title: 'App Prueba'});
});

/**
 * Busca un score de ADN
 */
app.post('/searchScoreDNA',upload.array(), function (req, res) {
    console.log('post');
    score=parseInt(req.body.score)
    if(score==null){
        score=-1
    }
    pattern=req.body.pattern
    if(pattern==null || pattern.match('( +)') || pattern == ""){
        pattern='.*'
    }
    evaluateInstance.getNodesWithScoresDNAHigherThan(score, pattern).then(function (edges){
        if(edges.length > 100){
             var st = "Searched for protein allign with score " + req.body.score +
             ". Too many elements returned (max 100)"
            res.send({type: GraphType.NONE , status: st});
        }else{
            evaluateInstance.getAllNodesDNA(score, pattern).then(function (nodes){
                var st = "Searched for DNA allign with score " + req.body.score 
                res.send({type: GraphType.ALLIGN , status: st, scores:edges, nodes:nodes, allignType:AllignType.DNA});
            });
        }
    })

});

/**
 * Busca las proteinas con un score
 */
app.post('/searchScoreProteins',upload.array(), function (req, res) {
    console.log('post');
    score=parseInt(req.body.score)
    if(score==null){
        score=-1
    }
    pattern=req.body.pattern
    if(pattern==null || pattern==""||pattern.match('( +)')){
        pattern='.*'
    }
    evaluateInstance.getNodesWithScoresProteinsHigherThan(score, pattern).then(function (edges){
        if(edges.length > 100){
             var st = "Searched for protein allign with score " + req.body.score +
             ". Too many elements returned (max 100)"
            res.send({type: GraphType.NONE , status: st});
        }else{
            evaluateInstance.getAllNodesProteins(score, pattern).then(function (nodes){
                var st = "Searched for protein allign with score " + req.body.score 
                res.send({type: GraphType.ALLIGN  , status: st, scores:edges, nodes:nodes, allignType:AllignType.AMINO});
            });
        }
    })

});
/**
 * Añade una secuencia a la base de datos
 */
app.post('/addSequence',upload.array(), function (req, res) {
    console.log('post');
    if(req.body.sequence==null || req.body.infoId==null){
        var st = "Error adding sequence"
        res.send({type: GraphType.NONE  , status: st});
        return;
    }
    evaluateInstance.addAndAllign(req.body.sequence, req.body.infoId)
    
    var st = "Adding " + req.body.sequence
    res.send({type: GraphType.NONE  , status: st});
});

/**
 * Puebla la base de datos
 */
app.post('/populate',upload.single('fasta'), function (req, res) {
    console.log('post');
    if (!req.file)
        return res.status(400).send({type: GraphType.NONE  ,status:'No files were uploaded.'});
    if(req.body.info == null)
        return res.status(400).send({type: GraphType.NONE  ,status:'Info not defined'});

    evaluateInstance.populate(req.file.path, req.body.info)
   
    var st = "Populating with file " + req.file.originalname
    res.send({type: GraphType.NONE  , status: st});
});


/**
 * Añade información a la base de datos
 */
app.post('/addInfo',upload.array(), function (req, res) {
    console.log('post');
    if(req.body.startCodons==null){
        var st = "Error adding info " 
        res.send({type: GraphType.NONE  , status: st});
    }else{
        listCodons = evaluateInstance.parseStartCodons(req.body.startCodons);
        if(listCodons.length <=0){
            var st = "Error adding info "
            res.send({type: GraphType.NONE  , status: st});
        }else{
            var infoId = evaluateInstance.createInfoNode(req.body.name, req.body.sciname, listCodons)
            infoId.then(function(id){
                var st = "Adding info " + id
                res.send({type: GraphType.NONE  , status: st});
            });
            
        }
    }
});
/**
 * Obtiene informacion de la base de datos
 */

app.post('/getInfo',upload.array(), function (req, res) {
    console.log('post');
    evaluateInstance.getDataFromInfo(req.body.infoId).then(function (lista){
        var st = "Getting Info ";
        res.send({type: GraphType.DEPTH , status: st, info: lista});
    });

});

/**
 * Obtiene info de ADN desde la base de datos
 */
app.post('/getInfoDNA',upload.array(), function (req, res) {
    console.log('post');
    evaluateInstance.getDataFromInfoDNA(req.body.infoDNA).then(function (lista){
        var st = "Getting DNA Info";
        res.send({type: GraphType.DEPTH , status: st, info: lista});
    });

});

/**
 * Obtiene info de las proteinas desde la base de datos
 */
app.post('/getInfoProtein',upload.array(), function (req, res) {
    console.log('post');
    evaluateInstance.getDataFromInfoProtein(req.body.infoProtein).then(function (lista){
        var st = "Getting Protein Info";
        res.send({type: GraphType.DEPTH , status: st, info: lista});
    });

});

/**
 * Obtiene toda la informacion asociada a una id
 */
app.post('/getAllInfo',upload.array(), function (req, res) {
    console.log('post');
    evaluateInstance.getAllInfo(req.body.infoId).then(function (lista){
        var st = "Getting Info";
        res.send({type: GraphType.DEPTH , status: st, info: lista});
    });

});


app.listen(config.server.port, function () {
  console.log('Example app listening on port '+config.server.port+'!');
});
