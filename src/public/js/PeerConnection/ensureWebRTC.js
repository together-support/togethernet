export const getBrowserRTC = () => {
  if (typeof window === 'undefined') return null;
  var wrtc = {
    RTCPeerConnection:
      window.RTCPeerConnection ||
      window.mozRTCPeerConnection ||
      window.webkitRTCPeerConnection,
    RTCSessionDescription:
      window.RTCSessionDescription ||
      window.mozRTCSessionDescription ||
      window.webkitRTCSessionDescription,
    RTCIceCandidate:
      window.RTCIceCandidate ||
      window.mozRTCIceCandidate ||
      window.webkitRTCIceCandidate,
  };
  if (!wrtc.RTCPeerConnection) return null;
  return wrtc;
};
