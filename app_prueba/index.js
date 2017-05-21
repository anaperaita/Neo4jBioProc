

var evaluate = require('./evaluate.js')
var express = require('express');
var multer  = require('multer')
var app = express();
var evaluateInstance = new evaluate();

app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

app.use('/stylesheets', express.static(__dirname + '/stylesheets'));

// parse multipart 
var multer  = require('multer')
var upload = multer({ dest: 'uploads/' })

app.set('view engine', 'jade');

app.get('/', function (req, res) {
    res.render('index.jade', { title: 'Hey'});
});

app.post('/searchScore',upload.array(), function (req, res) {
    console.log('post');
    evaluateInstance.getNodesWithScoresLessThan(parseInt(req.body.score)).then(function (tabla){
      var st = "Searched for alling with score" + req.body.score 
      res.render('index.jade', { title: 'Hey', status: st, scores:tabla});
    })

});
app.post('/searchSequence',upload.array(), function (req, res) {
    console.log('post');
    evaluateInstance.addAndAllign(req.body.sequence)
    var st = "Adding " + req.body.sequence
    res.render('index.jade', { title: 'Hey', status: st});
});

app.post('/populate',upload.single('fasta'), function (req, res) {
    console.log('post');
    if (!req.file)
        return res.status(400).send('No files were uploaded.');
    evaluateInstance.populate(req.file.path)
    var st = "Populating with file " + req.file.originalname
    res.render('index.jade', { title: 'Hey', status: st});
});




app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
