export const addSystemMessage = (systemMsg) => {
  $('#systemMessage').find('span').text(systemMsg);
  $('#systemMessage').show();
  $(document).one('mouseup', clearSystemMessage);
  $(document).one('keydown', clearSystemMessage);
};

export const clearSystemMessage = () => {
  $('#systemMessage').hide();
  $('.chat:visible').get(0).focus();
};