var express = require('express');
var aws = require('aws-sdk');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

var mongoose = require ("mongoose"); // The reason for this demo.



var template = {
  "$result": {
    "head": {
      "title": "image sample",
      "data": {
        "db": []
      },
      "actions": {
        "$pull": {
          "type": "$media.camera",
          "options": {
            "quality": "0.4"
          },
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
                  "path": "/",
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
        "nav": {
          "style": {
            "theme": "dark"
          }
        },
        "body": {
          "style": {
            "border": "none"
          },
          "sections": [{
            "type": "horizontal",
            "header": {
              "type": "vertical",
              "style": {
                "align": "center",
                "padding": "20",
                "z_index": "-1"
              },
              "components": [{
                "type": "image",
                "url": "https://d30y9cdsu7xlg0.cloudfront.net/png/126349-200.png",
                "style": {
                  "z_index": "-1",
                  "width": "100"
                }
              }]
            },
            "items": [
              {
                "{{#if db && db.length > 0}}": {
                  "{{#each db}}": {
                    "type": "vertical",
                    "style": {
                      "width": "200",
                      "spacing": "0",
                      "padding": "0",
                      "height": "300"
                    },
                    "components": [{
                      "type": "image",
                      "style": {
                        "width": "200"
                      },
                      "url": "{{url}}"
                    }]
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



var Post;
var initDB = function(){
  var uristring = process.env.MONGODB_URI;
  var theport = process.env.PORT || 5000;

  mongoose.connect(uristring, function (err, res) {
    if (err) {
      console.log ('ERROR connecting to: ' + uristring + '. ' + err);
    } else {
      console.log ('Succeeded connected to: ' + uristring);
    }
  });
  var postSchema = new mongoose.Schema({
    url: String
  });
  Post = mongoose.model('posts', postSchema);
};


var initServer = function(){

  var reload = function(res){
    Post.find({}).exec(function(err, result) {
      if (!err) {
        // handle result
        console.log("RESULT = ", result);
        template["$result"]["head"]["data"]["db"] = result;
        res.json(template);
      } else {
        // error handling
      };
    });
  };

  app.post('/post', function(req,res){
    var url = "https://s3-us-west-2.amazonaws.com/" + req.body.bucket + req.body.path + req.body.filename;
    var post = new Post({url: url});
    post.save(function (err) {if (err) console.log ('Error on save!')});
    reload(res);
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
    reload(res);
  });

  app.listen(process.env.PORT || 3000);
};

initDB();
initServer();
