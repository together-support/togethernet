export const addSystemConfirmMessage = ({
  msgHeader = '',
  msgBody = '',
  msgFooter = '',
  yayText = '',
  nayText = '',
  yayBtn = 'Continue',
  yayBtnTitle = 'Continue',
  nayBtn = 'Stop',
  nayBtnTitle = 'Stop',
  nayLink = "parent.open('https://togethernet.app')",
}) => {
  $('#systemConfirmMessage').find('h1').text(msgHeader);
  $('#systemConfirmMessage').find('p').text(msgBody);
  $('#systemConfirmMessage').find('h6').text(msgFooter);
  $('#systemConfirmMessage').find('.yay-container p').text(yayText);
  $('#systemConfirmMessage').find('.nay-container p').text(nayText);
  $('#systemConfirmMessage').find('button.yay').text(yayBtn);
  $('#systemConfirmMessage').find('button.yay').attr('title', yayBtnTitle);
  $('#systemConfirmMessage').find('button.nay').text(nayBtn);
  $('#systemConfirmMessage').find('button.nay').attr('title', nayBtnTitle);
  $('#systemConfirmMessage').find('button.nay').attr('onClick', nayLink);
  $('#systemConfirmMessage').show();
  $('#systemConfirmMessage')
    .find('button.yay')
    .one('mouseup', clearSystemMessage);
};

export const addSystemNotifyMessage = ({
  msgHeader = '',
  msgBody = '',
  confirmBtn = 'Continue',
  confirmBtnTitle = 'Continue',
}) => {
  $('#systemNotifyMessage').find('h1').text(msgHeader);
  $('#systemNotifyMessage').find('p').text(msgBody);
  $('#systemNotifyMessage').find('button.confirm').text(confirmBtn);
  $('#systemNotifyMessage')
    .find('button.confirm')
    .attr('title', confirmBtnTitle);
  $('#systemNotifyMessage').show();
  $('#systemNotifyMessage')
    .find('button.confirm')
    .one('mouseup', clearSystemNotifyMessage);
};

export const clearSystemMessage = () => {
  $('#systemConfirmMessage').hide();
  const $visibleEphmeralRoom = $('.room:visible').get(0);
  $visibleEphmeralRoom && $visibleEphmeralRoom.focus();
};

export const clearSystemNotifyMessage = () => {
  $('#systemNotifyMessage').hide();
  const $visibleEphmeralRoom = $('.room:visible').get(0);
  $visibleEphmeralRoom && $visibleEphmeralRoom.focus();
};
