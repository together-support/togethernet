import {systemNotifyMsgRevokedConsent} from '@js/constants.js';

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
}, ephemeralMessage) => {

  if (document.getElementById('systemConfirmMessage').style.display == 'none'){

    $('#systemConfirmMessage').find('h1').text(msgHeader);
    $('#systemConfirmMessage').find('p').text(msgBody);
    $('#systemConfirmMessage').find('h6').text(msgFooter);
    $('#systemConfirmMessage').find('.yay-container p').text(yayText);
    $('#systemConfirmMessage').find('.nay-container p').text(nayText);

    if (yayBtn.href) {
      $(`#${msgType}`).attr('title', yayBtnTitle);
      $(`#${msgType}`).show();
    } else {
      $('#systemConfirmMessage').find('button.yay').text(yayBtn);
      $('#systemConfirmMessage').find('button.yay').attr('title', yayBtnTitle);
      $('#systemConfirmMessage').find('button.yay').show();
    }

    if (nayBtn.href) {
      $(`#${msgType}`).attr('title', nayBtnTitle);
      $(`#${msgType}`).show();
    } else {
      $('#systemConfirmMessage').find('button.nay').text(nayBtn);
      $('#systemConfirmMessage').find('button.nay').attr('title', nayBtnTitle);
      $('#systemConfirmMessage').find('button.nay').show();
    }

    $('#systemConfirmMessage').show();
  }

  if (msgType === 'systemConfirmMsgConfirmConsentToArchive') {
    $('#systemConfirmMessage').find('button.yay').one('mouseup',()=> {
      ephemeralMessage.initiateConsentToArchiveProcess();
    });
    $('#systemConfirmMessage').find('button.nay').mouseup(clearSystemMessage);
  } else if (msgType === 'systemConfirmMsgConfirmRevokeConsentToArchive'){
    $('#systemConfirmMessage').find('button.yay').mouseup(() => {
      fetch(`archive/${ephemeralMessage.archivedMessageId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      }).catch((e) => console.log(e));
      addSystemNotifyMessage(systemNotifyMsgRevokedConsent);
    });
    $('#systemConfirmMessage').find('button.nay').mouseup(clearSystemMessage);
  }
  else {
    $('#systemConfirmMessage')
      .find('button.yay')
      .mouseup(clearSystemMessage);
  }
};

export const addSystemNotifyMessage = ({
  msgType = '',
  msgHeader = '',
  msgBody = '',
  confirmBtn = 'Continue',
  confirmBtnTitle = 'Continue',
}) => {

  if (document.getElementById('systemNotifyMessage').style.display == 'none') {

    $('#systemNotifyMessage').find('h1').text(msgHeader);
    $('#systemNotifyMessage').find('p').text(msgBody);

    if (confirmBtn.href) {
      $(`#${msgType}`).attr('title', confirmBtnTitle);
      $(`#${msgType}`).show();

      $('#systemNotifyMessage')
        .find('button.confirm')
        .mouseup(clearSystemMessage);
    } else {
      $('#systemNotifyMessage').find('button.confirm').text(confirmBtn);
      $('#systemNotifyMessage').find('button.confirm').attr('title', confirmBtnTitle);
      $('#systemNotifyMessage').find('button.confirm').show();

      $('#systemNotifyMessage').show();
    }

    $('#systemNotifyMessage')
      .find('button.confirm')
      .mouseup('mouseup', clearSystemMessage);
  }
};

export const addSystemPopupMessage = ({
  msgType = '',
  msgBody = '',
}) => {

  if (document.getElementById('systemPopupMessage').style.display == 'none') {
    $('#systemPopupMessage').find('p').text(msgBody);
    $('#systemPopupMessage').show();
    $('#systemPopupMessage')
      .find('button.deletePopupMessage')
      .mouseup('mouseup', clearSystemPopupMessage);
  }
};

export const clearSystemMessage = () => {
  $('#systemConfirmMessage').hide();
  $('#systemNotifyMessage').hide();
  $('.yay').hide();
  $('.nay').hide();
  $('.confirm').hide();
  const $visibleEphmeralRoom = $('.room:visible').get(0);
  $visibleEphmeralRoom && $visibleEphmeralRoom.focus();
};

export const clearSystemPopupMessage = () => {
  $('#systemPopupMessage').hide();
  const $visibleEphmeralRoom = $('.room:visible').get(0);
  $visibleEphmeralRoom && $visibleEphmeralRoom.focus();
};