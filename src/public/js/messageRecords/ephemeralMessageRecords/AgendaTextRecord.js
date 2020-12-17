import store from '@js/store/index.js';

export default class AgendaTextRecord {
  constructor(props) {
    this.props = props;
  }

  hideAgendaForPeers = ({agendaId, shouldHide}) => {
    store.sendToPeers({
      type: 'setAgendaHidden',
      data: {agendaId, shouldHide}
    });
  };  

  render = () => {
    let $textRecord;
    if ($(`#${this.props.id}`).length) {
      $textRecord = $(`#${this.props.id}`);
    } else {
      $textRecord = this.props.getBaseTextRecord();
      const $textBubble = $textRecord.find('.textBubble'); 
      const $textBubbleButtons = $textBubble.find('.textBubbleButtons');
    
      if (this.props.isMine) {
        const $hideButton = $('<button class="icon">-</button>');
        $hideButton.on('click', () => {
          $textBubble.hide();
          this.hideAgendaForPeers({agendaId: $textRecord.attr('id'), shouldHide: true});
        });
        $hideButton.prependTo($textBubbleButtons);
        $textRecord.mouseenter(() => {
          if ($textBubble.is(':hidden')) {
            $textBubble.show();
            this.hideAgendaForPeers({agendaId: $textRecord.attr('id'), shouldHide: false});
          }
        });
      }
    }


    $textRecord.appendTo(store.getRoom(this.props.roomId).$room);
  }
}