const express = require('express');
const router = express.Router();
const redis = require("redis");
const Queue = require('bull');

//connect to queue
const hashQueue = new Queue('hash checking', {redis: {port: 6379, host: '192.168.178.131'}});


//API FOR STATUS
router.get('/status', function(req, res) {

  //check id value
  let id = req.query.id;

  if (id) {

    //get job data
    hashQueue.getJob(id).then(job => {

      console.log(`job ${job.id} - status sent`);
      res.status(200).send(job);
    });
  }
  else {

    //if id is not found
    res.status(412).send(`not a valid id sent`);
  }
});


//API FOR FAILED JOBS
router.get('/failed', function(req, res) {

  //get failed job
  hashQueue.getFailed().then(result => {
    console.log(`getFailedjobs: ${result.length}`);
    res.status(200).send(result)
  });
});


//API FOR KILLING JOBS
router.get('/kill', function(req, res) {

    //check id value
    let id = req.query.id;

    if (id) {

      //kill a job
      hashQueue.getJob(id).then(job => {
        console.log(`job ${job.id} - job is to to be killed`);

        job.update({hash: job.data.hash ,kill: 'yes'})
        .then(response => {
          console.log(`job ${job.id} - job updated: ${response}`)
        });

        job.getState().then(result => {

          console.log(`job ${job.id} - job getState: ${result}`);
          res.status(200).send(job);
        });
      });
    
    } else {

      res.status(412).send(`not a valid id sent`);
    }  
});




module.exports = router;