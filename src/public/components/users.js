export const makeFacilitatorButton = (onTransferFacilitator) => {
  const $makeFacilitatorContainer = $('<div class="makeFacilitator" style="display:none"><div class="shortLine"/></div>');
  const $button = $('<button>Make Facilitator</button>');
  $button.on('mouseup', onTransferFacilitator);
  $button.appendTo($makeFacilitatorContainer);
  return $makeFacilitatorContainer;
};