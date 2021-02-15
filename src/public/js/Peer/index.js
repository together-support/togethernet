import store from '@js/store';

export default class Peer {
  constructor(socketId, peerConnection) {
    this.socketId = socketId;
    this.peerConnection = peerConnection;

    this.state = {
      name: '',
      avatar: '',
      currentRoomId: '',
      rowStart: '1',
      columnStart: '1',
    };

    this.dataChannel = {};
  }

  getProfile = () => {
    return {
      ...this.state,
      socketId: this.socketId,
    };
  };

  $avatar = () => {
    if ($(`#peer-${this.socketId}`).length === 1) {
      return $(`#peer-${this.socketId}`);
    } else {
      return this.initAvatar();
    }
  };

  initAvatar = () => {
    const {name, rowStart, columnStart, avatar} = this.state;
    const displayName = name.slice(0, 2);
    const $avatar = $(
      `<div class="avatar newlyJoined" id="peer-${this.socketId}"><span>${displayName}<span></div>`
    );
    $avatar.css({backgroundColor: avatar});
    $avatar[0].style.gridColumnStart = columnStart;
    $avatar[0].style.gridRowStart = rowStart;

    $avatar.on('mousedown', () => $avatar.find('.makeFacilitator').show());

    $avatar.delay(1000).animate(
      {outlineColor: 'transparent'},
      {
        duration: 2000,
        complete: () => $avatar.removeClass('newlyJoined'),
      }
    );

    return $avatar;
  };

  getParticipantAvatarEl = () => {
    if ($(`#participant-${this.socketId}`).length === 1) {
      return $(`#participant-${this.socketId}`);
    } else {
      return this.initParticipantAvatar();
    }
  };

  makeFacilitatorButton = (onTransferFacilitator) => {
    const $makeFacilitatorContainer = $(
      '<div class="longPressButton makeFacilitator" style="display:none"><div class="shortLine"/></div>'
    );
    const $button = $('<button>Make Facilitator</button>');
    $button.on('mouseup', onTransferFacilitator);
    $button.appendTo($makeFacilitatorContainer);
    return $makeFacilitatorContainer;
  };

  initialize = (state) => {
    this.state = state;
  };

  updateState = (options) => {
    this.state = {
      ...this.state,
      ...options,
    };

    const {name, avatar} = this.state;
    this.$avatar()
      .finish()
      .animate({backgroundColor: avatar})
      .find('span')
      .text(String(name).slice(0, 2));
    this.getParticipantAvatarEl().finish().animate({backgroundColor: avatar});
  };

  updateDataChannel = (dataChannel) => {
    this.dataChannel = dataChannel;
  };

  updatePosition = ({rowStart, columnStart}) => {
    this.state = {...this.state, rowStart, columnStart};
    this.$avatar()[0].style.gridColumnStart = columnStart;
    this.$avatar()[0].style.gridRowStart = rowStart;
  };

  initParticipantAvatar = () => {
    const $avatar = $(
      `<div class="participant" id="participant-${this.socketId}"></div>`
    );
    $avatar.css('background-color', this.state.avatar);
    return $avatar;
  };

  renderParticipantAvatar = () => {
    const $roomLink = store.getRoom(this.state.currentRoomId).$roomLink;
    this.getParticipantAvatarEl().appendTo(
      $roomLink.find('.participantsContainer')
    );
  };

  joinedRoom = (joinedRoomId) => {
    const $peerAvatar = $(`#peer-${this.socketId}`);
    const fadeIn = () => {
      $peerAvatar[0].style.gridColumnStart = 1;
      $peerAvatar[0].style.gridRowStart = 1;
      store.getRoom(joinedRoomId).addMember(this);
    };

    if ($peerAvatar.length) {
      $peerAvatar.finish().animate({opacity: 0}, {complete: fadeIn});
    } else {
      store.getRoom(joinedRoomId).addMember(this);
    }
  }

  render = () => {
    const room = store.getRoom(this.state.currentRoomId);
    const $avatar = this.$avatar();
    
    if (room.constructor.isEphemeral) {
      $avatar.css({opacity: 1});
      if (room.hasFacilitator(store.getCurrentUser().socketId) && !room.hasFacilitator(this.socketId)) {
        this.makeFacilitatorButton(room.onTransferFacilitator).appendTo($avatar);
      }
      $avatar.toggleClass('facilitator', room.hasFacilitator(this.socketId));
    }

    $avatar.appendTo(room.$room);
  };
}
