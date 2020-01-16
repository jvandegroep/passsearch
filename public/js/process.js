// get response and hash value
function getInput(){

  //get input from field
  let input = document.getElementById('inputPassword').value;

  if (input !== "") {

    document.getElementById('inputPassword').value = "";

    //hash input value
    let encrypted = CryptoJS.SHA1(input);
    let hash = (CryptoJS.enc.Hex.stringify(encrypted)).toUpperCase();

    sendInput(hash);
  }
  else {

    alert('no input received')
  }
  
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

      //if response
      if (result !== '') {

        let hash = JSON.parse(result.data).hash;
        let beginOn = new Date(parseInt(result.timestamp)).toLocaleTimeString();
        let now = new Date().getTime();
        let duration = result.finishedOn ? timeConversion(parseInt(result.finishedOn) - parseInt(result.timestamp)) : timeConversion(now - parseInt(result.timestamp));
        let finishedOn = result.finishedOn ? new Date(parseInt(result.finishedOn)).toLocaleTimeString() : "";
        let status = result.finishedOn ? "completed" : "running";
        let rowFound = result.returnvalue ? (JSON.parse(result.returnvalue).status).substr(20, JSON.parse(result.returnvalue).status.length) : "";
        
        console.log(`job status of id ${id}: ${result.returnvalue}`)

        //add job data to table
        appendToTable("outputTable", id, hash, beginOn, finishedOn, duration, rowFound, status);
      }
      //if no response
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

function appendToTable(tableName, id, hash, beginOn, finishedOn, duration, rowFound, status) {

  //set row
  let content = `
    <tr>
      <th scope="row">${id}</th>
      <td>${hash}</td>
      <td>${beginOn}</td>
      <td>${finishedOn}</td>
      <td>${duration}}</td>
      <td>${rowFound}</td>
      <td>${status}</td>
      <td>
        <div class="btn-group" role="group" aria-label="Basic example">
          <button type="button" class="btn btn-secondary"></button>
          <button type="button" class="btn btn-secondary"></button>
          <button type="button" class="btn btn-secondary"></button>
        </div>
      </td>
    </tr>`

  //find row index
  let row = $(`#${tableName} > tbody > tr > th:contains(${id})`);

  if (row.length > 0) {

    //get row index number
    let rowIndex = row[0].parentNode.rowIndex;

    //existing row found
    console.log(`Existing row found, index: ${rowIndex}`);

    //remove existing row
    $(`#${tableName} > tbody > tr`).eq(rowIndex -1).remove();

    //append content to removed row
    $(`#${tableName} > tbody > tr`).eq(rowIndex -2).after(content);

  } else {

    //no existing row found
    console.log(`No existing row found`);

    //append content to last row
    $(`#${tableName} > tbody:last-child`).append(content)

  }

  //check if job is finished
  if (finishedOn === ""){

    //rerun job
    console.log(`job not ready yet, rerunning..`)
    setTimeout(() => {

      checkJob(id);
    },3000)
  }
  else {

    console.log(`job finished, status: ${status}`)
  }

}



// Load when document is ready
$(document).ready(function() {

  //do when button clicked
  $('#searchButton').click(function() {

    console.log('searching..');
    getInput();    
  });

  $('#inputPassword').keypress(function(e){
    if(e.keyCode==13) {
      $('#searchButton').click();
    }
  });

});
