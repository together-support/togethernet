export const systemBubble = (message) => {
  const $systemBubble = $(document.getElementById(`systemBubbleTemplate`).content.cloneNode(true));
  $systemBubble.find('p').text(message);
  return $systemBubble;
}
