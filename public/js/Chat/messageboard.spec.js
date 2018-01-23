'use strict';

/**
 * Message board BDD tests
 */

/**
 * Test Dependencies
 */
const TestUtils = require('../public.testutils');
const sinon = require('sinon');
const Path = require('path');

describe('Front-end Chat Message Board BDD Tests', () => {

	let win;
	before('Create window', () => {
		win = TestUtils.getWindow();
		win.Chat = {};
	});

	let msgBoardView;
	before('Create message board DOM element', () => {

		let scrolling = 0;
		msgBoardView = win.document.createElement('ul');
		msgBoardView.id = 'msgboard';
		msgBoardView.height = 0;

		sinon.stub(msgBoardView, 'scrollHeight')
			.get(function fnGetter() {
				return msgBoardView.height;
			});

		sinon.stub(msgBoardView, 'scrollTop')
			.set(function fnSetter(val) {
				scrolling = val;
			}).get(function fnGetter() {
				return scrolling;
			});

		win.document.body.appendChild(msgBoardView);
	});

	let ctx;
	before('Create context', (done) => {
		let module_path = Path.resolve(__dirname, './messageboard.js');
		let script = TestUtils.loadScript(module_path);
		ctx = TestUtils.createVMContext(script, win, module_path, done);
	});

	let messageboard;
	before('Set up easy access to module', () => {
		messageboard = ctx.Chat.MessageBoard;
	});

	context('Module init', () => {

		it('should have the module', () => {
			assert.isDefined(ctx.Chat.MessageBoard);
		});

		it('should have setter for element', () => {
			let htmlelement = ctx.document.getElementById('msgboard');
			messageboard.element = htmlelement;
			assert.equal(messageboard.element, htmlelement);
		});
	});

	context('Module actions', () => {

		/**
		 * Mock size in pixel of one message
		 * @type {Number}
		 */
		let msgHeight = 10;
		/**
		 * Helper to add message to board
		 * @param  {number} totalMessage
		 * @param  {object} messageboard
		 * @return {array}  [array of messages added]
		 */
		function createMessage(totalMessage, messageboard) {

			let messages = [];

			for (let i = 0; i < totalMessage; i++) {
				let msg = 'This is test ' + i;
				msgBoardView.height += msgHeight;
				messages.push(msg);
				messageboard.add(msg);
			}
			return messages;
		}

		beforeEach('Set height', () => {

			msgBoardView.scrollTop = 0;
			msgBoardView.height = 0;

		});

		afterEach('Clean message board', () => {
			while (msgBoardView.firstChild) {
				msgBoardView.removeChild(msgBoardView.firstChild);
			}
		});

		it('should have add', () => {
			assert.isFunction(messageboard.add);
		});

		it('can add a message', () => {

			let msg = 'This is a test';
			messageboard.add(msg);
			assert.equal(msgBoardView.children.length, 1);
			assert.equal(msgBoardView.children[0].innerHTML, msg);

		});

		it('should add multiple messages in descendant order', () => {

			let totalMessage = 3;
			let messages = createMessage(totalMessage, messageboard);

			assert.equal(msgBoardView.children.length, totalMessage);
			messages.forEach((msg, idx) => {
				assert.equal(msgBoardView.children[idx].innerHTML, msg);
			});

		});

		it('should scroll to the lastest element', () => {

			assert.equal(msgBoardView.scrollTop, 0);
			createMessage(10, messageboard);
			assert.equal(msgBoardView.scrollTop, msgBoardView.scrollHeight);

		});
		
	});

});