import store from '../store/store.js'
import {changeName} from '../store/actions.js'

export const setUserName = () => {
  const name = prompt("Please enter your name:");
  changeName(name)
  displayUserName();
};

const displayUserName = () => {
  const $nameInput = $("#_nameInput");
  $nameInput.text(store.get('name'));
}