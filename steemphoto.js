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
app.use(express.static('public'));

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

      steem.api.getAccounts([author], function(err, acc) {
        var profile=JSON.parse(acc[0].json_metadata).profile;
        var about=profile.about;
        var profile_image=profile.profile_image;

        var output=`
        <!DOCTYPE html>
        <html lang="ko">
          <head>
            <meta charset="utf-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1">

            <title>SteemPhoto</title>

            <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.2/css/bootstrap.min.css">
            <style>
              .no-padding {
                  padding-left: 0 !important;
                  padding-right: 0 !important;
              }
            </style>
          </head>
          <body>
                <div class="container">
                  <div class="col-xs-3"><img src=${profile_image} style="width:100%; height:auto; display: block" class="img-circle"></div>
                  <h2>${author}</h2>
                  <p class="lead">${about}</p>

                  <div class="row">
        `;
        var tag={}, image={};
        var i,j,nu = 0;

        for (i=0;i<result.length;i++) {
          tag = JSON.parse(result[i].json_metadata).tags;
          image = JSON.parse(result[i].json_metadata).image;

          for (j=0;j<tag.length;j++) {
            if (tag[j] == 'photography' || tag[j] == 'photo') {
              output += '<div class="col-xs-4 no-padding">';
              output += ('<img src='+image[0]);
              output += ' class="img-responsive" style="width: 150px; height: 150px; padding: 1px"></div>'
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
        output += '</div></div></body></html>';
        res.send(output);
      });
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
