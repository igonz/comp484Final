var canvas, ctx, flag = false,
    prevX = 0,
    currX = 0,
    prevY = 0,
    currY = 0,
    dot_flag = false;

var x = "black",
    y = 2;

function init() {
    $(".clearButton").click(function() {
        erase();
        socket.emit('eraseCanvas', clientSessionInfo);
    }); 

    $("#thickness").val(y);
    $("#thickness").change(function() {
        if($("#thickness").val()) {
            y = $("#thickness").val();
        }
    });
    canvas = document.getElementById('can');
    ctx = canvas.getContext("2d");
    w = canvas.width;
    h = canvas.height;

    canvas.addEventListener("mousemove", function (e) {
        findxy('move', e)
    }, false);
    canvas.addEventListener("mousedown", function (e) {
        findxy('down', e)
    }, false);
    canvas.addEventListener("mouseup", function (e) {
        findxy('up', e)
    }, false);
    canvas.addEventListener("mouseout", function (e) {
        findxy('out', e)
    }, false);
}

function color(obj) {
    switch (obj.id) {
        case "green":
            x = "green";
            break;
        case "blue":
            x = "blue";
            break;
        case "red":
            x = "red";
            break;
        case "yellow":
            x = "yellow";
            break;
        case "orange":
            x = "orange";
            break;
        case "black":
            x = "black";
            break;
        case "white":
            x = "white";
            break;
    }
    if (x == "white") y = 14;
    else y = 2;

}

function draw() {
    ctx.beginPath();
    ctx.moveTo(prevX, prevY);
    ctx.lineTo(currX, currY);
    ctx.strokeStyle = x;
    ctx.lineWidth = y;
    ctx.stroke();
    ctx.closePath();
    var coords = {"currX" : currX, "currY" : currY, "prevX": prevX, "prevY": prevY};
    clientSessionInfo.coords = coords;
    clientSessionInfo.thickness = y;
    socket.emit('drawingCoords', clientSessionInfo);
}

function drawClient(clientCoords) {
    ctx.beginPath();
    ctx.moveTo(clientCoords.coords.prevX, clientCoords.coords.prevY);
    ctx.lineTo(clientCoords.coords.currX, clientCoords.coords.currY);
    ctx.strokeStyle = clientCoords.color;
    ctx.lineWidth = clientCoords.thickness;
    ctx.stroke();
    ctx.closePath();
}

function erase() {    
    ctx.clearRect(0, 0, w, h);
}

function save() {
    document.getElementById("canvasimg").style.border = "2px solid";
    var dataURL = canvas.toDataURL();
    document.getElementById("canvasimg").src = dataURL;
    document.getElementById("canvasimg").style.display = "inline";
}

function findxy(res, e) {
    if (res == 'down') {
        prevX = currX;
        prevY = currY;
        currX = e.clientX - canvas.offsetLeft;
        currY = e.clientY - canvas.offsetTop;

        flag = true;
        dot_flag = true;
        if (dot_flag) {
            ctx.beginPath();
            ctx.fillStyle = x;
            ctx.fillRect(currX, currY, 2, 2);
            ctx.closePath();
            dot_flag = false;
        }
    }
    if (res == 'up' || res == "out") {
        flag = false;
    }
    if (res == 'move') {
        if (flag) {
            prevX = currX;
            prevY = currY;
            currX = e.clientX - canvas.offsetLeft;
            currY = e.clientY - canvas.offsetTop;
            draw();
        }
    }
}
var connectedClients = {};
var clientSessionInfo;
var socket;
$(function () {
    socket = io();
    $('form').submit(function (e) {
        e.preventDefault(); // prevents page reloading
        socket.emit('chat message', $('#m').val());
        $('#m').val('');
        return false;
    });
    socket.on('chat message', function (msg) {
        $('#messages').append($('<li>').text(msg));
    });

    socket.on('updateClients', function(msg) {
        if(msg.id != clientSessionInfo.id) {
            console.log(msg.id + " " + clientSessionInfo.id);
            drawClient(msg);
        }
    });

    socket.on('clientConnections', function(data) {
        if(data.id != clientSessionInfo.id) {
            connectedClients[data.id] = data.color;
            $('#messages').append("<li><font color='" + data.color + "'>User connected</font></li>");
        }
    });

    socket.on("disconnect", function(data) {
        console.log(connectedClients);
        var color = connectedClients[data];
        delete connectedClients[data];
        $('#messages').append("<li><font color='" + color + "'>User disconnected</font></li>");
    });

    socket.on('eraseCanvas', function(client) {
        if(client.id != clientSessionInfo.id) {
            erase();
            $('#messages').append("<li><font color='" + client.color + "'>User erased canvas</font></li>");
        }
        
    });

    socket.on('message', function(data) {
        clientSessionInfo = data;
        x = clientSessionInfo.color;
        socket.emit('clientConnections', data);
        console.log("Received " + data);
    })
});