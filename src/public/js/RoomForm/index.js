import {roomModes} from '@js/constants';
import store from '@js/store';
import Room from '@js/Room';
import publicConfig from '@public/config';
import pull from 'lodash/pull';

const defaultOptions = {
  mode: publicConfig.defaultMode,
  roomId: '',
  ephemeral: true,
  facilitators: [],
};

export default class RoomForm {
  constructor () {
    this.options = {...defaultOptions};

    Object.values(roomModes).forEach((mode) => {
      $('#meetingMode').append($(`\
        <div>\
          <input type="radio" id="roomMode-${mode}" name="roomMode" value="${mode}" ${mode === publicConfig.defaultMode && 'checked="checked"'}></input>\
          <label for="${mode}">${mode}</label>\
        </div>\
      `));
    });
  }

  initialize = () => {
    $('#newRoomId').on('change', this.updateRoomId);
    $('input[type=radio][name=roomMode]').on('change', this.changeMeetingMode);
    $('#createNewRoom').on('click', this.createNewRoom);
    $('#backToCustomize').on('click', () => this.goToPage(1));
    $('#addFacilitator').on('click', () => {
      this.listFacilitatorOptions();
      this.goToPage(2);
    });
    
    $('.modalOverlay').on('click', () => {
      $('#configureRoom').hide();
      this.resetForm();
    });
    $('.configureRoomView').on('click', (e) => e.stopPropagation());

    $('#addRoom').on('click', () => {
      $('#configureRoom').show();
    });
  }

  listFacilitatorOptions = () => {
    $('#configureRoom-2').find('.facilitatorOption').remove();
    const profiles = [store.getCurrentUser().getProfile(), ...Object.values(store.get('peers')).map(peer => peer.getProfile())];
    profiles.forEach((profile) => {
      this.renderFacilitatorOption({
        profile, 
        onClick: (e) => this.toggleFacilitator(e, profile),
        selected: this.options.facilitators.includes(profile.socketId)
      }).insertBefore($('#configureRoom-2 .modalButtons'));
    });
  };

  renderFacilitatorOption = ({profile, onClick, selected}) => {
    const {avatar, name} = profile;
    const option = $(`<button class="facilitatorOption"><div style="background-color:${avatar}"></div><span>${name}</span></button>`);
    if (selected) { option.addClass('selected'); }
    option.on('click', onClick);
    return option;
  };

  toggleFacilitator = (e, profile) => {
    const {socketId} = profile;
    if (this.options.facilitators.includes(socketId)) {
      $(e.target).closest('.facilitatorOption').toggleClass('selected');
      pull(this.options.facilitators, socketId);
      $('#currentFacilitators').find(`div[data-socketId="${socketId}"]`).remove();
    } else if (this.options.facilitators.length < 3) {
      $(e.target).closest('.facilitatorOption').toggleClass('selected');
      this.renderFacilitator(profile).appendTo($('#currentFacilitators'));
      this.options.facilitators.push(socketId);        
    } 
  }

  renderFacilitator = ({avatar, name, socketId}) => {
    return $(`<div class="facilitatorOption" data-socketId="${socketId}"><div style="background-color:${avatar}"></div><span>${name}</span></div>`);
  };
  
  changeMeetingMode = (e) => {
    this.options.mode = e.target.value;
    if (this.options.mode === roomModes.egalitarian) {
      this.clearFacilitators();
      $('#configureFacilitators').hide();
      $('#votingModuleInfo').hide();
      $('#consentfulGestureInfo').hide();
    } else if (this.options.mode === roomModes.facilitated) {
      $('#currentFacilitators').html('');
      this.renderFacilitator(store.getCurrentUser().getProfile()).appendTo($('#currentFacilitators'));
      this.options.facilitators = [store.getCurrentUser().socketId];
      $('#configureFacilitatorsDA').hide();
      $('#configureFacilitatorsFac').show();
      $('#configureFacilitators').show();
      $('#consentfulGestureInfo').hide();
      $('#votingModuleInfo').show();
    } else if (this.options.mode === roomModes.directAction){
      this.clearFacilitators();
      $('#configureFacilitatorsFac').hide();
      $('#configureFacilitatorsDA').show();
      $('#configureFacilitators').show();
      $('#votingModuleInfo').hide();
      $('#consentfulGestureInfo').show();
    }
  }

  updateRoomId = (e) => {
    e.preventDefault();
    if (e.target.value.length < 26) {
      this.options.roomId = e.target.value;
    }
  };

  goToPage = (pageNumber) => {
    $('.configureRoomView').hide();
    $(`#configureRoom-${pageNumber}`).show();
  }

  createNewRoom = (e) => {
    e.preventDefault();

    if (this.validateOptions()) {
      const newRoom = new Room(this.options);
      const {roomId} = this.options;

      store.rooms[roomId] = newRoom;
      store.getCurrentUser().updateState({currentRoomId: roomId});
      store.sendToPeers({
        type: 'newRoom',
        data: {
          options: newRoom
        }
      });

      newRoom.initialize();
      newRoom.goToRoom();
      $('#configureRoom').hide();
      this.resetForm();
    }
  }

  validateOptions = () => {
    let isValid = true;
    if (!this.options.roomId) {
      alert('please enter a room name');
      isValid = false;
    }

    if (store.getRoom(this.options.roomId.toLowerCase().replaceAll(' ', '-'))) {
      alert('room names must be unique');
      isValid = false;
    }

    return isValid;
  }

  resetForm = () => {
    this.options = {...defaultOptions};
    $(`#roomMode-${defaultOptions.mode}`).prop('checked', true).trigger('click');

    $('#configureFacilitators').hide();
    $('#newRoomId').val(defaultOptions.roomId);
    $('#configureRoom-2').find('.facilitatorOption').remove();
    this.clearFacilitators();

    this.goToPage(1);
  }

  clearFacilitators = () => {
    this.options.facilitators = [];
    $('.facilitatorOption').removeClass('selected');
    $('#currentFacilitators').find('.facilitatorOption').remove();
  }
}
