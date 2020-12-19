import {onAnimationComplete, hideEphemeralMessageText} from '@js/Room/animation';

export const makeDraggableUser = () => {
  if ($('#user').hasClass('ui-draggable')) {
    $('#user').draggable('destroy');
  }
  $('#user').draggable({
    grid: [$('#user').outerWidth(), $('#user').outerWidth()],
    stop: onAnimationComplete,
    containment: 'parent',
  });

  $('#user').on('dragstart', () => {
    hideEphemeralMessageText();
  });
};