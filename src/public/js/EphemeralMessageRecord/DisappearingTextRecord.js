import store from '@js/store';

export default class DisappearingTextRecord {
  constructor(props) {
    this.props = props;
  }

  render = () => {
    let $textRecord;
    if ($(`#${this.props.id}`).length) {
      $textRecord = $(`#${this.props.id}`);
    } else {
      $textRecord = this.props.getBaseTextRecord();
    
      $textRecord
        .mouseenter(() => $textRecord.find('.textBubble').show())
        .mouseleave(() => $textRecord.find('.textBubble').hide())
        .on('adjacent', () => $textRecord.find('.textBubble').show());
    }
    
    $textRecord.appendTo(store.getRoom(this.props.roomId).$room);
  }
}