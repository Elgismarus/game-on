// Tests/Functional/chat.spec.js
// Test home page

'use strict';

// Set up environment
process.env.NODE_ENV = 'test';

// Dependencies
const chai = require('chai');
const assert = require('assert');
const Browser = require('zombie');
const Helpers = require('./helpers');
const Path = require('path');
const fork = require("child_process").fork;

// Constances
const INDEX_PATH = Path.resolve(__dirname,'../../index.js');
const PORT = 5000;
const URL = 'http://localhost:' + PORT;

// Utils
const expect = chai.expect;

describe('Chat Test Suite',() =>{

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

	describe('When landing on the page',() =>{

		it('should contains chat elements', () =>{
			expect(browser.query('#messages')).is.not.undefined;
			expect(browser.query('#msg')).is.not.undefined;
			expect(browser.query('#send')).is.not.undefined;
		});
	});

	describe('When submitting a message',() =>{
		
		it('should populate chat box', (done) => {
			var testMessage = 'This is a test';
			browser
			.fill('msg', testMessage)
			.pressButton('Send')
			.then(() =>{
				setTimeout(() =>{
					// TODO: Better way to retrive messages
					var messages = browser.text('#messages').split("\n");
					expect(messages.length).to.eq(1);
					expect(messages[0]).to.contains(testMessage);
					done();
				}, 10);
			}).catch(done);
		});

		// TODO: Test to reenable when feature implemented
		// it('should refuse blank message', (done) =>{
		// 	var testMessage = '';
		// 	browser
		// 	.fill('msg', testMessage)
		// 	.pressButton('Send')
		// 	.then(() =>{
		// 		browser.wait({element:'#messages li'})
		// 		.then(() =>{
		// 			// TODO: Better way to retrieve messages
		// 			var messages = browser.text('#messages').split("\n");
		// 			expect(messages.length).to.eq(0);
		// 			done();
		// 		}).catch(done);
		// 	});
		// });
	});
});