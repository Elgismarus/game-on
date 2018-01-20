'use strict';

// Set up environment
process.env.NODE_ENV = "test";

/**
 * Helper to set up functional testing
 */

/**
 * Register test functions
 */
const chai = require('chai');
global.expect = chai.expect;
global.assert = chai.assert;

/**
 * Test Module Dependencies
 */
const TestServer = require('./testserver');

/**
 * Set a before and after to start a test server
 * @param  {object} testargs [Object containing at least url property]
 */
module.exports.testServerBeforeAfter = function testServerBeforeAfter(testargs){
	
	let server;

	before('Setting up server', (done) =>{
		TestServer.run()
		.then(testserver =>{
			testargs.url = 'http://localhost:' + testserver.address().port;
			server = testserver;
			done();
		}).catch(err =>{
			done(err);
		});
	});

	after('Turn off test server', (done) =>{
		server.close(done);
	});
};