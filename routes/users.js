var express = require('express');
var steem = require('steem');
var router = express.Router();

/* GET users listing. */
router.get('/', function (req, res, next) {
    var author = req.query.author;
    var iso_date = new Date();
    var date = iso_date.toISOString().slice(0, 19);

    steem.api.getAccounts([author], function (err, acc) {
        console.log(typeof acc); // object 라고 나오므로 JSON.parse 할 필요가 없음 https://stackoverflow.com/questions/38380462/syntaxerror-unexpected-token-o-in-json-at-position-1
        var account = acc[0]; // TODO: acc 가 존재 하지 않는 경우 방어 코드
        var profile = JSON.parse(account.json_metadata).profile; // json_metadata는 string 형식이라 JSON.parse 해야함

        steem.api.getDiscussionsByAuthorBeforeDate(author, '', date, 100, function (err, disc) {

            var photos_data = [];

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

            res.render('users', {
                title: 'SteemPhoto',
                name: account.name,
                about: profile.about,
                profile_image: profile.profile_image,
                post_count: '123',
                follower_count: '123',
                following_count: '123',
                photos: photos_data
            });
        });

    });

});

module.exports = router;
