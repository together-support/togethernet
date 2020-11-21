import store from '../../../store/index.js';
import {roomModes} from '../../../constants/index.js'

export default class PersistentTextRecord {
  constructor(props) {
    this.props = props;
  }

  createPoll = (e) => {
    const textRecordId = this.props.id;
    const roomId = store.getCurrentUser().currentRoomId;
  
    store.sendToPeers({
      type: 'pollCreated',
      data: {roomId, textRecordId},
    });
  
    this.pollCreated({roomId, textRecordId});
    e.target.remove();
  }

  pollCreated = () => {
    // const $textBubble = $textRecord.find('.textBubble');
  
    // const pollRecord = store.getRoom(roomId).ephemeralHistory[this.props.id];
    // pollRecord.isPoll = true;
    // pollRecord.messageData.votes = {yes: 0, neutral: 0, no: 0};
    // pollRecord.messageData.votingRecords = {};
  
    // $textBubble.addClass('poll');
    // votingButtons('majorityRules', pollRecord.messageData.votes).appendTo($textBubble);
  }

  render = () => {
    const room = store.getRoom(this.props.roomId);

    let $textRecord;
    if ($(`#${this.props.id}`).length) {
      $textRecord = $(`#${this.props.id}`);
    } else {
      $textRecord = this.props.getBaseTextRecord();
      const $textBubble = $textRecord.find('.textBubble'); 
      const $textBubbleButtons = $textBubble.find('.textBubbleButtons');
    
      const $hideButton = $('<button class="icon">-</button>');
      $hideButton.on('click', () => $textBubble.hide());
      $hideButton.prependTo($textBubbleButtons);
    
      if (room.mode === roomModes.facilitated) {
        if (this.props.isPoll) {
          $textBubble.addClass('poll');
          this.props.renderVotingButtons('majorityRules', votes).appendTo($textBubble);
        } else {
          const $createPoll = $('<button id="makeVote">Vote</button>');
          $createPoll.on('click', createPoll);
          $createPoll.prependTo($textRecord.find('.textBubbleButtons'));  
        }
      }
    
      $textRecord.mouseenter(() => $textBubble.show());
    }

    $textRecord.appendTo(store.getRoom(this.props.roomId).$room);
  }
}