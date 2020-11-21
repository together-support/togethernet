import {votingButtons} from '../components/message.js'
import store from '../store/index.js';


export const pollCreated = ({roomId, textRecordId}) => {
  const $textRecord = $(`#${textRecordId}`);
  const $textBubble = $textRecord.find('.textBubble');

  const pollRecord = store.getRoom(roomId).ephemeralHistory[textRecordId];
  pollRecord.isPoll = true;
  pollRecord.votes = {yes: 0, neutral: 0, no: 0};
  pollRecord.votingRecords = {};

  $textBubble.addClass('poll');
  votingButtons('majorityRules', pollRecord.votes).appendTo($textBubble);
}

export const voteReceived = ({roomId, textRecordId, option, socketId}) => {
  const $pollRecord = $(`#${textRecordId}`);

  const pollRecord = store.getRoom(roomId).ephemeralHistory[textRecordId];
  pollRecord.votes[option] += 1;
  pollRecord.votingRecords[socketId] = option;

  $pollRecord.find(`.voteOption[data-value="${option}"]`).find('.voteCount').text(pollRecord.votes[option]);
}

export const voteRetracted = ({roomId, textRecordId, option, socketId}) => {
  const $pollRecord = $(`#${textRecordId}`);

  const pollRecord = store.getRoom(roomId).ephemeralHistory[textRecordId];
  pollRecord.votes[option] -= 1;
  delete pollRecord.votingRecords[socketId];

  $pollRecord.find(`.voteOption[data-value="${option}"]`).find('.voteCount').text(pollRecord.votes[option]);
}

export const voteChanged = ({roomId, textRecordId, option, socketId}) => {
  const $pollRecord = $(`#${textRecordId}`);

  const pollRecord = store.getRoom(roomId).ephemeralHistory[textRecordId];

  const currentVote = pollRecord.votingRecords[socketId];
  pollRecord.votes[currentVote] -= 1;
  $pollRecord.find(`.voteOption[data-value="${currentVote}"]`).find('.voteCount').text(pollRecord.votes[currentVote]);

  pollRecord.votes[option] += 1;
  pollRecord.votingRecords[socketId] = option;
  $pollRecord.find(`.voteOption[data-value="${option}"]`).find('.voteCount').text(pollRecord.votes[option]);
}