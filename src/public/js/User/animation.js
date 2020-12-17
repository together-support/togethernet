import {onAnimationComplete, hideEphemeralMessageText} from '@js/Room/animation';

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