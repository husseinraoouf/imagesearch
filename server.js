var request = require('request');
const express = require('express');
const bodyParser = require('body-parser');
var mongo = require('mongodb').MongoClient;
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.get("/latest", function(req, res) {
    mongo.connect("mongodb://" + process.env.IP + ":27017/data1", function(err, db) {
      // db gives access to the database
      
      if (err) return err;
      var coll = db.collection('coll2');
      coll.find({}, {_id: 0}, { limit : 10, sort: {_id: -1} }).toArray(function (e, d) {
          if (e){ console.log(e)};
            //   for (var i = 0; i < d.length; i++) {
              
            //   }
        //   console.log(d);
        //   res.writeHead(200, { 'content-type': 'text/html' });
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
    mongo.connect("mongodb://" + process.env.IP + ":27017/data1", function(err, db) {
      // db gives access to the database
      if (err) return err;
      var coll = db.collection('coll2');
      coll.insert({
        term: req.params.query,
        when: new Date()
      }, function(err, data) {
        // handle error
        if (err) return err;
        // other operations
        console.log(data);
        db.close();
      });
    res.json(objs);
  });
    
});

});





var port = 8080;
app.listen(port, function() {
  console.log('server listening on port ' + port);
  console.log('https://freecodecamp-husseinraoouf.c9users.io');
});

