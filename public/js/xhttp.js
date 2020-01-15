// Get DB data from url and send back data
function httpData(url,cmd,postData,res){
   var xhttp = new XMLHttpRequest();
   xhttp.onreadystatechange = function() {
     if (xhttp.readyState == 4 && (xhttp.status == 200 || xhttp.status == 201)) {
          //console.log("data received (200) from: " + DBHOST + " on port: " + DBPORT);
          res(xhttp.responseText);
        }
    if (xhttp.readyState == 4 && xhttp.status == 404) {
      console.log("connection failed, no response from URL:", url);
    }
  };
  xhttp.open(cmd, url, true);
  xhttp.timeout = 2000; // time in milliseconds
  xhttp.ontimeout = function(e) {
    console.error("Timeout, cannot contact ", url);
    res("");
  };
  xhttp.onerror = function () {
    console.log("** An error occurred during the transaction");
    res("");
  };
  if (postData) {
    xhttp.setRequestHeader('Content-type','application/json; charset=utf-8');
    xhttp.send(postData);
  } else {
    xhttp.send();
  }
}
