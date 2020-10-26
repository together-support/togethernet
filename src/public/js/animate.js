import throttle from 'lodash/throttle';
import store from '../store/store.js';

export default class AvatarAnimator {
  constructor() {
    this.avatarSize = $('#user').width();
    this.topBoundary = $('#privateMsgToggle').offset().top;
    this.leftBoundary = $('#privateMsgToggle').offset().left;
    this.rightBoundary = this.leftBoundary + $('#privateMsgToggle').width();
    this.bottomBoundary = this.topBoundary + $('#privateMsgToggle').height();

    $(window).on('resize', throttle(this.changeBoundary, 500));
  }

  attachAnimationEvents = () => {
    const animationEvents = (event) => {
      event.preventDefault();
      if (event.key === "ArrowUp") {
        this.moveUp();
      } else if (event.key === "ArrowLeft") {
        this.moveLeft();
      } else if (event.key === "ArrowRight") {
        this.moveRight();
      } else if (event.key === "ArrowDown") {
        this.moveDown();
      }
    }

    $(document).on('keydown', (e) => {
      if (['ArrowUp', 'ArrowLeft', 'ArrowRight', 'ArrowDown'].includes(e.key)){
        e.preventDefault();
      }
    });

    $("#privateMsgToggle").on('keydown', animationEvents);
  };

  moveUp = () => {
    const {top, left} = $('#user').position();
    const newY = top - this.avatarSize;
    if (newY > this.topBoundary) {
      $("#user").finish().animate({top: `-=${this.avatarSize}`});

      store.set('position', {x: left, y: newY})
    }
  }

  moveDown = () => {
    console.log('down')
    const {top, left} = $('#user').position();
    const newY = top + this.avatarSize;
    if (newY + this.avatarSize < this.bottomBoundary) {
      $("#user").finish().animate({top: `+=${this.avatarSize}`});
      store.set('position', {x: left, y: newY})
    }
  }

  moveLeft = () => {
    const {top, left} = $('#user').position();
    const newX = left - this.avatarSize;
    if (newX > this.leftBoundary) {
      $("#user").finish().animate({left: `-=${this.avatarSize}`});
      store.set('position', {x: newX, y: top})
    }
  }

  moveRight = () => {
    const {top, left} = $('#user').position();
    const newX = left + this.avatarSize;
    if (newX + this.avatarSize < this.rightBoundary) {
      $("#user").finish().animate({left: `+=${this.avatarSize}`});
      store.set('position', {x: newX, y: top})
    }
  }

  changeBoundary = () => {
    this.topBoundary = $('#privateMsgToggle').offset().top;
    this.leftBoundary = $('#privateMsgToggle').offset().left;
    this.rightBoundary = this.leftBoundary + $('#privateMsgToggle').width();
    this.bottomBoundary = this.topBoundary + $('#privateMsgToggle').height();  
    this.avatarSize = $('#user').width();
  }
}