import throttle from 'lodash/throttle';
import store from '../store/store.js';
import DOMPurify from 'dompurify';

export default class MoveableUser {
  constructor() {
    this.avatarSize = $('#user').width();
    this.topBoundary = 0;
    this.leftBoundary = 0;
    this.rightBoundary = $('#ephemeralSpace').width();
    this.bottomBoundary = $('#ephemeralSpace').height();

    $(window).on('resize', throttle(this.changeBoundary, 500));
  }

  initialize = () => {
    $('#_nameInput').on('click', this.setMyUserName);
    this.initializeAvatar();
    this.makeDraggable();
    this.attachKeyboardEvents();
  };

  setMyUserName = () => {
    const name = prompt("Please enter your name:");
    if (Boolean(name)) {
      $("#_nameInput").text(DOMPurify.sanitize(name));
    }
  };

  initializeAvatar = () => {
    const $user = $('#user');
    const $userProfile = $('#userProfile');
    const randomColor = Math.floor(Math.random() * 16777216).toString(16)
    const avatarColor = `#${randomColor}${'0'.repeat(6 - randomColor.length)}`.substring(0, 7);

    store.set('avatar', avatarColor);
    $user.css('background-color', avatarColor);
    $userProfile.val(avatarColor);

    $userProfile.on('change', (e) => {
      e.preventDefault();
      $user.css('background-color', e.target.value);
      store.sendToPeers({
        type: 'changeAvatar'
      });
    });
  }

  makeDraggable = () => {
    $("#user").draggable({
      grid: [this.avatarSize, this.avatarSize],
      stop: this.onAnimationComplete,
    });
  }

  attachKeyboardEvents = () => {
    $(document).on('keydown', (e) => {
      if (['ArrowUp', 'ArrowLeft', 'ArrowRight', 'ArrowDown'].includes(e.key)){
        e.preventDefault();
      }
    });

    const animationEvents = {
      'ArrowUp': this.moveUp,
      'ArrowLeft': this.moveLeft,
      'ArrowRight': this.moveRight,
      'ArrowDown': this.moveDown
    }

    $("#ephemeralSpace").on('keydown', (event) => {
      event.preventDefault();
      if(['ArrowUp', 'ArrowLeft', 'ArrowRight', 'ArrowDown'].includes(event.key)) {
        animationEvents[event.key]();
      }
    });
  };

  moveUp = () => {
    const newY = $('#user').position().top - this.avatarSize;
    if (newY >= this.topBoundary) {
      $("#user").finish().animate({top: `-=${this.avatarSize}`}, {complete: this.onAnimationComplete});
    }
  }

  moveDown = () => {
    const newY = $('#user').position().top + this.avatarSize;
    if (newY + this.avatarSize <= this.bottomBoundary) {
      $("#user").finish().animate({top: `+=${this.avatarSize}`}, {complete: this.onAnimationComplete});
    }
  }

  moveLeft = () => {
    const newX = $('#user').position().left - this.avatarSize;
    if (newX >= this.leftBoundary) {
      $("#user").finish().animate({left: `-=${this.avatarSize}`}, {complete: this.onAnimationComplete});
    }
  }

  moveRight = () => {
    const newX = $('#user').position().left + this.avatarSize;
    if (newX + this.avatarSize <= this.rightBoundary) {
      $("#user").finish().animate({left: `+=${this.avatarSize}`}, {complete: this.onAnimationComplete});
    }
  }

  onAnimationComplete = () => {
    this.showAdjacentMessages();
    this.sendPositionToPeers();
  }

  showAdjacentMessages = () => {
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

  sendPositionToPeers = () => {
    store.sendToPeers({
      type: 'position', 
      data: {
        x: $('#user').position().left,
        y: $('#user').position().top,
      }
    });
  }

  changeBoundary = () => {
    this.rightBoundary = this.leftBoundary + $('#ephemeralSpace').width();
    this.bottomBoundary = this.topBoundary + $('#ephemeralSpace').height();  
    this.avatarSize = $('#user').width();
  }
}