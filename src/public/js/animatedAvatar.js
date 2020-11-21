import store from '../store/index.js';
import compact from 'lodash/compact';

export const keyboardEvent = (event) => {
  event.preventDefault();

  if(['ArrowUp', 'ArrowLeft', 'ArrowRight', 'ArrowDown'].includes(event.key)) {
    hideEphemeralMessageText();
    animationEvents[event.key]();
  }
};

const moveUp = () => {
  const newY = $('#user').position().top - store.get('avatarSize');
  if (newY >= store.get('topBoundary')) {
    $("#user").finish().animate({top: `-=${store.get('avatarSize')}`}, {complete: onAnimationComplete});
  }
}

const moveDown = () => {
  const newY = $('#user').position().top + store.get('avatarSize');
  if (newY + store.get('avatarSize') <= store.get('bottomBoundary')) {
    $("#user").finish().animate({top: `+=${store.get('avatarSize')}`}, {complete: onAnimationComplete});
  }
}

const moveLeft = () => {
  const newX = $('#user').position().left - store.get('avatarSize');
  if (newX >= store.get('leftBoundary')) {
    $("#user").finish().animate({left: `-=${store.get('avatarSize')}`}, {complete: onAnimationComplete});
  }
}

const moveRight = () => {
  const newX = $('#user').position().left + store.get('avatarSize');
  if (newX + store.get('avatarSize') <= store.get('rightBoundary')) {
    $("#user").finish().animate({left: `+=${store.get('avatarSize')}`}, {complete: onAnimationComplete});
  }
}

const animationEvents = {
  'ArrowUp': moveUp,
  'ArrowLeft': moveLeft,
  'ArrowRight': moveRight,
  'ArrowDown': moveDown
}

export const makeDraggableUser = () => {
  $("#user").draggable({
    grid: [store.get('avatarSize'), store.get('avatarSize')],
    stop: onAnimationComplete,
  });

  $("#user").on('dragstart', () => {
    hideEphemeralMessageText();
  });
}

const hideEphemeralMessageText = () => {
  store.getCurrentRoom().$room.find('.textBubble.message').each((_, el) => {
    $(el).hide();
  });
}

const onAnimationComplete = () => {
  showAdjacentMessages();
  sendPositionToPeers();
}

const showAdjacentMessages = () => {
  const {left, top} = $('#user').position();

  const adjacentMessages = compact([
    `${left}-${top + store.get('avatarSize')}`,
    `${left}-${top - store.get('avatarSize')}`,
    `${left - store.get('avatarSize')}-${top}`,
    `${left + store.get('avatarSize')}-${top}`,
  ].map(position => $(`#${store.get('currentRoomId')}-${position}`)[0]));

  adjacentMessages.forEach(messageRecord => $(messageRecord).trigger('adjacent'));

  $('#messageType').trigger({
    type: 'messageThread', 
    shouldCreateThread: adjacentMessages.length === 1
  });
}  

const sendPositionToPeers = () => {
  store.sendToPeers({
    type: 'position', 
    data: {
      x: $('#user').position().left,
      y: $('#user').position().top,
    }
  });
}