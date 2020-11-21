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
    this.props = props;

    const recordType = messageTypeToComponent[props.messageType];

    this.record = new recordType({
      ...props,
      getId: this.getId,
      getElement: this.getElement,
      getBaseTextRecord: this.getBaseTextRecord,
      renderVotingButtons: this.renderVotingButtons
    });
  }

  getId = () => {
    return `${this.props.roomId}-${this.props.left}-${this.props.top}`;
  }

  getElement = () => {
    return $(`#${this.getId()}`)[0];
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
    const room = store.getRoom(this.props.roomId)
    const $textRecordTemplate = $(document.getElementById('textRecordTemplate').content.cloneNode(true));
    const $textRecord = $textRecordTemplate.find('.textRecord');
    const $textBubble = $textRecord.find('.textBubble');

    const {left, top, avatar, messageType, votes, name, message} = this.props;

    $textRecord.attr('id', this.getId());
    $textRecord.css({left, top, backgroundColor: avatar});

    $textBubble.addClass(messageType);
    $textBubble.attr('id', `textBubble-${this.getId()}`);

    $textBubble.find('.name').text(name);
    $textBubble.find('.content').text(message);


    if (this.isMine) {
      const $closeButton = $('<button class="close icon">x</button>');
      $closeButton.on('click', this.purgeSelf());
      $closeButton.appendTo($textBubble.find('.textBubbleButtons'));
    }

    if (room.mode === roomModes.directAction) {
      this.renderVotingButtons('consentfulGestures', votes).appendTo($textBubble);
    }
    return $textRecord;
  }

  purgeSelf = () => {
    const room = store.getRoom(this.props.roomId);
    const $textRecord = $(`#${this.getId()}`);

    $textRecord.finish().animate({opacity: 0}, {
      complete: () => {
        $textRecord.remove();
        store.sendToPeers({
          type: 'removeEphemeralMessage',
          data: {messageId: this.getId()}
        });
        room.removeEphemeralHistory(this.getId());
      }
    });  
  }

  render = () => {
    this.record.render();
  }
}