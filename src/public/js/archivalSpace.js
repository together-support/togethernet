class ArchivalSpace {
  constructor () {
    this.messageRecords = [];
  }

  fetchArchivedMessages = async () => {
    const response = await fetch('/archive', {
      method: "GET",
      headers: {"Content-Type": "application/json"},
    });

    const messageRecords = await response.json(); 
    this.messageRecords = messageRecords;
  }

  render () {
    this.messageRecords.forEach((messageRecord) => {
      const {color} = messageRecord;
      const $messageRecordAvatar = $(`<div class="archival textRecord"></div>`);
      $messageRecordAvatar.css({backgroundColor: color})
      $messageRecordAvatar.appendTo($('#archivalMessagesContainer'));
    });
  }
}

export default ArchivalSpace;