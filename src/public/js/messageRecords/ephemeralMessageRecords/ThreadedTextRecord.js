import store from '../../store/index.js';

export default class ThreadedTextRecord {
  constructor(props) {
    this.props = props;
  }

  getTextRecordEl = () => {
    return $(`#${this.props.id}`);
  }

  getThreadHeadId = () => {
    const {roomId, threadPreviousMessageId} = this.props;
    if (!threadPreviousMessageId) {
      return this.props.id
    }

    const ephemeralHistory = store.getRoom(roomId).ephemeralHistory;
    let threadPreviousMessage = ephemeralHistory[threadPreviousMessageId];
    while (Boolean(threadPreviousMessage.messageData.threadPreviousMessageId)) {
      threadPreviousMessage = ephemeralHistory[threadPreviousMessage.messageData.threadPreviousMessageId];
    }

    return threadPreviousMessage.messageData.id;
  }

  getThreadHead = () => {
    return $(`#${this.getThreadHeadId()}`);
  }

  initTextRecord = () => {
    const $textRecord = this.props.getBaseTextRecord();

    $textRecord
      .mouseenter(() => this.getThreadHead().find('.textBubble').show())
      .mouseleave(() => this.getThreadHead().find('.textBubble').hide())
      .on('adjacent', () => this.getThreadHead().find('.textBubble').show());

    return $textRecord;
  }

  render = () => {
    let $textRecord;
    if (this.getTextRecordEl().length) {
      $textRecord = this.getTextRecordEl();
    } else {
      $textRecord = this.initTextRecord();
    }

    $textRecord.appendTo(store.getRoom(this.props.roomId).$room)
    const $content = $textRecord.find('.textContentContainer');
    $(`#textMessageContent-${this.props.threadPreviousMessageId}`).after($content);
    $textRecord.find('.textBubble').hide();
  }
}