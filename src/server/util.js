app.get('/sockets', (req, res) => {
  // returns list of current socket ids
  console.log(io.sockets.connected);
  return res.json(Object.keys(io.sockets.connected));
})