const modules = require("browserify-middleware/lib/modules");

function makeConnectionList(peerList) {
    let connectionList = [];

    for (let i = 0; i < peerList.length; i++) {
        for (let j = i + 1; j < peerList.length; j++) {
            let connection = [];
            connection.push(peerList[i], peerList[j]);
            connectionList.push(connection);
        }
    }
    return connectionList;
}

module.exports = {
    makeConnectionList,
};