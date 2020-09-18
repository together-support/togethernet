let $cell = 50;
let $userPos, $userX, $userY;
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
  });

  $(document).keydown(function (e) {
    switch (e.which) {
      // case 13:
      //   $("#user").addMsg();
      //   break;
      case 37: //left arrow key
        if ($userX - $chatPos.left > $snap) {
          $userX -= $cell;
          $("#user")
            .finish()
            .animate({
              left: `${$userX}`,
            });
        }
        break;
      case 38: //up arrow key
        if ($userY - $chatPos.top > $snap) {
          $userY -= $cell;
          $("#user")
            .finish()
            .animate({
              top: `${$userY}`,
            });
        }
        break;
      case 39: //right arrow key
        if ($chatX + $chatW - $userX - $cell > $snap) {
          $userX += $cell;
          $("#user")
            .finish()
            .animate({
              left: `${$userX}`,
            });
        }
        break;
      case 40: //bottom arrow key
        if ($chatY + $chatH - $userY - $cell > $snap) {
          $userY += $cell;
          $("#user")
            .finish()
            .animate({
              top: `${$userY}`,
            });
        }
        break;
    }
    // $hideBubble = !$hideBubble;
    // console.log(`in ui this is x ${$userX} and this is y ${$userY}`);
  });
});

let getUserPos = () => {
  return [$userX, $userY];
  // return [$sendX, $sendY];
};

let hideBubble = () => {
  return $hideBubble;
};
exports.hideBubble = hideBubble;
exports.getUserPos = getUserPos;
