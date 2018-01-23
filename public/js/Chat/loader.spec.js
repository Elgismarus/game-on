'use strict';

/**
 * Chat loader BDD tests
 */

/**
 * Test Dependencies
 */
const TestUtils = require('../public.testutils');
const sinon = require('sinon');
const Path = require('path');

describe('Front-end Chat Loader BDD Tests', () => {

	let win;
	before('Create window', () => {
		win = TestUtils.getWindow();
		win.Utils = {
			registerNameSpace: sinon.stub(),
			loadScript: sinon.stub(),
			subscribe: sinon.stub()
		};
		win.console = sinon.spy();
		win.io = sinon.spy();
		win.Utils.registerNameSpace.callsFake(namespace => {
			win[namespace] = {};
		});

		win.Utils.loadScript.callsFake(namespace => {
			let _element;
			return new Promise((resolve, reject) => {
				if (namespace === 'Chat.messageboard') {
					win.Chat.MessageBoard = {
						get element() {
							return _element;
						},
						set element(el) {
							_element = el;
						}
					};
					resolve();
				}
				reject(new Error('Not implemented'));
			});
		});
	});

	let msgboard;
	before('Set the message board element', () => {
		msgboard = win.document.createElement('ul');
		msgboard.id = 'messages';
		win.document.body.appendChild(msgboard);
	});

	let ctx;
	before('Create context', (done) => {
		let module_path = Path.resolve(__dirname, './loader.js');
		let script = TestUtils.loadScript(module_path);
		ctx = TestUtils.createVMContext(script, win, module_path, done);
	});

	context('Chat', () => {

		it('should have registerNameSpace', () => {
			assert.isDefined(ctx.Chat);
		});

	});

	context('Load messageboard', () => {

		it('should have requested script', () => {

			ctx.Utils.loadScript.should.have.been.calledOnce;
			ctx.Utils.loadScript.should.have.been
				.calledWith('Chat.messageboard');

		});

		it('should set the element', () => {
			assert.isDefined(ctx.Chat.MessageBoard.element);
			assert.equal(ctx.Chat.MessageBoard.element, msgboard);
		});

		it('should have register event handler', () => {
			ctx.Utils.subscribe.should.have.been.calledOnce;
		});

	});

});