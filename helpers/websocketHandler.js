const WebSocket = require('ws');

function startWebSocketServer() {
const server = new WebSocket.Server({
	port: 8080
  });

  let sockets = [];
  server.on('connection', function(socket) {
	sockets.push(socket);
  
	// When you receive a message, send that message to every socket.
	socket.on('message', function(msg) {
	  console.log(`Received message: ${msg}`);
	  sockets.forEach(s => s.send(msg));
	});
  
	// When a socket closes, or disconnects, remove it from the array.
	socket.on('close', function() {
	  sockets = sockets.filter(s => s !== socket);
	});
  });  
}

module.exports = startWebSocketServer;