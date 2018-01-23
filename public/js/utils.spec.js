'use strict';

const TestUtils = require('./public.testutils');
const Path = require('path');
const sinon = require('sinon');
const SocketIOMock = require('socket.io-mock');

describe('Utils BDD Tests', () => {

	let win;
	beforeEach('Set up windows', () => {
		win = TestUtils.getWindow();
	});

	let ctx;
	beforeEach('Create context', (done) => {
		let module_path = Path.resolve(__dirname, './utils.js');
		let script = TestUtils.loadScript(module_path);
		ctx = TestUtils.createVMContext(script, win, module_path, done);
	});

	context('Import JavaScript file', () => {

		beforeEach('Stub appendChild', () =>{
			/**
			 * Stub as calling fake path script
			 * and solving promise
			 */
			sinon.stub(ctx.document.body, 'appendChild')
			.callsFake(elScript =>{
				elScript.onerror = function(){};
				ctx.document.head.appendChild(elScript);
				elScript.onload(elScript);
			});
			
			
		});

		afterEach('Clean up scripts', () => {

			let scripts = ctx.document.getElementsByTagName('SCRIPT');
			for (let i = 0; i < scripts.length; i++) {
				scripts[i].remove();
			}

		});

		it('should include script tag', () => {

			return ctx.Utils.loadScript('test')
				.then((elScript) => {
				
					assert.equal(elScript.tagName, 'SCRIPT');
					assert.equal(elScript.type, 'text/javascript');
					assert.equal(elScript.src, '/js/test.js');
				
				});


		});

		it('should handle folders location', () => {

			return ctx.Utils.loadScript('test.test')
				.then((elScript) => {
					assert.equal(elScript.src, '/js/test/test.js');
				});


		});

		it('should not load script twice', (done) => {

			ctx.Utils.loadScript('test2.test')
				.then(() => {
					ctx.Utils.loadScript('test2.test')
						.then(() => {
							ctx.document.body.appendChild.calledOnce;
							done();
						}).catch(err =>{
							done(err);
						});

				}).catch(err =>{
					done(err);
				});

		});

		it('should load async by default', () =>{
			
			return ctx.Utils.loadScript('test.test')
			.then(elScript =>{
				assert.isTrue(elScript.async);
			});

		});

		it('should allow loading async', () =>{
			
			return ctx.Utils.loadScript('test2.test', false)
			.then(elScript =>{
				assert.isFalse(elScript.async);
			});
		});

	});

	context('Register namespace', () => {

		it('should add to window', () => {

			ctx.Utils.registerNameSpace('test');
			assert.isDefined(ctx.test);

		});

		it('should register subnamespace', () => {

			ctx.Utils.registerNameSpace('test.level1');
			assert.isDefined(ctx.test.level1);

			ctx.Utils.registerNameSpace('test.level1.level2');
			assert.isDefined(ctx.test.level1.level2);

		});

		it('should add and not overwrite existing', () => {

			ctx.Utils.registerNameSpace('test.notdeleted');
			assert.isDefined(ctx.test.notdeleted);
			ctx.Utils.registerNameSpace('test.added');
			assert.isDefined(ctx.test.added);

			assert.isDefined(ctx.test.notdeleted);
		});

	});

		context('bind Socket IO', () => {

		let mockServer, mockClient;
		before('Set up socketIO', () => {
			mockServer = new SocketIOMock();
			mockClient = mockServer.socketClient;
		});

		it('should bind on & once', () =>{

			let spyOn = sinon.spy();
			let spyOnce = sinon.spy();

			let evtName = 'myevent';

			let handlers ={};
			handlers[evtName] = {
				'on': spyOn,
				'once': spyOnce
			};

			ctx.Utils.subscribe(mockClient, handlers);

			mockServer.emit(evtName);
			spyOn.should.have.been.calledOnce;
			spyOnce.should.have.been.calledOnce;

		});

		it('should bind multiple handlers', () =>{
			
			let handlers = {
				'firstevent':{
					on: sinon.spy(),
					once: sinon.spy()
				},
				'secondevent': {
					on: sinon.spy(),
					once: sinon.spy()
				}
			};

			ctx.Utils.subscribe(mockClient, handlers);

			mockServer.emit('firstevent');
			handlers.firstevent.on.should.have.been.calledOnce;
			handlers.firstevent.once.should.have.been.calledOnce;

			mockServer.emit('secondevent');
			handlers.secondevent.on.should.have.been.calledOnce;
			handlers.secondevent.once.should.have.been.calledOnce;

		});

	});

});