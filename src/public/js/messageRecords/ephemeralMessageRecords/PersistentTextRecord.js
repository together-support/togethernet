import store from '@js/store/index.js';
import {roomModes} from '@js/constants.js';

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
  
    this.props.pollCreated();
    e.target.remove();
  }

  $textRecord = () => {
    return $(`#${this.props.id}`);
  }

  render = () => {
    const {votes, roomId, isPoll} = this.props;
    const room = store.getRoom(roomId);

    let $textRecord;
    if (this.$textRecord().length) {
      $textRecord = this.$textRecord();
    } else {
      $textRecord = this.props.getBaseTextRecord();
      const $textBubble = $textRecord.find('.textBubble'); 
      const $textBubbleButtons = $textBubble.find('.textBubbleButtons');
    
      const $hideButton = $('<button class="icon">-</button>');
      $hideButton.on('click', () => $textBubble.hide());
      $hideButton.prependTo($textBubbleButtons);
    
      if (room.mode === roomModes.facilitated) {
        if (isPoll) {
          $textBubble.addClass('poll');
          this.props.renderVotingButtons('majorityRules', votes).appendTo($textBubble);
        } else {
          const $createPoll = $('<button id="makeVote">Vote</button>');
          $createPoll.on('click', this.createPoll);
          $createPoll.prependTo($textRecord.find('.textBubbleButtons'));  
        }
      }
    
      $textRecord.mouseenter(() => $textBubble.show());
    }

    $textRecord.appendTo(store.getRoom(this.props.roomId).$room);
  }
}