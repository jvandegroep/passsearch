let express = require('express');
let router = express.Router();
let redis = require("redis");
let redisScan = require("redisscan");

// setup redis client
let redisClient = redis.createClient({
  port: 6379,
  host: '192.168.178.131'
});

/* GET passSearch page */
router.get('/status', function(req, res) {

  //log request
  let fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
  console.log('job status URL:', fullUrl);

  //check id value
  let id = req.query.id;

  if (id == '') {

    //if id is not found
    res.status(412).send(`not a valid id sent`);
  }
  else {

    //if true
    let key = 'bull:hash checking:' + id;

    console.log(`job ${id} - key: ${key}`);

    let arr ={};

    redisScan({
      redis: redisClient,
      pattern: key,
      keys_only: false,
      each_callback: function (type, key, subkey, length, value, cb) {
          
          //add key and value to object
          arr[subkey] = value

          cb();
      },
      done_callback: function (err) {
          console.log(`job ${id} - redit response: ${JSON.stringify(arr)}`);

          res.status(200).send(arr);
      }
    });
  }
});

module.exports = router;
