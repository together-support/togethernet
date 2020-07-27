# Experimental Chatoom 🐕 💗 🐩

*Created for the [Experimental Chatroom workshop](https://experimental-chatroom-workshop.glitch.me/) at the [Hackers and Designers Summer Academy 2020](https://hackersanddesigners.nl/s/Summer_Academy_2020)*

*p2p template code mixed by Xin Xin, workshop collaboration with Lark VCR*

<br>

## *p2p Chat Template*

A chatroom template that uses Simple Peer, Node.js, Socket.io, Express, p5.js, and bundled up by Browserify! By default Simple Peer allows one-on-one chat. In order for it to become a group chat [you will need to build a mesh](https://github.com/feross/simple-peer#connecting-more-than-2-peers).

<br>




### Source code 

This template uses [Simple Peer](https://github.com/feross/simple-peer), a package that wraps around WebRTC to make browser-to-browser commnunication easier to program. Node is set up to be used as a signaling server to broker initial connection. 

No persistant data is stored in a p2p context. Your chat history is destroyed after closing the browser. 

### Why Simple Peer?

Simple Peer is open-source and makes WebRTC more accessible!

### Bugs

Feel free to report bugs by raising an issue on this project's GitHub page.