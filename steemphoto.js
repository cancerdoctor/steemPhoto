var steem = require ('steem');
var express = require('express');
var app = express();
var bodyParser = require('body-parser'); // post 방식 body쓰기
var fs = require('fs'); // file system. file data 저장/불러오기
var multer = require('multer'); // file upload module
var _storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads')
  },
  filename: function (req,file,cb) {
    cb(null, file.originalname)
  }
})
var upload = multer({ storage: _storage});

app.use(bodyParser.urlencoded({ extended: false }));
app.use('/user', express.static('uploads'));
app.set('view engine', 'pug');

app.get('/', function(req,res){
  var input=`
  <form action="/photo">
  <p><input type='text' name='author' placeholder='ID'></p>
  <p><input type='submit'></p>
  </form>
  `
  res.send(input);
});

app.get('/photo', function(req,res){

  var author=req.query.author;
  var date=new Date();
  console.log(date.toISOString().slice(0,19));
  //steem.api.getDiscussionsByCreated({'tag':'photo', 'limit':10}, function(err, result){
  steem.api.getDiscussionsByAuthorBeforeDate(author,'',date.toISOString().slice(0,19),100,function(err, result){
    if(err){
      console.log(err);
      app.send('Internal service error!');
    } else {
      var output='';
      var jasondata={};
      var nu = 0;


      for (var i=0;i<result.length;i++) {
        jsondata = JSON.parse(result[i].json_metadata);

        for (var j=0;j<jsondata.tags.length;j++) {
          if (jasondata.tags[j] == 'photo') {
            output += ('<h2>'+result[i].title+'</h2>');
            output += '<div style="width: 400px; height: 400px; overflow: hidden"><img src='+jasondata.image[0];
            output += ' style="width:400px"></div><br />'
            nu++;
            break;
          }
        } if (nu == 5) { break; }


/*        if (image_data.height > image_data.width) {
          output += 'width:100%; height:auto; margin-left=0><br />';
        } else {
          imageAspect = image_data.height/image_data.width;
          marginLeft = -Math.round((400/imageAspect - 400)/2);
          output += 'width:auto; height:100%; margin-left='+marginLeft+'px><br />';
        }*/

      }
      res.send(output);

    }
  });
  /*
  steem.api.getAccounts(['cancerdoctor'], function(err, result) {
      console.log(err, result);
  });
  steem.api.getState('/trends/funny', function(err, result) {
    console.log(err, result);
  });*/
});

app.listen(3000, function(){
  console.log('Connected, 3000 port!');
});
