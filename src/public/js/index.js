import store from './store/index.js';
import Togethernet from './Togethernet/index.js';

$(window).load(() => {
  new Togethernet().initialize();
  window.debugStore = store;
});