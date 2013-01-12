var net = require('net');

var clients = [];

var server = net.createServer(function(socket) {

  // open new socket
  socket.write('beep boop...\r\n');
  clients.push(socket);

  // send to everyone
  socket.on('data', function(chunk) {
    clients.forEach(function(client) {

      // don't echo to self
      if (client === socket) {
        return;
      }

      // send to each client
      client.write(chunk);
    });
  });

  // connect stdin
  process.stdin.resume();
  process.stdin.on('data', function(data) {
    socket.write(data);
  });

  // close socket
  var onEnd = function() {
    if (removed) {
      return;
    }
    removed = true;
    clients.splice(clients.indexOf(socket), 1);
  };

  socket.on('error', onEnd);
  socket.on('end', onEnd);

});

server.listen(40404, function() {
  console.log('sonarjs listening on port 40404');
});
