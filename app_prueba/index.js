

var evaluate = require('./evaluate.js')
var express = require('express');
var multer  = require('multer')
var app = express();
var evaluateInstance = new evaluate();

app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

app.use('/stylesheets', express.static(__dirname + '/stylesheets'));
app.use('/node_modules', express.static(__dirname + '/node_modules'));
app.use('/views', express.static(__dirname + '/views'));
// parse multipart 
var multer  = require('multer')
var upload = multer({ dest: 'uploads/' })

app.set('view engine', 'jade');



app.get('/', function (req, res) {
    res.render('index.jade', { title: 'Hey'});
});

app.post('/searchScoreDNA',upload.array(), function (req, res) {
    console.log('post');
    evaluateInstance.getNodesWithScoresDNAHigherThan(parseInt(req.body.score)).then(function (edges){
        evaluateInstance.getAllNodesDNA().then(function (nodes){
            var st = "Searched for DNA allign with score" + req.body.score 
            res.send({status: st, scores:edges, nodes:nodes});
        });
    })

});

app.post('/searchScoreProteins',upload.array(), function (req, res) {
    console.log('post');
    evaluateInstance.getNodesWithScoresProteinsHigherThan(parseInt(req.body.score)).then(function (edges){
        evaluateInstance.getAllNodesProteins().then(function (nodes){
            var st = "Searched for protein allign with score" + req.body.score 
            res.send({status: st, scores:edges, nodes:nodes});
        });
    })

});
app.post('/addSequence',upload.array(), function (req, res) {
    console.log('post');
    evaluateInstance.addAndAllign(req.body.sequence)
    var st = "Adding " + req.body.sequence
    res.send({status: st});
});

app.post('/populate',upload.single('fasta'), function (req, res) {
    console.log('post');
    if (!req.file)
        return res.status(400).send('No files were uploaded.');
    evaluateInstance.populate(req.file.path)
    var st = "Populating with file " + req.file.originalname
    res.send({status: st});
});




app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
