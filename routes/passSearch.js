let express = require('express');
let router = express.Router();
let fs = require('fs');
let Queue = require('bull');
let es = require('event-stream');
let redis = require("redis");

// setup redis client
let redisClient = redis.createClient({
  port: 6379,
  host: '192.168.178.131'
});

// create queue
let hashQueue = new Queue('hash checking', {redis: {port: 6379, host: '192.168.178.131'}});

// create task
hashQueue.process(function(job, done){

    // do job and report progress
    job.progress(42);

    console.log('job started! with data: ', JSON.stringify(job));

    let jobhex = job.data.hash;
    let linehex;
    let i = 0;

    let s = fs
      .createReadStream('D:/temp/pwnedSha1Passes.txt')
      .pipe(es.split())
      .pipe(
        es
          .mapSync(function(line) {

            //linehex is the hash on the file line
            linehex = (line.split(':'))[0];

            //compare the input hash with the hash on the file hash
            if (linehex == jobhex) {

              console.log('Hash found on line: ', i)
              done(null, { status: 'Hash found on line: ' + String(i) });
            }

            //go to next line
            i++
          })

          .on('end', function(){

            console.log('nothing found!')
            done(null, { status:'Nothing found! searched: ' + String(i) });
          })
      )
});


/* GET passSearch page */
router.get('/', async function(req, res) {

  //console logging
  let fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
  console.log('original URL:', fullUrl);

  let hash = req.query.hash;

  //check input
  if (hash == ""){
    res.status(412).send('Error: (part of) input query empty');
  }

  else {

    //add job to queue
    hashQueue.add({'hash': hash})
    .then(function(job){

      //get response from adding queue and send back including id
      console.log(`job ${job.id} added to queue`);
      res.status(200).send(JSON.stringify(job))
    })

  }
});

module.exports = router;
