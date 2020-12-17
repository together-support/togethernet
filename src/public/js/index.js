import store from '@js/store';
import Togethernet from '@js/Togethernet';

$(window).load(() => {
  new Togethernet().initialize();
  window.debugStore = store;
});