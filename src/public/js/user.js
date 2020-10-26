import store from '../store/store.js'
import {changeName} from '../store/actions.js'

export const setUserName = () => {
  const name = prompt("Please enter your name:");
  changeName(name);
  const $nameInput = $("#_nameInput");
  $nameInput.text(store.get('name'));
};

export const initAvatar = () => {
  const $user = $('#user');
  const $userProfile = $('#userProfile');
  const avatarColor = `#${Math.floor(Math.random() * 16777215).toString(16)}`;

  store.set('avatar', avatarColor);
  $user.css('background-color', avatarColor);
  $userProfile.val(avatarColor);

  store.set('position', {
    x: $('#privateMsgToggle').offset().left,
    y: $('#privateMsgToggle').offset().top
  })

  $userProfile.on('change', (e) => {
    e.preventDefault();
    $user.css('background-color', e.target.value);
  });
}