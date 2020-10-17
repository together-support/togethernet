navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia 
    || navigator.mozGetUserMedia || navigator.msGetUserMedia; 

if (!navigator.getUserMedia) {
  alert("WebRTC is not supported!"); 
}
