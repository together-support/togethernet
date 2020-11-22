import store from '../store/index.js';

export const renderFacilitator = ({avatar, name, socketId}) => {
  return $(`<div class="facilitatorOption" data-socketId="${socketId}"><div style="background-color:${avatar}"></div><span>${name}</span></div>`)
}

export const facilitatorOption = ({profile, onClick}) => {
  const {avatar, name, socketId} = profile
  const isMe = store.getCurrentUser().getProfile().socketId === socketId;
  const option = $(`<button class="facilitatorOption"><div style="background-color:${avatar}"></div><span>${name}</span></button>`);
  if (isMe) {option.addClass('selected');}
  option.on('click', (e) => {
    option.toggleClass('selected');
    onClick();
  });
  return option;
};