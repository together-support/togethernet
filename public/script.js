
//Client Socket Handling
var socket,myColor,mySize;
let inconsolata;
let myFont

function setup()
{
  createCanvas(1000,500);
  background(51);
  socket=io();
  mySize = random(10,40)
  myColor = [random(255), random(255), random(255)];
  $('form').submit(function(){
  socket.emit('chat message', drawmytext($('#m').val()));
  $('#m').val('');
  console.log($('#m').val())
  return false;
  });
  socket.on('chat message',drawotherstext);
  
}

function draw()
{
  

  
}

function drawotherstext(msg)
{
  var x_coord=msg.x;
  var y_coord=msg.y;
  textSize(msg.size)
  text(msg.text,x_coord,y_coord);
  fill(msg.color[0],msg.color[1],msg.color[2])



  console.log(msg);
}

function drawmytext(mytext)
{
  var x_coord=random_num(1,700);
  var y_coord= random_num(1,300);
  textSize(mySize);
  text(mytext,x_coord,y_coord);
  fill(myColor[0], myColor[1], myColor[2]);

  var text_data={
    x:x_coord,
    y:y_coord,
    text:mytext,
    size:mySize,
    color:myColor
  }
  return text_data;
  
}

function random_num(min, max) { // min and max included 
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function newDrawing(data)
{
  noStroke();
  fill(255,0,100);
  ellipse(data.x,data.y,36,36)
}
function mouseDragged()
{
  console.log('Sending: '+mouseX+','+mouseY);
  var data={
    x:mouseX,
    y:mouseY
  }

}



//Interesting sources:
//https://creative-coding.decontextualize.com/making-games-with-p5-play/

// let messageDiv; // where all messages display
// let messageInput; // text field to type message
// let sendBtn;

// function setup() {

//   messageUI();
// }

// function draw() {}

function messageUI() {
  // select HTML elements
  messageDiv = document.querySelector("#_messageDiv"); // past messages go here
  messageInput = document.querySelector("#_messageInput"); // text input for message
  sendBtn = document.querySelector("#_sendBtn"); // send button

  // set events for sending message > trigger the sendMessage() function
  // -> for when button is blicked
  sendBtn.addEventListener("click", sendMessage);
  // -> for when "enter" is pressed in input field
  messageInput.addEventListener("keyup", function(event) {
    if (event.keyCode === 13) {
      sendMessage();
      return false;
    }
  });
}

function sendMessage() {
  // triggers when button or enter key is pressed

  // set text be value of input field
  let text = messageInput.value;

  console.log(`sending message: ${text}`); // note: using template literal string: ${variable} inside backticks

  // add HTML to end of messageDiv
  // the message is wrapped in a div with class "message" so it can be styled in CSS
  messageDiv.insertAdjacentHTML(
    "beforeend",
    `<div class="message">
        <p>${text}</p>
    </div>`
  );

  // clear input field
  messageInput.value = "";

  // auto-scroll message container
  messageDiv.scrollTop = messageDiv.scrollHeight - messageDiv.clientHeight;
}
