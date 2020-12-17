// export const outgoingAudio = (recording) => {
//   // const audio = document.createElement("audio");
//   // audio.src = recording;
// };

// export const incomingAudio = (blob) => {
//   // const audio = document.createElement("audio");
//   // audio.src = URL.createObjectURL(blob);
// };

// export const audioMessage = ({audioIndex, blob, recording, userY, userX, color}) => {
//   // const audio = Boolean(recording) ? outgoingAudio(recording) : incomingAudio(blob);
//   // audio.setAttribute('id', `audio-${audioIndex}`);

//   // const audioMessage = document.createElement("button");
//   // audioMessage.classList.add('audioRecord');
//   // audioMessage.setAttribute(`id`, `audioRecord-${audioIndex}`);

//   // $(audioMessage).css({
//   //   left: `${userX}px`,
//   //   top: `${userY}px`,
//   //   backgroundColor: `${color}`,
//   // });

//   // const playButton = document.createElement("div");
//   // playButton.setAttribute('id', `audioPlay-${audioIndex}`);
//   // playButton.classList.add("audioPlay");

//   // audioMessage.appendChild(playButton)
//   // audioMessage.addEventListener('click', audio.play)

//   // return audioMessage;
// };

// // import {audioMessage} from '../components/audio.js'

// export const startRecordingAudio = () => {
//   // navigator.mediaDevices.getUserMedia({
//   //   audio: true,
//   //   video: false,
//   // }).then(stream => {
//   //   const options = { mimeType: "audio/webm" };
//   //   const recordedChunks = [];
//   //   const mediaRecorder = new MediaRecorder(stream, options);

//   //   mediaRecorder.addEventListener("dataavailable", onData);
//   //   mediaRecorder.addEventListener("stop", () => stopRecording(recordedChunks));

//   //   mediaRecorder.start(1000);
//   // }).catch((err) => {
//   //   console.log("err capturing audio", err);
//   // });
// };

// export const sendAudio = () => {
//   // navigator.mediaDevices.getUserMedia({
//   //   audio: true,
//   //   video: false,
//   // }).then(stream => {
//   //   const options = { mimeType: "audio/webm" };
//   //   const recordedChunks = [];
//   //   const mediaRecorder = new MediaRecorder(stream, options);

//   //   mediaRecorder.addEventListener("dataavailable", onData);
//   //   mediaRecorder.addEventListener("stop", () => stopRecording(recordedChunks));

//   //   mediaRecorder.start(1000);
//   // }).catch((err) => {
//   //   console.log("err capturing audio", err);
//   // });
// };

// const onData = (e) => {
//   // if (e.data.size > 0) { recordedChunks.push(e.data) };
  
//   // if (shouldStop && !stopped) {
//   //   mediaRecorder.stop();
//   //   stopped = true;
//   // }
// };

// const stopRecording = (recordedChunks) => {
//   // const blob = new Blob(recordedChunks)
//   // audioMessage();
//   // stream.getTracks().forEach(track => track.stop());
//   // sendBlob(blob);
// };

// // export const audioMessage = (blob) => {
// //   // privateChatBox.appendChild(audioMessage({
// //   //   index, blob, userX, userY, color
// //   // }));

// // //   // store peer audioRecord positions
// // //   peerPosArray.push([peerX, peerY]);
// // //   posArray.push([peerX, peerY]);
// // }

// export const sendBlob = (blob) => {
//   // blob.arrayBuffer().then(buffer => {
//   //   Object.values(peers).filter(peer => {
//   //     return peer.addStream && peer.send
//   //   }).forEach((peer) => {
//   //     peer.send(buffer);
//   //   });
//   // });
// };

// // recordButton.addEventListener("mousedown", captureAudio);

// // recordButton.addEventListener("mouseup", () => {
// //   shouldStop = true;
// // });