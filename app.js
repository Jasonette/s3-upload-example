var express = require('express');
var aws = require('aws-sdk');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

var db = [];

var template = {
  "$result": {
    "head": {
      "title": "image sample",
      "data": {
        "db": db
      },
      "actions": {
        "$pull": {
          "type": "$media.camera",
          "success": {
            "type": "$network.upload",
            "options": {
              "type": "s3",
              "bucket": "fm.ethan.jason",
              "path": "",
              "sign_url": "https://imagejason.herokuapp.com/sign_url"
            },
            "success": {
              "type": "$network.request",
              "options": {
                "url": "https://imagejason.herokuapp.com/post",
                "method": "post",
                "data": {
                  "bucket": "fm.ethan.jason",
                  "path": "",
                  "filename": "{{$result.filename}}"
                }
              },
              "success": {
                "type": "$reload"
              }
            }
          }
        }
      },
      "templates": {
        "body": {
          "sections": [{
            "header": {
              "type": "label",
              "text": "Pull",
              "style": {
                "padding": "20",
                "align": "center",
                "font": "HelveticaNeue-Bold",
                "size": "40"
              }
            },
            "items": [
              {
                "{{#if db && db.length > 0}}": {
                  "{{#each db}}": {
                    "type": "image",
                    "url": "{{this}}",
                    "style": {
                      "width": "100%"
                    }
                  }
                }
              }, { 
                "{{#else}}": []
              }
            ]
          }]
        }
      }
    }
  }
};

app.post('/post', function(req,res){
console.log("req.body = ", req.body);
    var url = "https://s3.amazonaws.com/" + req.body.bucket + req.body.path + req.body.filename;
    db.push(url);
    template["$result"]["head"]["data"]["db"] = db;
    console.log("NEW TEMPLATE = ", template);
    res.json(template);
});

app.get('/sign_url', function (req, res) {
    aws.config.update({region: "us-west-2", endpoint: "https://s3-us-west-2.amazonaws.com", accessKeyId: process.env.S3_KEY, secretAccessKey: process.env.S3_SECRET});
    var s3 = new aws.S3();

    var s3_params = {
        Bucket: req.query.bucket,
        Key: req.query.path,
        Expires: 60,
        ACL: "public-read",
        ContentType: req.query['content-type']
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
