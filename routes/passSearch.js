const express = require('express');
const router = express.Router();
const fs = require('fs');
const Queue = require('bull');
const es = require('event-stream');

// create job queue
const hashQueue = new Queue('hash checking', {redis: {port: 6379, host: '192.168.178.131'}});

// create job processer
hashQueue.process(function(job, done){

    console.log(`job ${job.id} - started with data: ${JSON.stringify(job)}`);

    let jobhex = job.data.hash;
    let linehex;
    let i = 0;
    let j = 0;

    let s = fs
      .createReadStream('V:/temp/pwnedSha1Passes.txt')
      .pipe(es.split())
      .pipe(
        es
          .mapSync(function(line) {

            //linehex is the hash on the file line
            linehex = (line.split(':'))[0];

            //compare the input hash with the hash on the file hash
            if (linehex == jobhex) {

              console.log(`job ${job.id} - Hash found on line: ${i}`)
              done(null, { status: 'Hash found on line: ' + String(i) });
            } 
            
            else {

              //go to next line
              i++
              j++

              //update progress every x cycles
              if (j >= 10000) {
                job.progress({"perc":((i / 555270000) * 100).toFixed(2), "lines": i});
                j = 0;
              }
            }
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
  console.log(`passsearch URL: ${fullUrl}`);

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
      console.log(`job ${job.id} - added job to queue`);
      res.status(200).send(JSON.stringify(job))
    })

  }
});

module.exports = router;
