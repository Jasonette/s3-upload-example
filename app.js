var express = require('express');
var aws = require('aws-sdk');
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
            },
            "success": {
              "type": "$widget.banner",
              "options": {
                "title": "Url",
                "description": "{{$result.filename}}"
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
    aws.config.update({accessKeyId: process.env.S3_KEY, secretAccessKey: process.env.S3_SECRET});
    var s3 = new aws.S3();
    var s3_params = {
        Bucket: req.query.bucket,
        Key: req.query.path,
        Expires: 60,
        ContentType: req.query['content-type'],
        ACL: 'public-read'
    };
    s3.getSignedUrl('putObject', s3_params, function(err, data){
        if(err){
            console.log(err);
        }
        else{
            console.log("data = ", data);
            res.json({"$result": data});
        }
    });
});
app.get('/', function (req, res) {
  res.json(template);
});

app.listen(process.env.PORT || 3000);
