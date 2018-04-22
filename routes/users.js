var express = require('express');
var steem = require('steem');
var router = express.Router();

var cookieParser = require('cookie-parser');

router.use(cookieParser());

/* GET users listing. */
router.get('/', function (req, res, next) {
    var author = req.query.author;
    var iso_date = new Date();
    var date = iso_date.toISOString().slice(0, 19);

    steem.api.getAccounts([author], function (err, acc) {
        console.log(typeof acc); // object 라고 나오므로 JSON.parse 할 필요가 없음 https://stackoverflow.com/questions/38380462/syntaxerror-unexpected-token-o-in-json-at-position-1
        var account = acc[0];

// TODO: 안녕
        if (account==null) {
          res.render('error', {
            message: 'No accounts found',
            error: {}
          });
          return;
        }
        var profile = JSON.parse(account.json_metadata).profile; // json_metadata는 string 형식이라 JSON.parse 해야함

        steem.api.getDiscussionsByAuthorBeforeDate(author, '', date, 100, function (err, disc) {

            var photos_data = [], follower_cnt=0;

            disc.forEach(function (key) {
                var raw_data = JSON.parse(key.json_metadata);
                var tags = raw_data.tags;
                var image;

                for (var i = 0; i < tags.length; i++) {
                    if ((tags[i] == 'photography') && (typeof raw_data.image != 'undefined')) {
                        image = raw_data.image[0];
                        photos_data.push(image);
                        break; // stop the loop
                    }
                }
            });
            res.cookie('photos', photos_data);
            res.cookie('name', account.name);
            res.cookie('profile_image', profile.profile_image);
            steem.api.getFollowers(author, 0, null, 999, function(err, result){
              //database 만들기 (steemphoto)
              // table name: followers
              // column name: id, follower, profile_image

              follower_cnt = result.length;

              var follower = result.map(function(item) { return item.follower; });
              var follower_profile_image = [];


              for (var i=0; i<follower.length; i++){
                var id = result[i].follower;

                follower_profile_image[i] =
                steem.api.getAccounts([id], function (err, acc_) {
                  if(!err) {
                    if(acc_[0].json_metadata) {
                      var profile_ = JSON.parse(acc_[0].json_metadata).profile;
                      if(profile_) {
                        if(profile_.profile_image) {
                          return profile_.profile_image;
                        } else {
                          return 'https://www.pinterest.com/pin/31032684912361659/';
                        }
                      } else {
                        return 'https://www.pinterest.com/pin/31032684912361659/';
                      }
                    } else {
                      return 'https://www.pinterest.com/pin/31032684912361659/';
                    }
                  }
                });
              } console.log(follower, follower_profile_image);

              //conn.query('INSERT INTO steemphoto (follower, profile_image) VALUES (?,?)', function(err, rows, fields){
              //  if(err) console.log(err);
              //});

              res.cookie('followers', follower);
              res.cookie('follower_count', follower.length)

              res.render('users', {
                  title: 'SteemPhoto',
                  name: account.name,
                  about: profile.about,
                  profile_image: profile.profile_image,
                  post_count: '123',
                  follower_count: follower_cnt,
                  following_count: '123',
                  photos: photos_data
              });
          });
        });
    });
});

router.get('/following', function (req, res){
  res.render('following', {

  });
});

router.get('/follower', function (req, res){
  var followers = req.cookies.followers;
  console.log(followers);
  res.render('follower', {
    followers: req.cookies.followers,
    follower_count: req.cookies.follower_count
  });
});

router.get('/:id', function (req, res){
  var id = req.params.id;
  res.render('layout', {
    name: req.cookies.name,
    profile_image: req.cookies.profile_image,
    photo: req.cookies.photos[id]
  });
});

module.exports = router;
