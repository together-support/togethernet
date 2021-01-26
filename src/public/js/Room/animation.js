import store from '@js/store';

export const keyboardEvent = (event) => {
  event.preventDefault();

  if(['ArrowUp', 'ArrowLeft', 'ArrowRight', 'ArrowDown'].includes(event.key)) {
    hideEphemeralMessageText();
    animateUser(event.key);
  }
};

const animateUser = (eventKey) => {
  const currentColumnStart = parseInt($('#user .shadow').css('grid-column-start')  );
  const currentRowStart = parseInt($('#user .shadow').css('grid-row-start'));
  let {newColumnStart, newRowStart} = animationEvents[eventKey]({currentColumnStart, currentRowStart});

  const $shadow = $('#user .shadow');
  $shadow[0].style.gridColumnStart = newColumnStart;
  $shadow[0].style.gridRowStart = newRowStart;

  $('#user .avatar').animate({    
      'left': $shadow.position().left,
      'top': $shadow.position().top,
  }, {
    duration: 180,
    complete: onAnimationComplete
  });

  $('#user .shadow')[0].scrollIntoView();
}

const totalX = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--cell-horizontal-num'));
const totalY = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--cell-vertical-num'));

const moveUp = ({currentColumnStart: newColumnStart, currentRowStart}) => {
  const newRowStart = currentRowStart - 1 < 1 ? totalY : currentRowStart - 1;
  return {newColumnStart, newRowStart};
};

const moveDown = ({currentColumnStart: newColumnStart, currentRowStart}) => {
  const newRowStart = currentRowStart + 1 > totalY ? 1 : currentRowStart + 1;
  return {newColumnStart, newRowStart};
};
const moveLeft = ({currentColumnStart, currentRowStart: newRowStart}) => {
  const newColumnStart = currentColumnStart - 1 < 1 ? totalX : currentColumnStart - 1;
  return {newColumnStart, newRowStart};
};
const moveRight = ({currentColumnStart, currentRowStart: newRowStart}) => {
  const newColumnStart = currentColumnStart + 1 > totalX ? 1 : currentColumnStart + 1;
  return {newColumnStart, newRowStart};
};

const animationEvents = {
  'ArrowUp': moveUp,
  'ArrowLeft': moveLeft,
  'ArrowRight': moveRight,
  'ArrowDown': moveDown
};

export const hideEphemeralMessageText = () => {
  $('.ephemeralMessageContainer').finish().fadeOut(500);
};

export const onAnimationComplete = () => {
  showAdjacentMessages();
  sendPositionToPeers();
};

const showAdjacentMessages = () => {
  const adjacentMessages = store.getCurrentUser().getAdjacentMessages();
  adjacentMessages.forEach(messageRecord => $(messageRecord).trigger('adjacent'));

  $('#writeMessage').trigger({
    type: 'messageThread', 
    threadPreviousMessage: adjacentMessages.length === 1 && adjacentMessages[0],
  });
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