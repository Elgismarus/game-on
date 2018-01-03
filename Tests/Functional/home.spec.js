// Tests/Functional/home.spec.js

// Test home page
'use strict';
// Set up environment
process.env.NODE_ENV = 'test';

// Dependencies
const chai = require('chai');
const Browser = require('zombie');
const fork = require('child_process').fork;
const Path = require('path');

// Constances
const INDEX_PATH = Path.resolve(__dirname,'../../index.js');
const PORT = 5002;
const URL = 'http://localhost:'+PORT;
// Utils
const expect = chai.expect;

// Test
describe('Given user go to home page',() =>{
	
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
	

	before('Visit page', (done) =>{
		browser.visit(URL + '/', done);
	});

	after('Close browser', ()=>{
		browser.window.close()
	});

	it('should load the page', () => {
		expect(browser.status).to.eq(200);
		expect(browser.success).to.be.true;	
	});
});