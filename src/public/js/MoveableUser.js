import throttle from 'lodash/throttle';
import store from '../store/store.js';
import {removeAllSystemMessage} from './systemMessage';

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
    this.initializeAvatar();
    this.attachAnimationEvents();
    $("#ephemeralSpace").one('keydown', removeAllSystemMessage);
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
    });
  }

  attachAnimationEvents = () => {
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
    const {top, left} = $('#user').position();
    const newY = top - this.avatarSize;
    if (newY >= this.topBoundary) {
      $("#user").finish().animate({top: `-=${this.avatarSize}`}, {complete: this.sendPositionToPeers});
    }
  }

  moveDown = () => {
    const {top, left} = $('#user').position();
    const newY = top + this.avatarSize;
    if (newY + this.avatarSize <= this.bottomBoundary) {
      $("#user").finish().animate({top: `+=${this.avatarSize}`}, {complete: this.sendPositionToPeers});
    }
  }

  moveLeft = () => {
    const {top, left} = $('#user').position();
    const newX = left - this.avatarSize;
    if (newX >= this.leftBoundary) {
      $("#user").finish().animate({left: `-=${this.avatarSize}`}, {complete: this.sendPositionToPeers});
    }
  }

  moveRight = () => {
    const {top, left} = $('#user').position();
    const newX = left + this.avatarSize;
    if (newX + this.avatarSize <= this.rightBoundary) {
      $("#user").finish().animate({left: `+=${this.avatarSize}`}, {complete: this.sendPositionToPeers});
    }
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