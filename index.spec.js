// index.spec.js
// Unit test index

'use strict';
process.env.NODE_ENV = 'test';

/**
* Test dependencies
* @private
*/
const chai = require('chai');
const sinon = require('sinon');
const fork = require('child_process').fork;
const Path = require('path');
/**
* Constances
* @private
*/
const INDEX_PATH = Path.resolve(__dirname,'./index.js');

/**
* Utils
* @private
*/
const expect = chai.expect;

describe('Index unit test',() =>{
	
	function clearCache(){
		delete require.cache[require.resolve('./index')];
	};

	describe('Start and shutdown',() =>{

		afterEach('Clear cached', () =>{
			clearCache();			
		});

		it('should shutdown', (done) => {
			var app = require('./index');
			app.server.close(done);
		});
	});
	describe('Selective port',() =>{
		
		afterEach('Clear cached', () =>{
			clearCache();			
		});

		it('should listen to default port 3000', (done) =>{
			var app = require('./index');
			expect(app.server.address().port).to.eq(3000);
			app.server.close(done);
		});

		it('should listen to specified port', () =>{
			var port = 6000;
			process.env.PORT = port;
			var app = require('./index');
			expect(app.server.address().port).to.eq(port);
			app.server.close();
			delete process.env.PORT;
		});
	});

	describe('Process.send',() =>{
		
		afterEach('Clear cached', () =>{
			clearCache();			
		});
		
		it('should emit message process child', (done) => {
			
			var timeout = setTimeout(() =>{
				appfork.kill();
				done(new Error('Message not received before 1000 ms.'));
			}, 1000);

			var appfork = fork(INDEX_PATH);
			appfork.on('message', (msg) =>{
				expect(msg).to.eq('listening');
				clearTimeout(timeout);
				appfork.kill();
				done();
			});

		});
	});
});