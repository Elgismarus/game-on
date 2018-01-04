// Player/player.spec.js

// Unit test for player

'use strict';
process.env.NODE_ENV = 'test';

// Dependencies
const chai = require('chai');
const sinon = require('sinon');
const sinonchai = require('sinon-chai');
const proxyquire = require('proxyquire');

// Utils
const expect = chai.expect;
chai.use(sinonchai);

var logs = [];
proxyquire('./player', {
	'../utils': {
		log: function(msg){
			logs.push(msg);
		}
	}
});

// Unit tested
const Player = require('./player');

describe('Player Object Basic test',() =>{
	
	it('should return Player object', () => {
		var player1 = new Player();
		expect(player1).is.not.null;
		expect(player1).is.not.undefined;
	});

	it('should have name property as string', () =>{
		var player1 = new Player();
		expect(player1.name).is.not.undefined;
		expect(player1.name).to.be.a.string;
	});

	it('should have clientId property as string', () =>{
		var player1 = new Player();
		expect(player1.clientId).is.not.undefined;
		expect(player1.clientId).to.be.a.string;
	});
});

describe('Given user want to set name to player',() =>{
	
	it('should be able to set name via constructor', () => {
		var expectedName = 'PlayerTest';
		var player1 = new Player(expectedName);
		expect(player1.name).to.eq(expectedName);
	});
});
	
describe('Given user want to set clientId to player',() =>{
	
	it('should be able to set clientId via constructor', () => {
		var expectedClientId = 'ClientTest';
		var player1 = new Player(null, expectedClientId);
		expect(player1.clientId).to.eq(expectedClientId);
	});
});

describe('Given user want to log player',() =>{
	
	after('Clear logs', () =>{
		logs = [];
	});

	it('should have log method', () => {
		expect((new Player()).log).is.not.undefined;
	});

	it('should display log', () =>{
		var playername = 'PlayerTest';
		var clientId = 'Id';
		(new Player(playername, clientId)).log();
		expect(logs).to.have.lengthOf(1);
		expect(logs[0]).to.eq(
			"\tPlayer name: " + playername + ", id: " + clientId + "\n");
	});
});