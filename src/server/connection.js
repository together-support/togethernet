import socketIO from 'socket.io';

// SOCKET COMMUNICATIONS
/*
 * imagine we have two users, A and B
 * A connects to the server, which triggers a 'connection' event and registers A with socket.io
 * B connects to the server, which triggers a 'connection' event and registers B with socket.io
 * when B connects, it sees that A is also connected.
 * B sends a peer event to A
 * B sends a signal to A
 * A sends a signal to B
 * A and B are now connected
 * p2p means they don't actually rely on the ws implementation here except for handshake
 *
 *  when C connects, C signals to A and B
 *  right now C signals to A and B again instead of A and B responding to C
 */

export const connectSocket = (server) => {
  const io = socketIO(server);

  io.on("connection", function(socket) {
    console.log("============================connection=====================");
    console.log(socket.id, "has connected");
    let existingSockets = Object.values(io.sockets.connected).filter(
        (item) => item.id !== socket.id
    );
    //connect to existing peers
    existingSockets.forEach((targetSocket) => {
        console.log(
            `peer event to ${socket.id} (initiator) and ${targetSocket.id} (receiver)`
        );
        socket.emit("peer", { peerId: targetSocket.id, initiator: true });
        targetSocket.emit("peer", { peerId: socket.id, initiator: false });
    });

    socket.on("signal", function(data) {
        console.log("============================signal=====================");
        //updates existing socket list
        // ensures that our current socket does not have itself in the list of peers
        existingSockets = Object.values(io.sockets.connected).filter(
            (item) => ( item.id !== socket.id &&
                        item.connected === true &&
                        item.disconnected === false ));
        if (io.sockets.connected && data.peerId in io.sockets.connected) {
            io.sockets.connected[data.peerId].emit("signal", {
                signal: data.signal,
                peerId: socket.id,
            });
        }
    });

    socket.on("disconnect", (data)=>{
      // clean up disconnect
      console.log(`peer ${socket.id} disconnected`)
      existingSockets.forEach((targetSocket) => {
          targetSocket.emit("peerDisconnect", { peerId: socket.id });
      });
    })

    socket.on("public message", function(data) {
        socket.broadcast.emit("public message", {
            name: data.name,
            msg: data.outgoingMsg,
        });
    });
  });
}