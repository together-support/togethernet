export const EGALITARIAN_MODE = 'egalitarian';
export const DIRECT_ACTION_MODE = 'direct-action';
export const FACILITATED_MODE = 'facilitated';

export const roomModes = {
  egalitarian: EGALITARIAN_MODE,
  directAction: DIRECT_ACTION_MODE,
  facilitated: FACILITATED_MODE,
};

export const systemConfirmMsgArchivalRoom = {
  msgHeader: 'Privacy Scenario: posting-on-a-bulletin-board',
  msgBody:
    'You’ve posted a flyer on the bulletin board on your campus. Day in and day out, friends, acquaintances, and strangers pass by and pause to take a look at what you’ve posted. Some of them may even take a photo of the flyer on their phone to show it to other people.',
  msgFooter:
    'In the Archive Channel your messages are stored on a centralized server and anyone who has access to this page can read, edit, and duplicate your messages to other locations.',
  yayText: 'I\'m ready to move on',
  nayText: 'I\'d like to learn more about the Archive Channel',
  yayBtn: 'Continue',
  yayBtnTitle: 'enter archive',
  nayBtn: 'Read Documentation',
  nayBtnTitle:
    'open external link to read documentation on the archival channel',
  nayLink: 'parent.open(\'https://togethernet.app\')',
};

export const systemConfirmMsgDisconnect = {
  msgHeader: 'Lost Connection',
  msgBody:
    'You have been disconnected. Refresh the page to reconnect. Messages you have posted prior to disconnection are still visible to the connected peers. They will only be removed once everyone closes their browser.',
  msgFooter:
    'Messages you have posted prior to disconnection are still visible to the connected peers. They will only be removed once everyone closes their browser.',
  yayText: '',
  nayText: '',
  yayBtn: '',
  yayBtnTitle: '',
  nayBtn: 'Refresh',
  nayBtnTitle: '',
  nayLink: 'window.location.href=window.location.href',
};

export const systemConfirmMsgConfirmConsentToArchive = {
  msgHeader: 'Consent to Archive',
  msgBody:
    'Consent to archive is a feature that publishes a single message or a thread to the database connected to this instance. When the consent to archive process is initiated, all activities are paused and participants are asked to give their consent for the selected message to be archived. The message will not be archived if one or more participant decides to stop the process.',
  msgFooter: 'blah blah blah',
  yayText: 'I don\'t think I want to do this right now',
  nayText:
    'I would like to ask for everyone\'s consent to archive the selected message',
  yayBtn: 'Return to the Previous Page',
  yayBtnTitle: 'exit consent to archive',
  nayBtn: 'Initiate Consent to Archive',
  nayBtnTitle: 'initiate consent to archive',
  nayLink: 'parent.open(\'https://togethernet.app\')',
};

export const systemConfirmMsgInitiateConsentToArchiveProcess = {
  msgHeader: 'Requested Consent to Archive',
  msgBody: 'You have just initiated the consent to archive process.',
  msgFooter:
    'Consent to archive is a feature that publishes a chosen message or thread to the database. All participants will have to give their consent for the message to be archived.',
  yayText: 'Sounds great! I\'m ready to give my consent',
  nayText: 'Wait. I\'d like to learn more before participating',
  yayBtn: 'Continue',
  yayBtnTitle: 'continue to the next step',
  nayBtn: 'Read Documentation',
  nayBtnTitle: 'open external link to read documentation on consent to archive',
  nayLink: 'parent.open(\'https://togethernet.app\')',
};

export const systemConfirmMsgConsentToArchive = {
  msgHeader: 'Consent to Archive Requested',
  msgBody: 'has just initiated the consent to archive process.',
  msgFooter:
    'Consent to archive is a feature that publishes a chosen message or thread to the database. All participants, including the requester will have to give their consent for the message to be archived.',
  yayText: 'Sounds good! Show me the message',
  nayText: 'Wait. I\'d like to learn more before participating',
  yayBtn: 'Continue',
  yayBtnTitle: 'continue to the next step',
  nayBtn: 'Read Documentation',
  nayBtnTitle: 'open external link to read documentation on consent to archive',
  nayLink: 'blockConsentToArchive()',
};

export const systemNotifyMsgGiveConsentToArchive = {
  msgHeader: 'Consent Received',
  msgBody:
    'Your consent to archive the message has been received. However, if there is another participant who would prefer not to give their consent, the consent to archive process will stop and the message won\'t be archived. It is encouraged that you discuss the rationales for whether a message should be archived with your group.',
  confirmBtn: 'Continue',
  confirmBtnTitle:
    'continue to the next step to wait for everyone else to give their consent',
};

export const systemNotifyMsgBlockConsentToArchive = {
  msgHeader: 'Consent to Archive Stopped',
  msgBody: 'You have stopped the consent to archive process.',
  confirmBtn: 'Exit Consent to Archive',
  confirmBtnTitle: 'exit consent to archive',
};

export const systemNotifyMsgConsentToArchiveBlocked = {
  msgHeader: 'Consent to Archive Stopped',
  msgBody: 'has stopped the consent to archive process.',
  confirmBtn: 'Exit Consent to Archive',
  confirmBtnTitle: 'exit consent to archive',
};
