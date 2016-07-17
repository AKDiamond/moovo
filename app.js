var http = require('http');
var fs = require('fs');
var url = require('url');
var path = require('path');
// var io = require('socket.io');
var express = require('express');
var app = express();
var redis = require('redis');
// var client = redis.createClient(); //creates a new client
// var client = redis.createClient('6379', 'redis');

//************************* FUNCTIONS ***********//

function isEven(n) {
   return n % 2 == 0;
}

function isOdd(n) {
   return Math.abs(n % 2) == 1;
}
//***************************************************************//

//https://console.cloud.google.com/networking/networks/details/default?project=moovo-chat
/************ db functions******************/
// client.del('userData');
// client.on('connect', function() {
//     console.log('connected');
// });

app.use('/', express.static(__dirname + '/'));
// The common path is for shared code: used by both client and server.
// app.use('/common', express.static(__dirname + '/common'));
// The root path should serve the client HTML.

app.get('/chat', function (req, res) {
    res.sendfile(__dirname + '/index.html');
});


server = require('http').createServer(app);
var PORT=8080;
var IPADDRESS='0.0.0.0';
server.listen(PORT, IPADDRESS);
io = require('socket.io').listen(server);

var usernames = {};
var userid={}
var userroom={}
var rooms = ['room1','room2','room3'];
var sockets={};
var status={}
io.sockets.on('connection', function (socket) {

	socket.on('adduser', function(userNum){
		// store the username in the socket session for this client
		// socket.emit('client_id',username,"r4nd0m");
		socket.userNum = userNum;
		// store the room name in the socket session for this client
		socket.room = 'room1';
		// add the client's username to the global list
		usernames[userNum] = userNum;
		// send client to room 1
		socket.join('room1');
		// echo to room 1 that a person has connected to their room
		userid[userNum]=socket.id;
		console.log(userNum + " ---- "+userid[userNum]);
		io.sockets.emit('connected',{"msg":"SERVER: "+userNum+" has coonected"})
		// console.log(usernames)
		// client.hmset('userData', userNum, socket.id);
		// client.sadd(['users',userNum]);
		socket.talk_to="admin";
		sockets[userNum]=socket;
		var talked_with=userNum+'talked_with'
		socket.talked_with=talked_with
		socket.dbName='set_later'
		socket.contactsDB=userNum+'-contacts'
		status[userNum]="online"

		// client.smembers(socket.contactsDB, function(err, reply) {
		// 	reply.forEach(function (rep, i) {
  //   			socket.emit('addcontact',{"contact":rep});
  //   			console.log(rep)
  //   		});
		// });
		// client.sdd([socket.talked_with,userNum])

		// client.rpush([userNum], function(err, reply) {
		//     console.log(reply); //prints 3
		// });
	});

	socket.on('talk_to',function(friend){
		// client.sadd([socket.contactsDB, friend])
		console.log(socket.userNum+" talking to "+ friend);
		socket.talk_to=friend;
		// client.sdd([socket.talked_with,friend])
		//send previous texts to render
		
		if (socket.userNum<socket.talk_to){
			socket.dbName=socket.userNum+socket.talk_to
		}else {
			socket.dbName=socket.talk_to+socket.userNum
		}

		var sent_by=''
		var mess=''
		// client.lrange(socket.dbName, 0, -1, function(err, reply) {
		//    	reply.forEach(function (rep, i) {
		//    		if (isEven(i)==true){
		//    			sent_by=rep	
		//    		}
		//    		else {
		//    			mess=rep
		//    			socket.emit('render',{"sent_by":sent_by,"mess":mess})
		//    			// console.log("sent_by: "+sent_by+" mess:"+mess)
		//    		}
		//    	});
		// });


	});
	socket.on('new_msg',function(message){
		// console.log(socket.userNum+'::::'+message);
		// socket.emit('updatechat',{"who":socket.username,"msg":message});
		// io.sockets.in(socket.room).emit('updatechat',{"who":socket.username,"msg":message})
		// socket.broadcast.to(socket.room).emit('updatechat', {"who":socket.username,"msg":message});
		socket.emit('updatechat', {"who":socket.userNum,"msg":message});
		// socket.broadcast.to(socket.room).emit('updatechat',{"who":socket.userNum,"msg":message});
		// console.log(message);
		if (status[socket.talk_to]=="online"){
			sockets[socket.talk_to].emit('updatechat', {"who":socket.userNum,"msg":message});
		}else {
			//notify receiver is offline
			socket.emit('offline',{"who":socket.talk_to})
			//store to send later
		}
		// io.sockets.in(socket.room).emit('updatechat',{"who":socket.username,"msg":message})

		// client.lpush('messages', JSON.stringify(message)); // push into redis
		// client.lrange('messages', 0, -1, function(err, reply) {
		//   //reply contains all messages
		//   console.log(reply)
		// });
		// client.rpush([socket.userNum,socket.userNum,message])
		// client.rpush([socket.talk_to,socket.userNum,message])
		// client.rpush([socket.dbName,socket.userNum,message])

	});

//send to only sender and recipient. 
	socket.on('new_msg1',function(message){
		console.log(socket.userNum+'::::'+message);
		// socket.emit('updatechat',{"who":socket.username,"msg":message});
		// io.sockets.in(socket.room).emit('updatechat',{"who":socket.username,"msg":message})
		// socket.broadcast.to(socket.room).emit('updatechat', {"who":socket.username,"msg":message});
		socket.emit('updatechat', {"who":socket.userNum,"msg":message});
		socket.broadcast.to(socket.room).emit('updatechat',{"who":socket.userNum,"msg":message});
		// io.sockets.in(socket.room).emit('updatechat',{"who":socket.username,"msg":message})
	});

	socket.on('typing',function(){
		sockets[socket.talk_to].emit('typing',{"who":socket.userNum});
	});


	socket.on('disconnect', function(){
		// // remove the username from global usernames listd
		// status[userNum]="offline"
		// console.log(socket.userNum + ' has disconnected');
		// delete usernames[socket.userNum];
		// // update list of users in chat, client-side
		// // io.sockets.emit('updateusers', usernames);
		// // sockets[socket.talk_to].emit('updatechat',{"who":"SERVER","msg":message})
		// // echo globally that this client has left
		// // socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
		// socket.leave(socket.room);
		// client.quit()
		console.log("disconnected user")
	});


});
