var express = require('express');
var app = express();

var db = [];

var template = {
  "$result": {
    "head": {
      "title": "image sample",
      "actions": {
        "$pull": {
          "type": "$media.camera",
          "success": {
            "type": "$network.upload",
            "options": {
              "content-type": "{{$result['content-type']}}",
              "storage": {
                "type": "s3",
                "bucket": "fm.ethan.jason",
                "path": "",
                "sign_url": "https://imagejason.herokuapp.com/sign_url"
              }
            }
          }
        }
      }
    },
    "body": {
      "sections": [{
        "items": [{
          "type": "label",
          "text": "Pull me",
          "style": {
            "padding": "20",
            "align": "center"
          }
        }]
      }]
    }
  }
};

app.get('/sign_url', function (req, res) {
  var sig = require('amazon-s3-url-signer');
  console.log("params = ", req.body);

/*
  var bucket1 = sig.urlSigner('my key', 'my secret');

  var url1 = bucket1.getUrl('GET', 'somefile.png', 'mybucket', 10); //url expires in 10 minutes
  var url2 = bucket2.getUrl('PUT', '/somedir/somefile.png', 'mybucketonotheraccount', 10); //url expires in 100 minutes
  */
  res.json({"$result": "success"});
});
app.get('/', function (req, res) {
  res.json(template);
});

app.listen(process.env.PORT || 3000);
