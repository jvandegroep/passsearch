// get response and hash value
function getInput(){

  //get input from field
  let input = document.getElementById('inputPassword').value;

  let encrypted = CryptoJS.SHA1(input);
  let hash = (CryptoJS.enc.Hex.stringify(encrypted)).toUpperCase();

  sendInput(hash);
}


// send input
function sendInput(data) {

  fetch(window.location.href + "passsearch?hash=" + data)
    .then((response) => {
      return response.json();
    })
    .then((result) => {
      if (result !== null) {
      
        console.log('api response: ',result);

        // show outputDiv
        document.getElementById('outputDiv').style.display = 'block';

        //check job status
        checkJob(result.id);
      }
      else {
        console.log('no result from hash being send!')
      }
    });
}

// check status of job
function checkJob(id) {

  fetch(window.location.href + "jobstatus?id=" + id)
    .then((response) => {
      return response.json();
    })
    .then(result => {
      if (result !== '') {

        let hash = JSON.parse(result.data).hash;
        let beginOn = new Date(parseInt(result.timestamp)).toLocaleTimeString();
        let now = new Date().getTime();
        let duration = timeConversion(now - parseInt(result.timestamp));

        console.log(`job status of id ${id}: ${result.timestamp}`)

        //add job data to table if not existing
        let row = $(`#outputTable tbody > tr > th:contains(${id})`);
        if ( row.length == 0 ) {

          console.log(`append data to table`)
          $("#outputTable > tbody:last-child").append(`
          <tr>
            <th scope="row">${id}</th>
            <td>${hash}</td>
            <td>${beginOn}</td>
            <td></td>
            <td>${duration}}</td>
            <td></td>
            <td>running</td>
          </tr>`)
        } else {

          console.log(`Job stil running, updating row ${row[0].parentNode.rowIndex}`)
          
          //remove existing table row
          $(`#outputTable tbody > tr:eq(${(row[0].parentNode.rowIndex) -1})`).remove();
          
          //append new row with new duration
          $("#outputTable > tbody:last-child").append(`
          <tr>
            <th scope="row">${id}</th>
            <td>${hash}</td>
            <td>${beginOn}</td>
            <td></td>
            <td>${duration}</td>
            <td></td>
            <td>running</td>
          </tr>`)
        }


        //check if job is finished
        if (typeof result.finishedOn === 'undefined'){

          //rerun job
          console.log(`job not ready yet, rerunning..`)
          setTimeout(() => {

            checkJob(id);
          },3000)
        }
        else {

          console.log(`job finished, status: ${result.finishedOn}`);

          row = $(`#outputTable tbody > tr > th:contains(${id})`);

          let finishedOn = new Date(parseInt(result.finishedOn)).toLocaleTimeString();
          let status = JSON.parse(result.returnvalue).status;
          duration = timeConversion(parseInt(result.finishedOn) - parseInt(result.timestamp));

          //remove existing table row
          $(`#outputTable tbody > tr:eq(${(row[0].parentNode.rowIndex) -1})`).remove();
          
          //append new row with full data
          $("#outputTable > tbody:last-child").append(`
          <tr>
            <th scope="row">${id}</th>
            <td>${hash}</td>
            <td>${beginOn}</td>
            <td>${finishedOn}</td>
            <td>${duration}</td>
            <td>${status.substr(20, status.length)}</td>
            <td>completed</td>
          </tr>`)
          
          
        }
      }
      else {
        console.log(`no data received for job id ${id}`)
      }
    })
}


// miliseconds to human readable time
function timeConversion(millisec) {

  var seconds = (millisec / 1000).toFixed(1);

  var minutes = (millisec / (1000 * 60)).toFixed(1);

  var hours = (millisec / (1000 * 60 * 60)).toFixed(1);

  var days = (millisec / (1000 * 60 * 60 * 24)).toFixed(1);

  if (seconds < 60) {
      return seconds + " Sec";
  } else if (minutes < 60) {
      return minutes + " Min";
  } else if (hours < 24) {
      return hours + " Uur";
  } else {
      return days + " Dagen"
  }
}





// Load when document is ready
$(document).ready(function() {

  //do when button clicked
  $('#searchButton').click(function() {

    console.log('searching..');
    getInput();    
  });

});
