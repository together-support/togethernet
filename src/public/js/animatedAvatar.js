import store from '../store/index.js';

export const keyboardEvent = (event) => {
  event.preventDefault();

  if(['ArrowUp', 'ArrowLeft', 'ArrowRight', 'ArrowDown'].includes(event.key)) {
    hideEphemeralMessageText();
    animationEvents[event.key]();
  }
};

const moveUp = () => {
  const newY = $('#user').position().top - $('#user').outerWidth();
  if (newY >= store.get('topBoundary')) {
    $('#user').finish().animate({top: `-=${$('#user').outerWidth()}`}, {complete: onAnimationComplete});
  }
};

const moveDown = () => {
  const newY = $('#user').position().top + $('#user').outerWidth();
  if (newY + $('#user').outerWidth() <= store.get('bottomBoundary')) {
    $('#user').finish().animate({top: `+=${$('#user').outerWidth()}`}, {complete: onAnimationComplete});
  }
};

const moveLeft = () => {
  const newX = $('#user').position().left - $('#user').outerWidth();
  if (newX >= store.get('leftBoundary')) {
    $('#user').finish().animate({left: `-=${$('#user').outerWidth()}`}, {complete: onAnimationComplete});
  }
};

const moveRight = () => {
  const newX = $('#user').position().left + $('#user').outerWidth();
  if (newX + $('#user').outerWidth() <= store.get('rightBoundary')) {
    $('#user').finish().animate({left: `+=${$('#user').outerWidth()}`}, {complete: onAnimationComplete});
  }
};

const animationEvents = {
  'ArrowUp': moveUp,
  'ArrowLeft': moveLeft,
  'ArrowRight': moveRight,
  'ArrowDown': moveDown
};

export const makeDraggableUser = () => {
  $('#user').draggable({
    grid: [$('#user').outerWidth(), $('#user').outerWidth()],
    stop: onAnimationComplete,
  });

  $('#user').on('dragstart', () => {
    hideEphemeralMessageText();
  });
};

const hideEphemeralMessageText = () => {
  store.getCurrentRoom().$room.find('.textBubble.message').each((_, el) => {
    $(el).hide();
  });
};

const onAnimationComplete = () => {
  showAdjacentMessages();
  sendPositionToPeers();
};

const showAdjacentMessages = () => {
  const adjacentMessages = store.getCurrentUser().getAdjacentMessages();
  adjacentMessages.forEach(messageRecord => $(messageRecord).trigger('adjacent'));

  $('#messageType').trigger({
    type: 'messageThread', 
    threadPreviousMessage: adjacentMessages.length === 1 && adjacentMessages[0],
  });
};  

const sendPositionToPeers = () => {
  store.sendToPeers({
    type: 'position', 
    data: $('#user').position(),
  });
};