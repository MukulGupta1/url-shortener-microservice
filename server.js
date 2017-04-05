var mongo = require('mongodb').MongoClient;
var url = 'mongodb://localhost:27017/data';
var obj = {};
var db;
var maxShortUrl;
var collection;
var baseUrl = 'https://url-shortener-mukulg.c9users.io';
var shortUrl;

mongo.connect(url, function(err, dbase) {
    if (err) return console.log(err) ;
    db = dbase;
    collection = db.collection('urls');
    app.listen(8080, () => {
      if (err) return console.log(err);
      console.log('Listening on port 8080');
    });
});

var express = require('express');
var app = express();

var re = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/gi;

app.use(function(req, res) {  // GET 'http://www.example.com/new/url'
  var responseObj = {};
  var url = req.url.substr(1);
  shortUrl = baseUrl + '/'  + url;
  collection.find({"short_url":shortUrl}).toArray(function(err, documents){
    if (err) throw err;
    if(!isEmpty(documents)){
      res.redirect(documents[0]['original_url']);
    }
    else{
      if(re.test(url)){
        collection.find({"original_url":url}).toArray(function(err,documents){
          if(err) throw err;
          if(!isEmpty(documents)){
            responseObj = documents[0];
            delete responseObj._id;
            res.send(JSON.stringify(responseObj));
          }
          else{
            collection.count(function(err,count){
              if (err) return err;
              maxShortUrl = count;
              maxShortUrl++;
              responseObj['short_url'] = baseUrl + '/'  + maxShortUrl;
              responseObj['original_url'] = url;
              db.collection('urls').insert(responseObj, function(err,data){
                if (err) throw err;
                delete responseObj._id;
                res.send(JSON.stringify(responseObj));
              });
            })
          }
        });
      }
      else{
        responseObj['original_url'] = 'Url is invalid';
        res.end(JSON.stringify(responseObj));
      }
    }
  })
});


function isEmpty(obj) {
    for (var key in obj) {
        if (hasOwnProperty.call(obj, key)) return false;
    }
    return true;
}