// Tests/Functional/chat.spec.js

// Test home page
'use strict';

// Set up environment
process.env.NODE_ENV = 'test';

// Dependencies
const chai = require('chai');
const Browser = require('zombie');
const Helpers = require('./helpers');
const fork = require('child_process').fork;
const Path = require('path');

// Constances
const PORT = 5001;
const INDEX_PATH = Path.resolve(__dirname,'../../index.js');
const URL = 'http://localhost:' + PORT;

// Utils
const expect = chai.expect;

describe('Foosball Notifier Test Suite',() =>{

	var browser = new Browser();

	var child;
	before('Setting up server', (done) => {
		process.env.PORT = PORT;
		child = fork(INDEX_PATH);
		child.on('message', function (msg) {
			if (msg === 'listening') {
				done();
			}
		});
	});

	after("Kill process",() => {
		delete process.env.PORT;
		child.kill();
	});
	
	before('Query Foosball Notifier page', (done) =>{
		Helpers.visitAndValidate(browser,URL + '/', done);
	});

	after('Close browser', ()=>{
		browser.window.close()
	});

	describe('When registering for a game',() =>{

		it('should notify in chat user joined', (done) =>{
			
			expect(browser.query('#messages')).is.not.undefined;

			browser
			.fill('name', 'Frank')
			.pressButton('Notify me!')
			.then(() =>{
				// TODO: Better way to collect messages?
				// Timeout to wait for message to populate
				setTimeout(() =>{
					var messages = browser.text('#messages').split("\n");
					expect(messages.length).to.eq(1);
					expect(messages[0]).to.contains('New player join');
					done();	
				}, 10);
			}).catch(done);
		});
	});
});