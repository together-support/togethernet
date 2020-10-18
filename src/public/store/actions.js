import store from './store.js'
import DOMPurify from 'dompurify';

export const changeName = (name) => {
  const cleanName = DOMPurify.sanitize(name);
  if (Boolean(cleanName)) {
    store.set('name', cleanName);
  }
}