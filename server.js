var request = require('request');
const express = require('express');
var mongo = require('mongodb').MongoClient;
const app = express();

var mongodbUrl = "mongodb://hussein:123456@ds121222.mlab.com:21222/heroku_64jvzvb2";

app.get("/latest", function(req, res) {
    mongo.connect(mongodbUrl, function(err, db) {
      var coll = db.collection('history');
      coll.find({}, {_id: 0}, { limit : 10, sort: {_id: -1} }).toArray(function (e, d) {
          res.json(d);
      });
    });
});

app.get("/a/:query", function(req, res) {
    var page = req.query.offset;
    if (!page) {
        page = 1;
    }
    request({
    url: 'https://pixabay.com/api/',
        qs: {key: "5296645-4b3f3ae01b186f0b74de05a9c", q: req.params.query, image_type: "photo", page: page, per_page: 10},
        method: 'GET'
    }, function (error, response) {
        if (error) {
            console.log('Error sending message: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }
        var hits = JSON.parse(response.body).hits;
        var objs = [];
        for (var i = 0; i <hits.length; i++) {
            var obj = {
                        "url":hits[i].pageURL,
                        "snippet":hits[i].tags,
                        "thumbnail":hits[i].previewURL
                    };
            objs.push(obj);
        }
        mongo.connect(mongodbUrl, function(err, db) {
            var coll = db.collection('history');
            coll.insert({
                term: req.params.query,
                when: new Date()
            }, function(err, data) {
                db.close();
            });
            res.json(objs);
        });

    });

});







var port = process.argv[2];

app.listen(port, function() {
  console.log('server listening on port ' + port);
});
