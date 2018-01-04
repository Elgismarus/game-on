// components/iohandler.js
// Module handle input/output

/**
* Module dependencies
* @private
*/
const IO = require('socket.io');
const Player = require('../Player/index');
const log = require('../utils').log;

module.exports = function(server, table){

	var io = IO(server);

	//Event handlers
	io.on("connection", function (socket) 
	{

		log("Connected. ID: " + socket.id);
		io.emit("drawTable",table.players);

		socket.on("disconnect", function () 
		{
			log("Disconnected ID: " + socket.id);
		});

		socket.on("chat", function (msg) 
		{
			log("message: " + msg);

			//FUTURE: Persistent names - Check cookie for name using socket.request
			
			io.emit("chat", msg);
			log("chat msg sent.");
			
		});
		
		socket.on("clearTable", function () 
		{
			log("Clear sent by: " + socket.id);
			table.clear();
			io.emit("updateTable",table.players);
			log("update table sent");
		});
		
		socket.on("addPlayer", function (data) 
		{
			log("Add received from: " + socket.id + ". Data: " + JSON.stringify(data));
			
			if(table.full)
			{
				log("Table is full");
				io.sockets.connected[socket.id].emit("fullTable");
				log("Full table sent to " + socket.id);
				return;
			}
			table.addPlayer(new Player(data[0].name,socket.id));
			log("Player added. Sending Update Table event");
			io.emit("updateTable",table.players);
			
			if (table.getLength() == 1 )
			{	
				log("Broadcast new table event");
				socket.broadcast.emit('startTable');
				log("sent.");
				return;
			}
		});
	});
};