//var events = require('events');
//var util = require('util');
//var io = require('socket.io');
var logger = require('./log.js');

var GameRoom = function (_name) {
    this.name = _name;
    this.maxPlayer = 2;
    this.players = [];
    this.roomState = 'WAITING';
    logger.info(this.name + " is created");
    this.turn = false;
    //event.EventEmitter.call(this);
    /*this.getOtherPlayers1 = function (player) {
        var newPlayerList = this.players;
        newPlayerList.splice(newPlayerList.indexOf(player), 1);
        return newPlayerList;
    }*/
}

GameRoom.prototype.Wait = function () {
    this.roomState = 'WAITING';
    if (this.turn == true) {
        this.turn = false;
    }
    logger.info(this.name + ' status : ' + this.roomState + '. Connected players :');// + this.players.toString());
}


GameRoom.prototype.IsWaiting = function () {
    return (this.roomState == 'WAITING');
}

GameRoom.prototype.Play = function () {
    this.roomState = "PLAYING";
    logger.info(this.name + ' status : ' + this.roomState);
    var PlayerList = this.players;
    var roll = Math.floor(Math.random() * 100);
    //tum oyunculara oyun baslamaya hazır bilgisini ve gamerooom'daki diger oyuncu isimlerini gönderir.
    //this.players.forEach(function (p) {
    for (var index in this.players){
        var otherPlayers = PlayerList.slice();
        otherPlayers.splice(otherPlayers.indexOf(this.players[index]), 1);

        var arr = [];
        for (var index_2 in otherPlayers) {
            var item = { name: otherPlayers[index_2].name };
            arr.push(item);
        }
        var arrJSONString = JSON.stringify({ players: arr });
        //JSON mesajını olusturmaya başla
        var message = new Object();
        message.command = 'gameStarting';
        message.second = '3';
        message.roll = roll;
        //Ilk oyuncu oyuna baslar
        if (this.turn == false) {
            //gameroom'da oyuna baslayacak ilk oyuncu secildi.
            this.turn = true;
            message.turn = true;
        }
        else {
            message.turn = false;
        }
        message.players = arr;
        this.players[index].socket.emit('server2client', JSON.stringify(message));
    };
}

GameRoom.prototype.IsPlaying = function () {
    return (this.roomState == "PLAYING");
}

GameRoom.prototype.getOtherPlayers = function (player) {
    var newPlayerList = this.players;
    newPlayerList.splice(newPlayerList.indexOf(player), 1);
    return newPlayerList;
}


//util.inherits(Room, event.EventEmitter);

module.exports = GameRoom;