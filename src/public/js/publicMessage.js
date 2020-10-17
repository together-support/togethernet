// let outgoingPublicMsg;
// let incomingPublicMsg;
// let publicMsg;

const ARCHIVE = '/archive';

export const addPublicMsg = (name, outgoingMsg) => {
//   let today = new Date();
//   let time = today.getHours() + ":" + today.getMinutes();

//   publicMsgIndex++;

//   // add HTML to end of privateMsg
//   // the message is wrapped in a div with class "message" so it can be styled in CSS
//   publicMsg.insertAdjacentHTML(
//     "beforeend",
//     `<div class="row">
//         <div id="_privateName">
//         <p>${name}</p>
//         </div>
//         <div id="_privateStamp">
//         <p>${time}</p>
//         </div>
//         </div>
//         <div class="message" id="message${publicMsgIndex}">
//         <p>${outgoingMsg}</p>
//         </div>`
//   );

//   // auto-scroll message container
//   publicMsg.scrollTop = publicMsg.scrollHeight - publicMsg.clientHeight;

//   // if user is in the other chat mode, send notification
//   if (
//     $(".publicMsg").is(":visible") == false &&
//     $(".privateMsg").is(":visible") == true
//   ) {
//     $("#_privacyToggle").css("border", "1px solid red");
//   } else {
//     $("#_privacyToggle").css("border", "1px solid black");
//   }
}

const archivePublicMsg = (name, msg) => {
  // await fetch(`${url}/archive`, {
  //   method: "POST",
  //   headers: {"Content-Type": "application/json"},
  //   body: JSON.stringify({name, msg})
  // })
  // .then(response => response.text())
  // .then(data => console.log(data));
}