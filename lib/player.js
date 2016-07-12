var events = require('events');
var util = require('util');
var logger = require('./log.js');

var Player = function (_name, _socket) {
    this.name = _name;
    this.socket = _socket;
    this.roomName = 'noRoom';
    this.roll = 0;
    //
    logger.info(this.name + '(' + this.socket.id + ') connected to game server.');
    //
}

Player.prototype.joinRoom = function (_room, _roll) {
    try {
        this.roomName = _room.name;
        this.socket.join(this.roomName);
        this.roll = _roll;
        _room.players.push(this);
        var message = new Object();
        message.command = 'gameStatus';
        message.status = 'true';
        this.socket.emit('server2client', JSON.stringify(message));
        //this.socket.emit('server2client', { command: 'gameStatus', status: 'true' });
        //
        logger.info(this.name + '(' + this.socket.id + ') joined to ' + this.roomName);
        //
    }
    catch (ex) {
        logger.error(ex.message);
    }
}
Player.prototype.leaveRoom = function (_room) {
    //Oyuncu room'dan ayrılır
    if (this.roomName != 'noRoom') {
        this.socket.leave(_room.name);
        var index = _room.players.indexOf(this);
        _room.players.splice(index, 1);
        this.roomName = 'noRoom';
        var message = new Object();
        message.command = 'gameStatus';
        message.status = 'false';
        this.socket.emit('server2client', JSON.stringify(message));
        //this.socket.emit('server2client', { command: 'gameStatus', status: 'false' });
        //
        logger.info(this.name + '(' + this.socket.id + ') left from ' + _room.name + '.');
        //
    }
}

//util.inherits(Player, events.EventEmitter);

module.exports = Player;

