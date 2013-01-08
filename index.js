var net = require('net');

var clients = [];

var server = net.createServer(function(socket) {
  var removed = false;
  
  clients.push(socket);
  
  function on_end() {
    if (removed) {
      return;
    }

    removed = true;

    clients.splice(clients.indexOf(socket), 1);
  }
  socket.on("end", on_end);
  socket.on("error", on_end);
  
  socket.on('end', function() {
    console.log('sonarjs disconnected');
  });
  
  socket.write('beep boop...\r\n');
  
  socket.on("data", function(chunk) {
    clients.forEach(function(client) {
      if (client === socket) {
        return;
      }
      
      client.write(chunk);
    });
  });
  
  socket.pipe(socket);
});

server.listen(40404, function() {
  console.log('sonarjs listening on port 40404');
});
