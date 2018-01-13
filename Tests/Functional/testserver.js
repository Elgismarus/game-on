/**
 * Create fake server for testing
 */
'use strict';

/**
 * Module Dependencies
 * @private
 */
const VM = require('vm');
const Path = require('path');
const fs = require('fs');

/**
 * Constances
 * @private
 */
const INDEX_PATH = Path.resolve(__dirname, '../../index.js');
const Server_code = fs.readFileSync(INDEX_PATH, {
	encoding: 'UTF-8'
});

/**
 * Indicate next port number
 * @private
 */
let _nextPort = 6000;

/**
 * Get the next port
 * @return {number} [Next port number]
 * @private
 */
function getNextPort() {
	let port = _nextPort;
	if (port === 0) {
		port = 6000;
		_nextPort = port + 1;
	} else {
		port = _nextPort;
		_nextPort += 1;
	}
	return port;
}

/**
 * Run the server in VM environment
 * allowing to start multiple server
 * with different port during testing
 * @return {promise} [promise with http server]
 * @public
 */
module.exports.run = function() {

	let context = VM.createContext({
		require: function(path) {

			if (path.startsWith('.')) {
				path = Path.resolve(__dirname, '../../' + path);
			}
			return require(path);
		},
		__dirname: Path.resolve(__dirname, '../..'),
		module: {
			parent: this
		},
		process: {
			env: {
				PORT: getNextPort()
			}
		}
	});

	context.module.exports = context;
	return new Promise((resolve, reject) => {
		try {
			/**
			 * Add ending script to allow
			 * callback once script done
			 */
			let codeToRun = Server_code + '(function(){VM_Loaded()})();';
			context.VM_Loaded = function() {
				resolve(context.server);
			};
			VM.runInContext(codeToRun, context, INDEX_PATH);
		} catch (e) {
			reject(e);
		}
	});
};