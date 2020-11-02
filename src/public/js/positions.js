import store from '../store/index.js';

export const sendPositionToPeers = () => {
  store.sendToPeers({
    type: 'position', 
    data: {
      x: $('#user').position().left,
      y: $('#user').position().top,
    }
  });
}

export const showAdjacentMessages = () => {
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

