import store from '../../../store/index.js';

export default class ThreadedTextRecord {
  constructor(props) {
    this.props = props;
  }

  getTextRecordEl = () => {
    return $(`#${this.props.id}`);
  }

  getThreadHead = () => {
    return $(`#${this.props.getThreadHeadId()}`);
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