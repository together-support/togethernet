export const addSystemMessage = (systemMsg) => {
  $('#systemMessage').find('span').text(systemMsg);
  $('#systemMessage').show();
  $(document).one('click', clearSystemMessage);
  $(document).one('keydown', clearSystemMessage);
};

export const clearSystemMessage = () => {
  $('#systemMessage').hide();
};