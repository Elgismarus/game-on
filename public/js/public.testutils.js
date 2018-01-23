'use strict';

/**
 * Test Dependencies
 */
const chai = require('chai');
const sinonchai = require('sinon-chai');
const MockBrowser = require('mock-browser').mocks.MockBrowser;
const VM = require('vm');
const FS = require('fs');

/**
 * Test Utils
 */
global.assert = chai.assert;
chai.use(sinonchai);
chai.should();

/**
 * Create a new browser windows
 * @return {object} [browser window element]
 */
module.exports.getWindow = function getWindow() {
	let browser = new MockBrowser();
	let win = browser.getWindow();
	win.window = win;
	win.document = browser.getDocument();
	require('jquery')(win);
	return browser.getWindow();
};

/**
 * Create a new VM context
 * @param  {string}   o_module        [module script in a string]
 * @param  {object}   o_window        [global context element]
 * @param  {string}   str_module_path [path of the module to be recognise in coverage]
 * @param  {function} callback        [callback once loaded]
 * @return {object}                   [global context element]
 */
module.exports.createVMContext = function createVMContext(o_module, o_window, str_module_path, callback) {
	o_window.$(o_window.document)
		.ready(function VMLoaded() {
			callback();
		});
	let winctx = VM.createContext(o_window);
	VM.runInContext(o_module, winctx, str_module_path);
	return winctx;
};

/**
 * Load script from path provided
 * @param  {string} str_path [path of script]
 * @return {string}          [script in string]
 */
module.exports.loadScript = function loadScript(str_path) {

	return FS.readFileSync(str_path, {
		encoding: 'UTF-8'
	});

};