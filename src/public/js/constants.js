export const EGALITARIAN_MODE = 'egalitarian';
export const DIRECT_ACTION_MODE = 'direct-action';
export const FACILITATED_MODE = 'facilitated';

export const roomModes = {
  egalitarian: EGALITARIAN_MODE,
  directAction: DIRECT_ACTION_MODE,
  facilitated: FACILITATED_MODE,
};

export const systemConfirmMsgEphemeralRoom = {
  msgType: 'systemConfirmMsgEphemeralRoom',
  msgHeader: 'Privacy Scenario: sitting-at-the-park',
  msgBody:
    'You and a friend are sitting in your usual corner of the park on a picnic blanket speaking among each other.',
  msgFooter:
    'In the ephemeral channel your conversations are private and encrypted by default. However the underlying webRTC protocol does expose your public IP address and there is still a possibility for your geolocation and messages to be tracked.',
  yayText: 'Sounds good, I\'m enthusiastic to participate!',
  nayText: 'I\'d like to review how the ephemeral channel works.',
  yayBtn: 'Continue',
  yayBtnTitle: 'continue',
  nayBtn: { href: true },
  nayBtnTitle:
    'open external link to read documentation on the ephemeral channel'
};

export const systemConfirmMsgArchivalRoom = {
  msgType: 'systemConfirmMsgArchivalRoom',
  msgHeader: 'Privacy Scenario: posting-on-a-bulletin-board',
  msgBody:
    'You’ve posted a flyer on the bulletin board on your campus. Day in and day out, friends, acquaintances, and strangers pass by and pause to take a look at what you’ve posted. Some of them may even take a photo of the flyer on their phone to show it to other people.',
  msgFooter:
    'In the archive channel your messages are stored on a centralized server and anyone who has access to this page can read, edit, and potentially republish your messages to other locations.',
  yayText: 'Sounds good, I\'m enthusiastic to participate!',
  nayText: 'I\'d like to review how the archival channel works.',
  yayBtn: 'Continue',
  yayBtnTitle: 'continue',
  nayBtn: {href: true},
  nayBtnTitle:
    'open external link to read documentation on the archival channel'
};

export const systemConfirmMsgConfirmConsentToArchive = {
  msgType: 'systemConfirmMsgConfirmConsentToArchive',
  msgHeader: 'Consent to Archive',
  msgBody:
    'Consent to archive is a feature that publishes a single message or a thread to the archival channel. When the consent to archive process is initiated, all activities in the space are paused and participants are asked to give their consent for the selected message to be archived.',
  msgFooter: 'This feature requires consent from every participants. The message will not be archived if a participant decides to stop the process. Once a message has been archived, participants also have the ability to revoke their consent and bring the archived message back to the ephemeral channel. ',
  yayText: 'I would like to ask for everyone\'s consent to archive the selected message.',
  nayText: 'I don\'t think I want to do this right now.',
  yayBtn: 'Initiate Consent to Archive',
  yayBtnTitle: 'initiate consent to archive',
  nayBtn: 'Return to the Channel',
  nayBtnTitle: 'return to the channel'
};

export const systemConfirmMsgInitiateConsentToArchiveProcess = {
  msgType: 'systemConfirmMsgInitiateConsentToArchiveProcess',
  msgHeader: 'Requested Consent to Archive',
  msgBody: 'You have just initiated the consent to archive process.',
  msgFooter:
    'Consent to archive is a feature that publishes a chosen message or thread to the database. All participants, including the requester will have to give their consent for the message to be archived.',
  yayText: 'I understand, and I\'m enthusiastic to participate!',
  nayText: 'Wait. I\'d like to learn more before participating.',
  yayBtn: 'Continue',
  yayBtnTitle: 'continue to the next step',
  nayBtn: { href: true },
  nayBtnTitle: 'open external link to dig deeper on consent to archive'
};

export const systemConfirmMsgConsentToArchive = {
  msgType: 'systemConfirmMsgConsentToArchive',
  msgHeader: 'Consent to Archive Requested',
  msgBody: 'has just initiated the consent to archive process.',
  msgFooter:
    'Consent to archive is a feature that publishes a chosen message or thread to the database. The consent of all participants is required in order for the message to be archived.',
  yayText: 'I understand the process and feel comfortable moving forward.',
  nayText: 'I do not fully understand and would like to learn more before participating.',
  yayBtn: 'Continue',
  yayBtnTitle: 'continue to the next step',
  nayBtn: { href: true },
  nayBtnTitle: 'open external link to dig deeper on consent to archive'
};

export const systemNotifyMsgDisconnect = {
  msgType: 'systemNotifyMsgDisconnect',
  msgHeader: 'Lost Connection',
  msgBody:
    'You have been disconnected. Please refresh the page to reconnect. Messages you have posted prior to disconnection are still visible to participants in the space. Your messages will only be removed once everyone closes their browsers. ',
  confirmBtn: {href: true},
  confirmBtnTitle:
    'reload the page'
};

export const systemNotifyMsgError = {
  msgType: 'systemNotifyMsgError',
  msgHeader: 'Error',
  msgBody:
    'Oops, there has been an error. Please refresh the page to reconnect.',
  confirmBtn: { href: true },
  confirmBtnTitle:
    'reload the page'
};

export const systemNotifyNewFacilitator = {
  msgType: 'systemNotifyNewFacilitator',
  msgHeader: 'Facilitator Assigned',
  msgBody:
    'has been assigned as the new facilitator.',
  confirmBtn: 'Continue',
  confirmBtnTitle:
    'continue'
};

export const systemNotifyMsgGiveConsentToArchive = {
  msgType: 'systemNotifyMsgGiveConsentToArchive',
  msgHeader: 'Consent Received',
  msgBody:
    'Your consent to archive the message has been received. However, if there is another participant who would prefer not to give their consent, the consent to archive process will stop and the message won\'t be archived.',
  confirmBtn: 'Continue',
  confirmBtnTitle:
    'continue to the next step to wait for everyone else to give their consent'
};

export const systemNotifyMsgBlockConsentToArchive = {
  msgType: 'systemNotifyMsgBlockConsentToArchive',
  msgHeader: 'Consent to Archive Stopped',
  msgBody: 'You have stopped the consent to archive process. It is encouraged that you discuss the rationales for whether a message should be archived with your group.',
  confirmBtn: 'Return to Channel',
  confirmBtnTitle: 'return to the channel'
};

export const systemNotifyMsgConsentToArchiveBlocked = {
  msgType: 'systemNotifyMsgConsentToArchiveBlocked',
  msgHeader: 'Consent to Archive Stopped',
  msgBody: 'has stopped the consent to archive process. It is encouraged that you discuss the rationales for whether a message should be archived with your group.',
  confirmBtn: 'Return to Channel',
  confirmBtnTitle: 'return to the channel'
};
