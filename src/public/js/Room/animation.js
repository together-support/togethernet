import store from '@js/store';

export const keyboardEvent = (event) => {
  event.preventDefault();

  if (['ArrowUp', 'ArrowLeft', 'ArrowRight', 'ArrowDown'].includes(event.key)) {
    hideEphemeralMessageDetailsAndOverlay();
    animateUser(event.key);
  }
};

const animateUser = (eventKey) => {
  const currentColumnStart = parseInt(
    $('#user .shadow').css('grid-column-start')
  );
  const currentRowStart = parseInt($('#user .shadow').css('grid-row-start'));
  let {newColumnStart, newRowStart} = animationEvents[eventKey]({
    currentColumnStart,
    currentRowStart,
  });

  const $shadow = $('#user .shadow');
  $shadow[0].style.gridColumnStart = newColumnStart;
  $shadow[0].style.gridRowStart = newRowStart;

  $('#user .avatar').animate(
    {
      left: $shadow.position().left,
      top: $shadow.position().top,
    },
    {
      duration: 180,
      complete: onAnimationComplete,
    }
  );

  $('#user .shadow')[0].scrollIntoView();
};

const totalX = parseInt(
  getComputedStyle(document.documentElement).getPropertyValue(
    '--cell-horizontal-num'
  )
);
const totalY = parseInt(
  getComputedStyle(document.documentElement).getPropertyValue(
    '--cell-vertical-num'
  )
);

const moveUp = ({currentColumnStart: newColumnStart, currentRowStart}) => {
  const newRowStart = currentRowStart - 1 < 1 ? totalY : currentRowStart - 1;
  return {newColumnStart, newRowStart};
};

const moveDown = ({currentColumnStart: newColumnStart, currentRowStart}) => {
  const newRowStart = currentRowStart + 1 > totalY ? 1 : currentRowStart + 1;
  return {newColumnStart, newRowStart};
};
const moveLeft = ({currentColumnStart, currentRowStart: newRowStart}) => {
  const newColumnStart =
    currentColumnStart - 1 < 1 ? totalX : currentColumnStart - 1;
  return {newColumnStart, newRowStart};
};
const moveRight = ({currentColumnStart, currentRowStart: newRowStart}) => {
  const newColumnStart =
    currentColumnStart + 1 > totalX ? 1 : currentColumnStart + 1;
  return {newColumnStart, newRowStart};
};

const animationEvents = {
  ArrowUp: moveUp,
  ArrowLeft: moveLeft,
  ArrowRight: moveRight,
  ArrowDown: moveDown,
};

export const hideEphemeralMessageDetailsAndOverlay = () => {
  $('.ephemeralMessageContainer').finish().fadeOut(500);
  $('.threadedRecordOverlay').finish().hide();
  $('.threadedRecordForbiddenOverlay').finish().hide();
  $('#writeMessage').finish().removeAttr('data-thread-entry-message');
};

export const onAnimationComplete = () => {
  showAdjacentMessages();
  sendPositionToPeers();
};

const showAdjacentMessages = () => {
  const adjacentMessages = store.getCurrentUser().getAdjacentMessages();
  adjacentMessages.forEach((messageRecord) =>
    $(messageRecord).trigger('adjacent')
  );

  if (adjacentMessages.length === 1) {
    $('#writeMessage').trigger({
      type: 'messageThread',
      threadPreviousMessage: adjacentMessages[0],
    });

    $(adjacentMessages[0]).trigger('indicateThread');
  } else if (adjacentMessages.length > 1) {
    adjacentMessages.forEach(adjacentMessageId => $(adjacentMessageId).trigger('indicateThreadForbidden'));
  }
};

const sendPositionToPeers = () => {
  store.sendToPeers({
    type: 'position',
    data: {
      columnStart: $('#user .shadow').css('grid-column-start'),
      rowStart: $('#user .shadow').css('grid-row-start'),
    },
  });
};
