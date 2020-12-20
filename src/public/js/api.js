export const createMessage = async (messageData) => {
  const {message, name, roomId, avatar, consentToArchiveRecords} = messageData;
  return fetch('/archive', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      author: name, 
      content: message,
      room_id: roomId,
      base_color: avatar,
      participant_names: Object.values(consentToArchiveRecords).map(r => r.name),
      secondary_colors: Object.values(consentToArchiveRecords).map(r => r.avatar),
      message_type: 'text_message'
    })
  })
    .then(response => response.text())
    .then(data => console.log(data));
}

export const updateMessage = async ({messageId, content, order}) => {
  await fetch(`/archive/${messageId}`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      content, 
      order 
    })
  })
    .then(response => response.text())
    .then(data => console.log(data));
}