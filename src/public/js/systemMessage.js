import store from '../store/store.js';

export const addSystemBubble = (systemMsg) => {
//   let systemBubble = document.createElement("div");
//   sysBlb.setAttribute(`id`, `sysBlb${sysMsgIndex}`);
//   sysBlb.setAttribute(`class`, `sysBlb`);
//   sysBlb.innerHTML = `<p>${systemMsg}</p>`;
//   user.appendChild(sysBlb);
//   sysMsgIndex++;
}
  
export const addSystemMsg = (systemMsg) => {
  // addSysBubble(systemMsg);
}

export const removeAllSystemMessage = () => {
  for (let i = 0; i < store.get('systemMessageIndex'); i++) {
    let systemBubble = document.getElementById(`system-bubble-${i}`);
    systemBubble.remove();
    store.set('systemMessageIndex', 0)
  }
}