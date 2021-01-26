export const addComment = async (commentData) => {
  const {message, name, avatar, commentableId} = commentData;
  return fetch('/archive', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      author: name, 
      content: message,
      room_id: 'archivalSpace',
      base_color: avatar,
      commentable_id: commentableId,
      message_type: 'comment',
    })
  })
    .then(response => response.text())
    .then(data => console.log(data));
};

export const addThread = async (threadData) => {
};

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
};