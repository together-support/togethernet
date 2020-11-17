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

  $textBubble.addClass('poll');
  voteButtons(pollRecord.votes).appendTo($textBubble);
}

export const castVote = (e) => {
  const $option = $(e.target);
  const option = $option.data('value');
  const textRecordId = $option.closest('.textRecord').attr('id');
  const pollRecord = store.getCurrentRoom().ephemeralHistory[textRecordId];

  const voteData = {roomId: store.currentRoomId, textRecordId, option};

  if (pollRecord.iVoted) {
    store.sendToPeers({
      type: 'voteCasted',
      data: voteData,
    });
  
    voteReceived(voteData);
  } else {
    store.sendToPeers({
      type: 'retractVote',
      data: voteData,
    });
  
    retractVote(voteData);
  }
}

export const voteReceived = ({roomId, textRecordId, option}) => {
  const $pollRecord = $(`#${textRecordId}`);

  const pollRecord = store.getRoom(roomId).ephemeralHistory[textRecordId];
  pollRecord.votes[option] += 1;

  $pollRecord.find(`.voteOption[data-value="${option}"]`).find('.voteCount').text(pollRecord.votes[option]);
}

export const retractVote = ({roomId, textRecordId, option}) => {
  const $pollRecord = $(`#${textRecordId}`);

  const pollRecord = store.getRoom(roomId).ephemeralHistory[textRecordId];
  pollRecord.votes[option] += 1;

  $pollRecord.find(`.voteOption[data-value="${option}"]`).find('.voteCount').text(pollRecord.votes[option]);
}