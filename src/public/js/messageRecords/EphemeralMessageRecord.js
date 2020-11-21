import store from '../../store/index.js';
import {roomModes} from '../../constants/index.js'
import {AgendaTextRecord, DisappearingTextRecord, PersistentTextRecord} from './EphemeralMessageRecords/index.js'

const messageTypeToComponent = {
  'question': PersistentTextRecord,
  'idea': PersistentTextRecord,
  'message': DisappearingTextRecord,
  'agenda': AgendaTextRecord,
}

export default class EphemeralMessageRecord {
  constructor (props) {
    const messageData = {
      ...props,
      id: `${props.roomId}-${props.left}-${props.top}`,
      votingRecord: props.votingRecord || {},
    };

    const room = store.getRoom(props.roomId);
    if (room.ephemeral && room.mode === roomModes.directAction) {
      messageData.votes = props.votes || {
        agree: 0,
        disagree: 0,
        stand: 0,
        block: 0,
      };
    }

    this.messageData = messageData;
  }

  getElement = () => {
    return $(`#${this.id}`)[0];
  }

  renderVotingButtons = (template, votes) => {
    const $votingButtons = $(document.getElementById(`${template}Template`).content.cloneNode(true));
    $votingButtons.find('.votingButtons').children().each((_, el) => {
      const option = $(el).data('value');
      $(el).find('.voteCount').text(votes[option]);
      $(el).on('click', castVote);
    })
  
    return $votingButtons;
  }

  getBaseTextRecord = () => {
    const {id, left, top, avatar, messageType, votes, name, message, roomId} = this.messageData;

    const room = store.getRoom(roomId)
    const $textRecordTemplate = $(document.getElementById('textRecordTemplate').content.cloneNode(true));
    const $textRecord = $textRecordTemplate.find('.textRecord');
    const $textBubble = $textRecord.find('.textBubble');

    $textRecord.attr('id', id);
    $textRecord.css({left, top, backgroundColor: avatar});

    $textBubble.addClass(messageType);
    $textBubble.attr('id', `textBubble-${id}`);

    $textBubble.find('.name').text(name);
    $textBubble.find('.content').text(message);


    if (this.messageData.isMine) {
      const $closeButton = $('<button class="close icon">x</button>');
      $closeButton.on('click', this.purgeSelf());
      $closeButton.appendTo($textBubble.find('.textBubbleButtons'));
    }

    if (room.mode === roomModes.directAction) {
      this.renderVotingButtons('consentfulGestures', votes).appendTo($textBubble);
    };

    return $textRecord;
  }

  purgeSelf = () => {
    const room = store.getRoom(this.messageData.roomId);
    const $textRecord = $(`#${this.id}`);

    $textRecord.finish().animate({opacity: 0}, {
      complete: () => {
        $textRecord.remove();
        store.sendToPeers({
          type: 'removeEphemeralMessage',
          data: {messageId: this.id}
        });
        room.removeEphemeralHistory(this.id);
      }
    });  
  }

  render = () => {
    const recordType = messageTypeToComponent[this.messageData.messageType]
    
    new recordType({
      ...this.messageData,
      getBaseTextRecord: this.getBaseTextRecord,
      renderVotingButtons: this.renderVotingButtons
    }).render();
  }
}