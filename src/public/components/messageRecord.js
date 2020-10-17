import { text } from "express";

  export const textRecord = (x, y, color, msgIndex) => {
    let textRecord = document.createElement("div");
    textRecord.setAttribute(`id`, `textRecord${msgIndex}`);
    textRecord.classList.add('textRecord');
  
    textRecord.css({
      left: `${x}px`,
      top: `${y}px`,
      backgroundColor: `${color}`,
    });

    return textRecord;
  }

  export const textBubble = (name, msg) => {
    let bubble = document.createElement("div");
    bubble.setAttribute(`id`, `text-bubble-${msgIndex}`);
    bubble.classList.add('text-bubble');
    bubble.innerHTML = `<p><b>${name}</b></p><p>${msg}</p>`;

    return bubble;
    }

    export const tempBubble = (name, msg) => {
      let tempBubble = document.createElement("div");
      tempBubble.setAttribute('id', `tempBlb-${msgIndex}`);
      tempBubble.classList.add(text-bubble);
      tempBubble.innerHTML = `<p><b>${name}</b></p><p>${msg}</p>`;

      return tempBubble;
    }