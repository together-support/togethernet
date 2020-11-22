import store from '../store/index.js';

export const pollCreated = ({roomId, textRecordId}) => {
  const pollRecord = store.getRoom(roomId).ephemeralHistory[textRecordId];
  pollRecord.pollCreated();
};

export const voteReceived = ({roomId, textRecordId, option, socketId}) => {
  const pollRecord = store.getRoom(roomId).ephemeralHistory[textRecordId];
  pollRecord.voteReceived({option, socketId});
};

export const voteRetracted = ({roomId, textRecordId, option, socketId}) => {
  const pollRecord = store.getRoom(roomId).ephemeralHistory[textRecordId];
  pollRecord.voteRetracted({option, socketId});
};

export const voteChanged = ({roomId, textRecordId, option, socketId}) => {
  const pollRecord = store.getRoom(roomId).ephemeralHistory[textRecordId];
  pollRecord.voteChanged({option, socketId});
};