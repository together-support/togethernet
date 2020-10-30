let $cell = 50;
let $userPos, $userX, $userY;
let $sendX = 0;
let $sendY = 0;
let $chatPos, $chatX, $chatY, $chatW, $chatH;
let $snap = 1;
let $hideBubble = false;

import {isPrivateVisible} from './util.js'

$(document).ready(() => {
  // $(() => {
  //   $("#user").draggable({ grid: [$cell, $cell] });
  //   $userPos = $("#user").position();
  //   $userX = $userPos.left;
  //   $userY = $userPos.top;
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
    if (!isPrivateVisible) {
      $(".privateMsg").show();
      $(".publicMsg").hide();
    }
  });

  $("#archivalMode").click(function () {
    if (isPrivateVisible) {
      $(".privateMsg").hide();
      $(".publicMsg").show();
    }
  });
});

export const getUserPos = () => ({userX: $userX, userY: $userY});

export const hideBubble = () => ($hideBubble);