var net = require('net');

var server = net.createServer(function(socket) {
  socket.on('end', function() {
    console.log('server disconnected');
  });
  
  socket.write('begin typing happily...\r\n');
  
  socket.pipe(socket);
});

server.listen(80, function() {
  console.log('server listening on port 80');
});
