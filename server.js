var app = require('express')();
var express = require('express');
var http = require('http').createServer(app);
var io = require('socket.io')(http);

function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

app.use(express.static('public'));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  var clientSessionInfo = {};
  clientSessionInfo.id = socket.id;
  clientSessionInfo.color = getRandomColor();
  socket.send(clientSessionInfo);

  socket.on('chat message', function(msg){
    console.log(msg);
    io.emit('chat message', msg);
  });

  socket.on('drawingCoords', function(msg){
    io.emit('updateClients', msg)
  });

  socket.on('clientConnections', function(data) {
    io.emit('clientConnections', data);
  })

  socket.on('eraseCanvas', function (client) {
    io.emit('eraseCanvas', client);
  });

  socket.on('disconnect', function(msg) {
    io.emit('disconnect', socket.id);
    // console.log('Disconnected');
    // console.log(socket.id);
  })
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});