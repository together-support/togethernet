export const renderFacilitator = ({avatar, name, socketId}) => {
  return $(`<div class="facilitatorOption" data-socketId="${socketId}"><div style="background-color:${avatar}"></div><span>${name}</span></div>`)
}

export const facilitatorOption = ({profile, onClick}) => {
  const {avatar, name} = profile
  const option = $(`<button class="facilitatorOption"><div style="background-color:${avatar}"></div><span>${name}</span></button>`);
  option.on('click', (e) => {
    option.toggleClass('selected');
    onClick();
  });
  return option;
};