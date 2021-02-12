export const addSystemConfirmMessage = ({
  msgType = '',
  msgHeader = '',
  msgBody = '',
  msgFooter = '',
  yayText = '',
  nayText = '',
  yayBtn = 'Continue',
  yayBtnTitle = 'continue',
  nayBtn = 'Stop',
  nayBtnTitle = 'stop',
}) => {
  $('#systemConfirmMessage').find('h1').text(msgHeader);
  $('#systemConfirmMessage').find('p').text(msgBody);
  $('#systemConfirmMessage').find('h6').text(msgFooter);
  $('#systemConfirmMessage').find('.yay-container p').text(yayText);
  $('#systemConfirmMessage').find('.nay-container p').text(nayText);

  if (yayBtn.href){
    $(`#${msgType}`).attr('title', yayBtnTitle);
    $(`#${msgType}`).show();
  } else {
    $('#systemConfirmMessage').find('button.yay').text(yayBtn);
    $('#systemConfirmMessage').find('button.yay').attr('title', yayBtnTitle);
    $('#systemConfirmMessage').find('button.yay').show();
  }

  if (nayBtn.href){
    $(`#${msgType}`).attr('title', nayBtnTitle);
    $(`#${msgType}`).show();
  } else {
    $('#systemConfirmMessage').find('button.nay').text(nayBtn);
    $('#systemConfirmMessage').find('button.nay').attr('title', nayBtnTitle);
    $('#systemConfirmMessage').find('button.nay').show();
  }
  $('#systemConfirmMessage').show();
  $('#systemConfirmMessage')
    .find('button.yay')
    .one('mouseup', clearSystemMessage);
};

export const addSystemNotifyMessage = ({
  msgType = '',
  msgHeader = '',
  msgBody = '',
  confirmBtn = 'Continue',
  confirmBtnTitle = 'Continue',
}) => {
  $('#systemNotifyMessage').find('h1').text(msgHeader);
  $('#systemNotifyMessage').find('p').text(msgBody);

  if (confirmBtn.href) {
    $(`#${msgType}`).attr('title', confirmBtnTitle);
    $(`#${msgType}`).show();
    $('#systemNotifyMessage')
      .find('button.confirm')
      .one('mouseup', clearSystemNotifyMessage);
  } else {
    $('#systemNotifyMessage').find('button.confirm').text(confirmBtn);
    $('#systemNotifyMessage').find('button.confirm').attr('title', confirmBtnTitle);
    $('#systemNotifyMessage').find('button.confirm').show();
    $('#systemNotifyMessage')
      .find('button.confirm')
      .one('mouseup', clearSystemNotifyMessage);
  }

  $('#systemNotifyMessage').show();
};

export const clearSystemMessage = () => {
  $('#systemConfirmMessage').hide();
  $('#systemConfirmMessage a').hide();
  $('#systemConfirmMessage button').hide();
  const $visibleEphmeralRoom = $('.room:visible').get(0);
  $visibleEphmeralRoom && $visibleEphmeralRoom.focus();
};

export const clearSystemNotifyMessage = () => {
  $('#systemNotifyMessage').hide(); 
  $('#systemNotifyMessage a').hide();
  $('#systemConfirmMessage button').hide();
  const $visibleEphmeralRoom = $('.room:visible').get(0);
  $visibleEphmeralRoom && $visibleEphmeralRoom.focus();
};
