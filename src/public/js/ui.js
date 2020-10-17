let $cell = 50;
let $userPos, $userX, $userY;
let $sendX = 0;
let $sendY = 0;
let $chatPos, $chatX, $chatY, $chatW, $chatH;
let $snap = 1;
let $hideBubble = false;

import {isPrivateVisible} from './util.js'

$(document).ready(() => {
  // // log div positions into variables when document finished loading
  // $userPos = $("#user").position();
  // $userX = $userPos.left;
  // $userY = $userPos.top;
  // $chatPos = $("#privateMsgToggle").position();
  // $chatX = $chatPos.left;
  // $chatY = $chatPos.top;
  // $chatW = $("#privateMsgToggle").width();
  // $chatH = $("#privateMsgToggle").height();

  // $(() => {
  //   $("#user").draggable({ grid: [$cell, $cell] });
  //   $userPos = $("#user").position();
  //   $userX = $userPos.left;
  //   $userY = $userPos.top;
  // });

  // $("#privateMsgToggle").keydown(function (evt) {
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

  $("#_infoToggle").click(() => {
    // $("#infoToggleIcon").toggleClass("fas fa-eye fas fa-eye-slash");
    // $(".overlay").toggle();

    // if (isPrivateVisible) {
    //   $(".overlay").text("p2p mode does not store any messages on the server.");
    // } else {
    //   $(".overlay").text(
    //     "archival mode automatically pushes messages to the server."
    //   );
    // }
  });

  $("#ephemeralMode").click(() => {
    // if (!isPrivateVisible) {
    //   $(".privateMsg").show();
    //   $(".publicMsg").hide();
    // }
  });

  $("#archivalMode").click(function () {
    // if (isPrivateVisible) {
    //   $(".privateMsg").hide();
    //   $(".publicMsg").show();
    // }
  });

  $("#_duoToggle").click(function () {
    // $("#duoToggleIcon").toggleClass("fas fa-plus fas fa-minus");
    // if (isPrivateVisible) {
    //   $(".publicMsg").toggle();
    // }
  });

  // under dev alerts
  $("#_breakoutZone").click(function () {
    // alert("Breakout zones coming soon");
  });
});

export const getUserPos = () => ({userX: $userX, userY: $userY});

export const hideBubble = () => ($hideBubble);