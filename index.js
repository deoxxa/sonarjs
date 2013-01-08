var net = require('net');

var server = net.createServer(function(socket) {
  socket.on('end', function() {
    console.log('sonarjs disconnected');
  });
  
  socket.write('beep boop...\r\n');
  
  socket.pipe(socket);
});

server.listen(40404, function() {
  console.log('sonarjs listening on port 40404');
});
