import produce from "immer"

const defaultState = {
  userX: 0,
  userY: 0,
  peers: [],
  messageIndex: null,
  systemMessageIndex: null,
  audioIndex: null,
  stopSendMessage: false,
  name: 'Anonymous'
}

const state = () => {
}

export default state;
