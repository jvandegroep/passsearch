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
      .createReadStream('V:/temp/pwnedSha1Passes.txt')
      .pipe(es.split())
      .pipe(
        es
          .mapSync(function(line) {

            linehex = (line.split(':'))[0];
            //console.log('lijn ' + i + ' value: ' + valhex)

            if (linehex == jobhex) {

              console.log('Hash found on line: ', i)
              done(null, { status: 'Hash found on line: ' + String(i) });
            }

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

  // let res2 = null;
  // res2 = res;

  //console logging
  let fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
  console.log('original URL:', fullUrl);
  console.log('query:',req.query);

  let hash = req.query.hash;

  //check input
  if (hash == ""){
    res.send('Error: (part of) input query empty');
    return;
  }

  else {

    console.log('hash: ', hash);
    hashQueue.add({'hash': hash})
    .then(function(job){
      console.log(`job ${job.id} added to queue`);
      res.send(JSON.stringify(job))
    })

  }
});

// function waitForActiveEvent(){

//   hashQueue.on('global:active', function(job, jobPromise) {

//     console.log(`Job with id ${job} has started. Status: ${jobPromise}`)

//     return()
           
//   });

// }

module.exports = router;
