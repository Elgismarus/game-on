// Tests/Functional/events.spec.js
// Test io handler

/**
* Test dependencies
* @private
*/
const http = require('http');
const io = require('socket.io-client');
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const SocketTester = require('socket-tester');

/**
* Utils
* @private
*/
const expect = require('chai').expect;

/**
* Constances
* @private
*/
const PORT = 8000;
const SOCKET_URL = 'http://localhost:' + PORT;

/**
* Mock require
* @private
*/
var log = sinon.spy();
var proxy = proxyquire('../../components/iohandler', {
	'../utils':{
		log: log,
		'@noCallThru': true
	}
});

/**
* Unit tested
* @private
*/
const iohandler = require('../../components/iohandler');

/**
* Test settings
* @private
*/
var clientOptions = {  
	transports: ['websocket'],
	'force new connection': true
};

var ioTester = new SocketTester(io,SOCKET_URL,clientOptions);

describe('Events handler Test Suite',() =>{
	
	var server, ioServer;
	var table;
	before('Set up server', () =>{
		server = http.createServer((req,res) =>{
			res.write('Hello world!');
			res.end();
		});
		server.listen(PORT);
		table = {
			players: ['player1', 'player2'],
			clear: sinon.spy(),
			addPlayer: sinon.spy(),
			getLength: sinon.stub()
		};
		ioServer = iohandler(server, table);
	});

	after('Close server', (done) =>{
		server.close(done);
	});

	describe('IO Handler',() =>{

		var patternConnected = /^(Connected\. ID:\s).*?$/;
		var patternDisconnected = /^(Disconnected ID:\s).*?$/;
		var patternClearTable = /^(Clear sent by:\s).*?$/;
		var patternAddPlayer = /^(Add received from:\s).*?$/;
		var patternFullTable = /^(Full table sent to\s).*?$/;
		

		// Util function killer timeout
		function killClient(client, fn, time){
			return killClients([client], fn, time);
		}

		function killClients(clients, fn, time){
			if(time == undefined){
				time = 200;
			}
			return setTimeout(() =>{
				clients.forEach(c =>{
					c.disconnect();
				});
				fn(new Error('Message not received below ' + time + 'ms.'));
			}, time);
		}
		before('Testing connect regex', () =>{
			var regx = new RegExp(patternConnected);
			expect(regx.test('Connected. ID: Q-abf2C4d_448e')).to.be.true;
			expect(regx.test('Should not pass. ID: Q-abf2C4_d448e')).to.be.false;
		});

		before('Testing disconnect regex', () =>{
			var regx = new RegExp(patternDisconnected);
			expect(regx.test('Disconnected ID: Q-abf2C4d448e')).to.be.true;
			expect(regx.test('Should not pass. ID: Q-abf2C4d448e')).to.be.false;
		});

		before('Testing tableClear regex', () =>{
			var regx = new RegExp(patternClearTable);
			expect(regx.test('Clear sent by: Q-abf2C4d_448e')).to.be.true;
			expect(regx.test('Should not pass. ID: Q-abf2C4_d448e')).to.be.false;
		});

		before('Testing addPlayer regex', () =>{
			var regx = new RegExp(patternAddPlayer);
			expect(regx.test('Add received from: Q-abf2C4d_448e')).to.be.true;
			expect(regx.test('Should not pass. ID: Q-abf2C4_d448e')).to.be.false;
		});

		before('Testing full table regex', () =>{
			var regx = new RegExp(patternFullTable);
			expect(regx.test('Full table sent to Q-abf2C4d_448e')).to.be.true;
			expect(regx.test('Should not pass. ID: Q-abf2C4_d448e')).to.be.false;
		});

		afterEach('Reset spy counter', () =>{
			table.clear.reset();
			table.addPlayer.reset();
			table.getLength.reset();
			if(table.full){
				table.full = false;
			}
		});

		it('should confirm client connect', (done) => {
				
			var client1 = io.connect(SOCKET_URL, clientOptions);
			var killer = killClient(client1, done);
			client1.on('connect', () =>{
				clearTimeout(killer);
				try{
					expect(log.calledWith(sinon.match(patternConnected))).to.be.true;
					client1.disconnect();
					done();
				}catch(e){
					client1.disconnect();
					done(e);
				}
			});
		});

		it('should emit drawTable with list players event', (done) =>{
			var client1 = io.connect(SOCKET_URL, clientOptions);
			var killer = killClient(client1, done);
			client1.on('drawTable', (playerlist) =>{
				clearTimeout(killer);
				try{
					expect(playerlist).to.deep.equal(table.players);
					client1.disconnect();
					done();
				}catch(e){
					client1.disconnect();
					done(e);
				}
			});
		});

		it('should log when disconnect', (done) =>{
			var client1 = io.connect(SOCKET_URL, clientOptions);
			var killer = setTimeout(() =>{
				done.fail('Message disconnect not received below 500 ms.');
			}, 500);
			client1.on('disconnect', () =>{
				clearTimeout(killer);
				try{
					expect(log.calledWith(sinon.match(patternDisconnected))).to.be.true;
					done();	
				}catch(e){
					done(e);
				}
			});
			client1.on('connect', () =>{
				client1.disconnect();
			});
		});

		it('should log chat message', (done) =>{
			var msg = 'This is a test';
			var client1 = io.connect(SOCKET_URL, clientOptions);
			var killer = killClient(client1, done);
			client1.on('chat', () =>{
				clearTimeout(killer);
				try{
					expect(log.calledWith('message: ' + msg));
					expect(log.calledWith('chat msg sent.'));
					client1.disconnect();
					done();
				}catch(e){
					client1.disconnect();
					done(e);
				}
			});
			client1.emit('chat', msg);
		});

		it('should send messages to all client', (done) =>{
			var msg = 'This is a test';
			var client1 = {
				on: {
					'chat':ioTester.shouldBeCalledWith(msg)
				}
			};

			var client2 = {
				on: {
					'chat':ioTester.shouldBeCalledWith(msg)
				}
			};

			var client3 = {
				on: {
					'chat':ioTester.shouldBeCalledWith(msg)
				},
				emit:{
					'chat': msg
				}
			};
			try{
				ioTester.run([client1, client2, client3], done);	
			}catch(e){
				done(e);
			}
			
		});

		it('should send updateTable when clearTable called', (done) => {

			var client1 = io.connect(SOCKET_URL, clientOptions);
			var killer = killClient(client1, done);
			
			client1.on('updateTable', () =>{
				clearTimeout(killer);
				try{
					expect(log.calledWith(sinon.match(patternClearTable))).to.be.true;
					expect(log.calledWith('update table sent')).to.be.true;
					expect(table.clear.called).to.be.true;
					client1.disconnect();
					done();
				}catch(e){
					client1.disconnect();
					done(e);
				}
			});
			
			client1.on('connect', () =>{
				client1.emit('clearTable');
			});
		});

		it('should signal updateTable when user register', (done) =>{
			var player = [{
				name: 'tester'
			}];
			var client1 = io.connect(SOCKET_URL, clientOptions);
			var killer = killClient(client1, done);

			client1.on('updateTable', (players) =>{
				clearTimeout(killer);
				try{
					expect(log.calledWith(sinon.match(patternAddPlayer))).to.be.true;
					expect(players).to.deep.equal(table.players);
					expect(table.addPlayer.called).to.be.true;
					expect(log.calledWith('Player added. Sending Update Table event')).to.be.true;
					client1.disconnect();
					done();
				}catch(e){
					client1.disconnect();
					done(e);
				}
			});

			client1.on('connect', () =>{
				client1.emit('addPlayer', player);
			});
		});

		it('should signal fullTable if table full', (done) =>{
			var player = [{
				name: 'tester'
			}];

			table.full = true;

			var client1 = io.connect(SOCKET_URL, clientOptions);
			var killer = killClient(client1, done);

			client1.on('fullTable', () =>{
				clearTimeout(killer);
				try{
					expect(log.calledWith('Table is full')).to.be.true;
					expect(log.calledWith(sinon.match(patternFullTable))).to.be.true;
					expect(table.addPlayer.called).to.be.false;
					client1.disconnect();
					done();
				}catch(e){
					client1.disconnect();
					done(e);
				}
			});

			client1.on('connect', () =>{
				client1.emit('addPlayer', player);
			});
		});

		it('should signal startTable to others if first registration', (done) =>{
			var player = [{
				name: 'tester'
			}];

			table.getLength.returns(1);

			var client1 = {
				on:{
					'startTable': ioTester.shouldNotBeCalled()
				},
				emit:{
					'addPlayer': player
				}
			};

			var client2 = {
				on:{
					'startTable': ioTester.shouldBeCalledNTimes(1)
				}
			};
			
			var client3 = {
				on:{
					'startTable': ioTester.shouldBeCalledNTimes(1)
				}
			};

			try{
				ioTester.run([client1, client2, client3], ()=>{
					expect(log.calledWith('Broadcast new table event')).to.be.true;
					expect(log.calledWith('New table event sent.')).to.be.true;
					done();
				});
			}catch(e){
				done(e);
			}
		});
	});
});