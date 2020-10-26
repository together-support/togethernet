export default class AvatarAnimator {
  constructor() {
    this.$user = $('#user');
    // this.cell = 50;
    // this.sendX = 0;
    // this.sendY = 0;
    // this.chatPos
    // this.chatWidth
    // this.chatHeight = 
    // this.chatX
    // this.chatY
    // this.chatY
    // this.snap = 1
    // this.hideBubble = false
  }

  attachAnimationEvents = () => {
    $("#privateMsgToggle").on('keydown', (event) => {
      event.preventDefault();
      console.log(event.key)

      if (event.key === "ArrowUp") {
        debugger

      } else if (event.key === "ArrowDown") {
        
      } else if (event.key === "ArrowLeft") {

      } else if (event.key === "ArrowRight") {

      }
    });
  };
}

export const attachAnimationEvents = () => {
//   // will only work if #privateMsgToggle is in focus
//   evt = evt || window.event;
//   $sendX = 0;
//   $sendY = 0;
//   switch (evt.which) {
//     // case 13:
//     //   $("#user").addMsg();
//     //   break;
//     case 37: //left arrow key
//       if ($userX - $chatPos.left > $snap) {
//         $("#user")
//           .finish()
//           .animate({
//             left: `-=${$cell}`,
//           });
//         $userX -= $cell;
//       }
//       break;
//     case 38: //up arrow key
//       if ($userY - $chatPos.top > $snap) {
//         $("#user")
//           .finish()
//           .animate({
//             top: `-=${$cell}`,
//           });
//         $userY -= $cell;
//       }
//       break;
//     case 39: //right arrow key
//       if ($chatX + $chatW - $userX - $cell > $snap) {
//         $("#user")
//           .finish()
//           .animate({
//             left: `+=${$cell}`,
//           });
//         $userX += $cell;
//       }
//       break;
//     case 40: //bottom arrow key
//       if ($chatY + $chatH - $userY - $cell > $snap) {
//         $("#user")
//           .finish()
//           .animate({
//             top: `+=${$cell}`,
//           });
//         $userY += $cell;
//       }
//       break;
//   }
// });
}