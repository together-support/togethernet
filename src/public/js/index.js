import store from '@js/store/index.js';
import Togethernet from '@js/Togethernet/index.js';

$(window).load(() => {
  new Togethernet().initialize();
  window.debugStore = store;
});