export const addSystemMessage = (systemMsg) => {
  $('#systemMessage').find('span').text(systemMsg);
  $('#systemMessage').show();
  $(document).one('mouseup', clearSystemMessage);
  $(document).one('keydown', clearSystemMessage);
};

export const clearSystemMessage = () => {
  $('#systemMessage').hide();
  const $visibleEphmeralRoom = $('.chat:visible').get(0);
  $visibleEphmeralRoom && $visibleEphmeralRoom.focus();
};