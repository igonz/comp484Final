var app = require('express')();
var express = require('express');
var http = require('http').createServer(app);
var io = require('socket.io')(http);

var connectedUsersToColors = {};
var clientColors = ["green", "red", "black", "yellow", "orange"];  
app.use(express.static('public'));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  var clientSessionInfo = {};
  clientSessionInfo.id = socket.id;
  clientSessionInfo.color = clientColors[Math.floor(Math.random() * clientColors.length)];
  socket.send(clientSessionInfo);

  socket.on('chat message', function(msg){
    console.log(msg);
    io.emit('chat message', msg);
  });

  socket.on('drawingCoords', function(msg){
    io.emit('updateClients', msg)
  });

  socket.on('disconnect', function(msg) {
    console.log('Disconnected');
    console.log(msg);
  })
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});