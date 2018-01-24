/**
 * Test for modloader
 */

'use strict';

const TestUtils = require('./public.testutils');
const Path = require('path');
const sinon = require('sinon');

describe('Modloader BDD Tests', () => {

	let win;
	beforeEach('Set up windows', () => {
		win = TestUtils.getWindow();
		win.setTimeout = setTimeout;
		win.clearTimeout = clearTimeout;
		win.console = console;
		win.Utils = {
			loadScript: sinon.stub(),
			registerNameSpace: sinon.stub()
		};

		win.Utils.registerNameSpace.callsFake(namespace => {
			win[namespace] = {};
		});

		// Stub behavior of loadScript for different cases
		win.Utils.loadScript.callsFake((dotpath, fn) => {

			if (dotpath === 'ModuleName.loader') {

				let script = win.document.createElement('script');
				script.id = 'ModuleName.loader';
				win.document.body.appendChild(script);
				return Promise.resolve();

			} else if (dotpath === 'FailedScenario.loader') {
				return Promise.reject();
			} else if (dotpath === 'FailedComponent.component') {
				return Promise.reject(new Error('File do not exist.'));
			} else {
				return new Promise(resolve => {
					if (typeof fn === 'function') {
						fn(resolve);
					} else {
						resolve();
					}
				});
			}
		});
	});

	let ctx;
	beforeEach('Create context', (done) => {
		let module_path = Path.resolve(__dirname, './modloader.js');
		let script = TestUtils.loadScript(module_path);
		ctx = TestUtils.createVMContext(script, win, module_path, done);
	});

	context('Module loader.js', () => {


		it('should load loader.js of the module', () => {

			return ctx.ModLoader.require('ModuleName', 0)
				.then(() => {
					ctx.Utils.loadScript
						.should.have.been.calledOnce;
					ctx.Utils.loadScript
						.should.have.been.calledWith('ModuleName.loader');
					assert.isDefined(
						ctx.document.getElementById('ModuleName.loader'));

				});

		});

		it('should return the module', () => {
			return ctx.ModLoader.require('Test', 0)
				.then(m => {
					assert.isDefined(m);
					assert.equal(m, ctx.Test);
				});
		});

		it('should throw error if import failed', (done) => {

			ctx.ModLoader.require('FailedScenario')
				.then(() => {
					done(new Error('should not have resolved'));
				}).catch(err => {
					assert.isDefined(err);
					done();
				});
		});

	});

	context('Components', () => {

		it('should throw if module not loaded first', (done) => {

			ctx.ModLoader.register('Failed.component')
				.then(() => {
					done(new Error('not expecting to be resolved.'));
				}).catch(err => {
					assert.isDefined(err);
					done();
				});
		});


	});

	context('Module with components', () => {

		it('should allow register component', () => {


			ctx.ModLoader.require('Test');
			return ctx.ModLoader
				.register('Test.component')
				.then(() => {
					/**
					 * Should have been called twice
					 * one for Test and component
					 */
					ctx.Utils.loadScript
						.should.have.been.calledTwice;
					ctx.Utils.loadScript
						.should.have.been.calledWith('Test.component');
					assert.isDefined(
						ctx.document.getElementById('Test.component'));
				});
		});

		it('should only resolve when all components loaded', (done) => {

			let component_loaded_count = 0;
			ctx.ModLoader.require('Module')
				.then(() => {
					assert.equal(component_loaded_count, 2);
					done();
				}).catch(err => {
					done(err);
				});

			ctx.ModLoader.register('Module.component')
				.then(() => {
					component_loaded_count++;
				});

			ctx.ModLoader.register('Module.component2')
			.then(() =>{
				component_loaded_count++;
			});
		});

		it('should throw an error if failed to load', (done) => {
			
			ctx.ModLoader.require('FailedComponent');
			ctx.ModLoader.register('FailedComponent.component')
				.then(() => {
					done(new Error('Should not have resolved'));
				}).catch(err => {
					try{
						assert.isDefined(err);
						done();
					}catch(ex){
						done(ex);
					}
				});
		});

	});
});