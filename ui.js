let $cell = 50;
let $userPos, $userX, $userY;
let $sendX = 0;
let $sendY = 0;
let $chatPos, $chatX, $chatY, $chatW, $chatH;
let $snap = 1;
let $hideBubble = false;

$(document).ready(function () {
  // log div positions into variables when document finished loading
  $userPos = $("#user").position();
  $userX = $userPos.left;
  $userY = $userPos.top;
  $chatPos = $("#privateMsgToggle").position();
  $chatX = $chatPos.left;
  $chatY = $chatPos.top;
  $chatW = $("#privateMsgToggle").width();
  $chatH = $("#privateMsgToggle").height();

  $(function () {
    $("#user").draggable({ grid: [$cell, $cell] });
    $userPos = $("#user").position();
    $userX = $userPos.left;
    $userY = $userPos.top;
  });

  $("#privateMsgToggle").keydown(function (evt) {
    // will only work if #privateMsgToggle is in focus
    evt = evt || window.event;
    $sendX = 0;
    $sendY = 0;
    switch (evt.which) {
      // case 13:
      //   $("#user").addMsg();
      //   break;
      case 37: //left arrow key
        if ($userX - $chatPos.left > $snap) {
          $("#user")
            .finish()
            .animate({
              left: `-=${$cell}`,
            });
          $userX -= $cell;
        }
        break;
      case 38: //up arrow key
        if ($userY - $chatPos.top > $snap) {
          $("#user")
            .finish()
            .animate({
              top: `-=${$cell}`,
            });
          $userY -= $cell;
        }
        break;
      case 39: //right arrow key
        if ($chatX + $chatW - $userX - $cell > $snap) {
          $("#user")
            .finish()
            .animate({
              left: `+=${$cell}`,
            });
          $userX += $cell;
        }
        break;
      case 40: //bottom arrow key
        if ($chatY + $chatH - $userY - $cell > $snap) {
          $("#user")
            .finish()
            .animate({
              top: `+=${$cell}`,
            });
          $userY += $cell;
        }
        break;
    }
    // $hideBubble = !$hideBubble;
    // console.log(`in ui this is x ${$userX} and this is y ${$userY}`);
  });

  $("#_infoToggle").click(function () {
    $("#infoToggleIcon").toggleClass("fas fa-eye fas fa-eye-slash");
    $(".overlay").toggle();

    if (
      $(".publicMsg").is(":visible") == false ||
      $(".privateMsg").is(":visible") == true
    ) {
      $(".overlay").text("p2p mode does not store any messages on the server.");
    }
    if (
      $(".publicMsg").is(":visible") == true &&
      $(".privateMsg").is(":visible") == false
    ) {
      $(".overlay").text(
        "archival mode automatically pushes messages to the server."
      );
    }
  });
  $("#ephemeralMode").click(function () {
    if ($(".privateMsg").is(":visible") == false) {
      $(".privateMsg").show();
      $(".publicMsg").hide();
    }
  });
  $("#archivalMode").click(function () {
    if ($(".publicMsg").is(":visible") == false) {
      $(".privateMsg").hide();
      $(".publicMsg").show();
    }
  });
  $("#_duoToggle").click(function () {
    $("#duoToggleIcon").toggleClass("fas fa-plus fas fa-minus");
    if (
      $(".privateMsg").is(":visible") == false &&
      $(".publicMsg").is(":visible") == true
    ) {
      $(".publicMsg").toggle();
    }

    // else if (
    //   $(".publicMsg").is(":visible") == true &&
    //   $(".privateMsg").is(":visible") == false
    // ) {
    //   $(".privateMsg").toggle();
    // } else if (
    //   $(".publicMsg").is(":visible") == true &&
    //   $(".privateMsg").is(":visible") == true
    // ) {
    //   $(".publicMsg").toggle();
    // }
  });
  // under dev alerts
  $("#_breakoutZone").click(function () {
    alert("Breakout zones coming soon");
  });
});

let getUserPos = () => {
  return [$userX, $userY];
};

let hideBubble = () => {
  return $hideBubble;
};
exports.hideBubble = hideBubble;
exports.getUserPos = getUserPos;
