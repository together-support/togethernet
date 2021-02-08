export const updateMessage = async ({messageId, content, order}) => {
  await fetch(`/archive/${messageId}`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      content,
      order,
    }),
  })
    .then((response) => response.text())
    .then((data) => console.log(data));
};
