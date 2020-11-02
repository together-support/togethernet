import store from '../store/index.js';
import {removeAllSystemMessage} from './systemMessage.js';
import {userAvatar} from '../components/users.js';
import {myTextRecord} from '../components/message.js';

export const renderOutgoingEphemeralMessage = (data) => {
  removeAllSystemMessage();
  const outgoingMessage = myTextRecord(data);
  outgoingMessage.appendTo($(`#${store.get('room')}`));
}

export const removeMessage = (event) => {
  event.preventDefault();
  const $messageRecord = $(event.target).parent().parent();
  $messageRecord.finish().animate({opacity: 0}, {
    complete: () => {
      $messageRecord.remove();
      store.sendToPeers({
        type: 'removeEphemeralMessage',
        data: {messageId: $messageRecord.attr('id')}
      });
      store.removeEphemeralHistory({room: store.get('room'), messageId: $messageRecord.attr('id')})
    }
  });  
};

export const attachKeyboardEvents = ($element) => {
  store.set('rightBoundary', store.get('leftBoundary') + $element.width());
  store.set('bottomBoundary', store.get('topBoundary') + $element.height());

  $element.on('keydown', (event) => {
    event.preventDefault();
    if(['ArrowUp', 'ArrowLeft', 'ArrowRight', 'ArrowDown'].includes(event.key)) {
      animationEvents[event.key]();
    }
  });
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

export const renderUserAvatar = () => {
  userAvatar().appendTo($(`#${store.get('room')}`));
  store.set('avatarSize', $("#user").width());
  makeDraggableUser();
}

const makeDraggableUser = () => {
  $("#user").draggable({
    grid: [store.get('avatarSize'), store.get('avatarSize')],
    stop: onAnimationComplete,
  });
}

const onAnimationComplete = () => {
  showAdjacentMessages();
  sendPositionToPeers();
}

const showAdjacentMessages = () => {
  const {left, top} = $('#user').position();
  const adjacentPositions = [
    `${left}-${top + store.get('avatarSize')}`,
    `${left}-${top - store.get('avatarSize')}`,
    `${left - store.get('avatarSize')}-${top}`,
    `${left + store.get('avatarSize')}-${top}`,
  ]

  adjacentPositions.forEach(position => {
    $(`#${store.get('room')}-${position}`).trigger('adjacent');
  })
}  

const sendPositionToPeers = () => {
  store.sendToPeers({
    type: 'position', 
    data: {
      x: $('#user').position().left,
      y: $('#user').position().top,
      room: store.get('room'),
    }
  });
}
