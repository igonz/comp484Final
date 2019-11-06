var app = require('express')();
var express = require('express');
var http = require('http').createServer(app);
var io = require('socket.io')(http);

var connectedUsersToColors = {};

app.use(express.static('public'));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  socket.send(socket.id);

  socket.on('chat message', function(msg){
    console.log(msg);
    io.emit('chat message', msg);
  });

  socket.on('drawingCoords', function(msg){
    console.log(msg);
  });

  socket.on('disconnect', function(msg) {
    console.log('Disconnected');
    console.log(msg);
  })
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});