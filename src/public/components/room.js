import store from '../store/index.js';

export const renderFacilitator = ({avatar, name, socketId}) => {
  return $(`<div class="facilitatorOption" data-socketId="${socketId}"><div style="background-color:${avatar}"></div><span>${name}</span></div>`);
};

export const facilitatorOption = ({profile, onClick, selected}) => {
  const {avatar, name} = profile;
  const option = $(`<button class="facilitatorOption"><div style="background-color:${avatar}"></div><span>${name}</span></button>`);
  if (selected) {option.addClass('selected');}
  option.on('click', () => {
    option.toggleClass('selected');
    onClick();
  });
  return option;
};