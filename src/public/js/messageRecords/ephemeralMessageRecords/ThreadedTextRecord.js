import store from '../../../store/index.js';

export default class ThreadedTextRecord {
  constructor(props) {
    this.props = props;
  }

  getTextRecordEl = () => {
    return $(`#${this.props.id}`);
  }

  getThreadHeadId = () => {
    const ephemeralHistory = store.getRoom(this.props.roomId).ephemeralHistory;
    let threadPreviousMessage = ephemeralHistory[this.props.threadPreviousMessageId];
    while (Boolean(threadPreviousMessage.messageData.threadPreviousMessageId)) {
      threadPreviousMessage = ephemeralHistory[threadPreviousMessage.messageData.threadPreviousMessageId];
    }

    return threadPreviousMessage.messageData.id;
  }

  initTextRecord = () => {
    const $textRecord = this.props.getBaseTextRecord();
    return $textRecord;
  }

  render = () => {
    let $textRecord;
    if (this.getTextRecordEl().length) {
      $textRecord = this.getTextRecordEl();
    } else {
      $textRecord = this.initTextRecord();
    }

    $textRecord.appendTo(store.getRoom(this.props.roomId).$room);
    const $content = $textRecord.find('.textContentContainer');
    $content.appendTo($(`#${this.getThreadHeadId()}`).find('.textBubble'));
    $textRecord.find('.textBubble').hide();
  }
}