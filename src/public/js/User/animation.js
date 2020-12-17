import {onAnimationComplete, hideEphemeralMessageText} from '../Room/animation.js';

export const makeDraggableUser = () => {
  $('#user').draggable({
    grid: [$('#user').outerWidth(), $('#user').outerWidth()],
    stop: onAnimationComplete,
    containment: $('.chat'),
  });

  $('#user').on('dragstart', () => {
    hideEphemeralMessageText();
  });
};