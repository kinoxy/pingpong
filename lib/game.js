var socketio = require('socket.io');
var Player = require('./player.js');
var Room = require('./gameroom.js');
var logger = require('./log.js');
var io;
var playerList = {};
var rooms = {};


exports.listen = function (server) {
    io = socketio.listen(server);
    io.set('log level', 1);
    io.sockets.on('connection', function (socket) {

        socket.on('client2server', function (_message) {
            switch (_message.command) {
                case 'newPlayer':
                    // yeni oyuncu  olusturuluyor  
                    var player = new Player(_message.name, socket);
                    // yeni oyuncu playerList object-array'a ekleniyor. 
                    playerList[socket.id] = player;
                    break;
                case 'joinGame':
                    if (playerList[socket.id].roomName == 'noRoom') {
                        joinRoom(playerList[socket.id], _message.roll);
                    }
                    else {
                        logger.info(playerList[socket.id].name + '(' + socket.id + ') is already joined to ' + playerList[socket.id].roomName + '. Player cannot connect to another game room.');
                    }
                    break;
                case 'disconnectGame':
                    disconnectRoom(playerList[socket.id]);
                    break;
                case 'disconnectServer':
                    //disconnectServer(socket);
                    break;
                case 'coord':
                    sendCoord(socket, _message);
                    break;
                case 'score':
                    sendScore(socket, _message);
                    break;
                case 'move':
                    sendMove(socket, _message);
                    break;
                default:
                    logger.info('Command -' + _message.command + '- cannot be processed.');
                    break;
            }
        });

        socket.on('connect', function () {
            console.log('deneme');
        });

        socket.on('disconnect', function () {
            disconnectServer(socket);
        });
    });

    /*io.sockets.on('disconnect', function (socket) {
        disconnectServer(socket);
    });*/

}

function joinRoom(_player, _roll) {
    //Beklemede olan room olup olmadığını kontrol et.
    var isFreeRoomAvaliable = false;
    var roomName = '';
    try {
        for (var key in rooms) {
            if (rooms[key].IsWaiting() == true) {
                isFreeRoomAvaliable = true;
                roomName = rooms[key].name;
                break;
            }
        }
        if (isFreeRoomAvaliable) {
            //eğer oyun oynanmayan gameroom varsa rooms dizisindeki ilk oyun oynanmayan gameroom'a katıl
            _player.joinRoom(rooms[roomName], _roll);

            if (rooms[roomName].players.length == 2) {
                rooms[roomName].Play();
            }
            else {
                rooms[roomName].Wait();
            }
            return;
        }
        //Beklemede gameroom yoksa yeni room yarat ve player'ı ekle.
        else {
            var room = new Room('room-' + Object.keys(rooms).length);
            _player.joinRoom(room, _roll);
            room.players[0] = playerList[_player.socket.id];
            room.Wait();
            rooms[room.name] = room;
        }
    }
    catch (ex) {
        logger.error(ex.message);
    }
}

function disconnectRoom(_player) {
    var roomName = _player.roomName;
    try {
        //Oyuncu room'dan ayrılır
        _player.leaveRoom(rooms[roomName]);
        //Room'da birileri kaldıysa onlara oyuncu ayrıldı bilgisini gönder 
        if (rooms[roomName].players.length >= 1) {
            rooms[roomName].Wait();
            var message = new Object();
            message.command = 'opponentDisconnected';
            message.name = _player.name;
            io.sockets.in(roomName).emit('server2client', JSON.stringify(message));
        }
        //Room'da kimse kalmadıysa room, rooms dizisinden çıkartılır.
        else {
            delete rooms[roomName];
        }
    }
    catch (ex) {
        logger.error(ex.message);
    }

}

function disconnectServer(socket) {
    //Eğer oyundan çıkmadan önce gameroom'dan çıkılmadıysa önce gameroom'dan çık
    try {
        if (playerList[socket.id].roomName != 'noRoom') {
            disconnectRoom(playerList[socket.id]);
        }
        logger.info(playerList[socket.id].name + '(' + socket.id + ') left from game server');
        delete playerList[socket.id];
    }
    catch (ex) {
        logger.error(ex.message);
    }
}

function sendCoord(_socket, _message) {
    try {
        _socket.broadcast.in(playerList[_socket.id].roomName).emit('server2client', _message);
    }
    catch (ex) {
        logger.error('sendCoord => ' + ex.message);
    }
}

function sendScore(_socket, _message) {
    
    try {
        // Sayı olduktan sonra oyuna kimin baslayacagına dair zar atılır
        var roll = Math.floor(Math.random() * 100);
        var message_roll = new Object();
        // Zar degeri JSON'a yazılır ve room icerisindeki tum oyunculara gönderilir.
        message_roll.command = 'roll';
        message_roll.roll = roll;
        io.sockets.in(playerList[_socket.id].roomName).emit('server2client',JSON.stringify(message_roll));

        // Karsı oyuncuya skor bilgisi iletilir.
        _socket.broadcast.in(playerList[_socket.id].roomName).emit('server2client', _message);
        
        
    }
    catch (ex) {
        logger.error('sendScore => ' + ex.message);
    }
}

function sendMove(_socket, _message) {
    try {
        _socket.broadcast.in(playerList[_socket.id].roomName).emit('server2client', _message);
    }
    catch (ex) {
        logger.error('sendMove => ' + ex.message);
    }
}
