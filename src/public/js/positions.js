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
    `${left}-${top + this.avatarSize}`,
    `${left}-${top - this.avatarSize}`,
    `${left - this.avatarSize}-${top}`,
    `${left + this.avatarSize}-${top}`,
  ]

  adjacentPositions.forEach(position => {
    $(`#${store.get('room')}-${position}`).trigger('adjacent');
  })
}

