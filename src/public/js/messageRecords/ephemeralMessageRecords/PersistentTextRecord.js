import store from '../../../store/index.js';
import {roomModes} from '../../../constants/index.js'
import {pollCreated, voteReceived, voteChanged, voteRetracted} from '../../voting.js';

export default class PersistentTextRecord {
  constructor(props) {
    this.props = props;
  }

  createPoll = (e) => {
    const textRecordId = this.props.getId();
    const roomId = store.getCurrentUser().currentRoomId;
  
    store.sendToPeers({
      type: 'pollCreated',
      data: {roomId, textRecordId},
    });
  
    pollCreated({roomId, textRecordId});
    e.target.remove();
  }  

  castVote = (e) => {
    const $option = $(e.target).closest('.voteOption');
    const option = $option.data('value');
    const textRecordId = this.props.getId();
    const pollRecord = store.getCurrentRoom().ephemeralHistory[textRecordId];
  
    const myProfile = store.getCurrentUser().getProfile();
    const myVote = pollRecord.votingRecords[myProfile.socketId]
    const voteData = {textRecordId, option, ...myProfile};
  
    if (Boolean(myVote)) {
      if (myVote === option) {
        store.sendToPeers({
          type: 'voteRetracted',
          data: voteData,
        });
      
        voteRetracted(voteData);
        $option.removeClass('myVote');
      } else {
        store.sendToPeers({
          type: 'voteChanged',
          data: voteData,
        });
      
        voteChanged(voteData);
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

  render = () => {
    const room = store.getRoom(this.props.roomId);
    const $textRecord = this.props.getBaseTextRecord();
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

    $textRecord.appendTo(store.getRoom(this.props.roomId).$room);
  }
}