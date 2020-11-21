import {voteButtons} from '../components/message.js'
import store from '../store/index.js';

export const createPoll = (e) => {
  const textRecordId = $(e.target.closest('.textRecord')).attr('id');

  store.sendToPeers({
    type: 'pollCreated',
    data: {
      roomId: store.currentRoomId,
      textRecordId,
    }
  });

  pollCreated({roomId: store.get('currentRoomId'), textRecordId});
  e.target.remove();
}

export const pollCreated = ({roomId, textRecordId}) => {
  const $textRecord = $(`#${textRecordId}`);
  const $textBubble = $textRecord.find('.textBubble');

  const pollRecord = store.getRoom(roomId).ephemeralHistory[textRecordId];
  pollRecord.isPoll = true;
  pollRecord.votes = {yes: 0, neutral: 0, no: 0};
  pollRecord.votingRecords = {};

  $textBubble.addClass('poll');
  voteButtons(pollRecord.votes).appendTo($textBubble);
}

export const castVote = (e) => {
  const $option = $(e.target).closest('.voteOption');
  const option = $option.data('value');
  const textRecordId = $option.closest('.textRecord').attr('id');
  const pollRecord = store.getCurrentRoom().ephemeralHistory[textRecordId];

  const myProfile = store.currentUser.getProfile();
  const myVote = pollRecord.votingRecords[myProfile.socketId]
  const voteData = {textRecordId, option, ...myProfile};

  if (Boolean(myVote)) {
    if (myVote === option) {
      store.sendToPeers({
        type: 'voteRetracted',
        data: voteData,
      });
    
      retractVote(voteData);
      $option.removeClass('myVote');
    } else {
      store.sendToPeers({
        type: 'voteChanged',
        data: voteData,
      });
    
      changeVoteTo(voteData);
      $option.closest('.votingButtons').find(`.voteOption[data-value="${myVote}"]`).removeClass('myVote');
      $option.addClass('myVote');
    }
  } else {
    store.sendToPeers({
      type: 'voteCasted',
      data: voteData,
    });
  
    voteReceived(voteData);
    $option.addClass('myVote');
  }
}

export const voteReceived = ({roomId, textRecordId, option, socketId}) => {
  const $pollRecord = $(`#${textRecordId}`);

  const pollRecord = store.getRoom(roomId).ephemeralHistory[textRecordId];
  pollRecord.votes[option] += 1;
  pollRecord.votingRecords[socketId] = option;

  $pollRecord.find(`.voteOption[data-value="${option}"]`).find('.voteCount').text(pollRecord.votes[option]);
}

export const retractVote = ({roomId, textRecordId, option, socketId}) => {
  const $pollRecord = $(`#${textRecordId}`);

  const pollRecord = store.getRoom(roomId).ephemeralHistory[textRecordId];
  pollRecord.votes[option] -= 1;
  delete pollRecord.votingRecords[socketId];

  $pollRecord.find(`.voteOption[data-value="${option}"]`).find('.voteCount').text(pollRecord.votes[option]);
}

export const changeVoteTo = ({roomId, textRecordId, option, socketId}) => {
  const $pollRecord = $(`#${textRecordId}`);

  const pollRecord = store.getRoom(roomId).ephemeralHistory[textRecordId];

  const currentVote = pollRecord.votingRecords[socketId];
  pollRecord.votes[currentVote] -= 1;
  $pollRecord.find(`.voteOption[data-value="${currentVote}"]`).find('.voteCount').text(pollRecord.votes[currentVote]);

  pollRecord.votes[option] += 1;
  pollRecord.votingRecords[socketId] = option;
  $pollRecord.find(`.voteOption[data-value="${option}"]`).find('.voteCount').text(pollRecord.votes[option]);
}