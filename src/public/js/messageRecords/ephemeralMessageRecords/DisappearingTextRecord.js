import store from '../../../store/index.js';

export default class DisappearingTextRecord {
  constructor(props) {
    this.props = props;
  }

  initiateConsentToArchiveProcess = () => {
    
  }

  proposeToArchiveButton = (onInitiateConsentToArchive) => {
    const $proposeToArchiveContainer = $('<div class="longPressButton askConsentToArchive" style="display:none"><div class="shortLine"/></div>');
    const $button = $('<button>propose to archive</button>');
    $button.on('mouseup', onInitiateConsentToArchive);
    $button.appendTo($proposeToArchiveContainer);
    return $proposeToArchiveContainer;
  };

  render = () => {
    let $textRecord;
    if ($(`#${this.props.id}`).length) {
      $textRecord = $(`#${this.props.id}`);
    } else {
      $textRecord = this.props.getBaseTextRecord();
      this.proposeToArchiveButton(this.initiateConsentToArchiveProcess).appendTo($textRecord);
    
      $textRecord
        .mouseenter(() => $textRecord.find('.textBubble').show())
        .mouseleave(() => $textRecord.find('.textBubble').hide())
        .on('adjacent', () => $textRecord.find('.textBubble').show())
        .on('mousedown', () => $textRecord.find('.askConsentToArchive').show());
    }
    
    $textRecord.appendTo(store.getRoom(this.props.roomId).$room);
  }
}