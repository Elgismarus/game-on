/* ***** JSHINT OPTIONS ***** */
/*exported Utils*/
/******************************/

/**
 * Utility module
 * Provide helpers function
 */
var Utils = (function Utils() {

	'use strict';

	let self = {};

	/**
	 * Load a JavaScript script file dynamically 
	 * 
	 * Add dynamically a script tag to the document.
	 *
	 * To pass a script inside folder, use dot notation:
	 * e.g. Test/test.js => Test.test
	 *
	 * @param {string} dotpath		[path in dot annotation]
	 * @param {boolean | function}	[Optional: async loading or callback before resolve]
	 * @param {boolean}				[Optional: async]
	 * @return {Promise}
	 * -> onload when resolve
	 * -> onerror when rejected
	 */
	function loadScript() {

		let dotpath = arguments['0'];
		// Expect first argument to be path
		if (typeof dotpath !== 'string') {
			return Promise.reject('Please provide a valid path.');
		}

		let fn = (typeof arguments['1'] === 'function') ?
			arguments['1'] : undefined;

		let async = (typeof arguments['1'] === 'boolean') ?
		arguments['1']: arguments['2'] || true;

		// Prevent to load script twice
		// Only based on id
		if (document.getElementById(dotpath) !== null) {
			return Promise.resolve();
		}

		return new Promise((resolve, reject) => {

			let oScript = document.createElement('script');
			oScript.id = dotpath;
			let scriptPath = dotpath.replace('.', '/');

			oScript.type = 'text/javascript';
			oScript.src = '/js/' + scriptPath + '.js';
			oScript.async = async;
			oScript.onerror = reject;
			oScript.onload = function onScriptLoad() {

				if (typeof fn === 'function') {
					let length = Object.keys(arguments).length;
					arguments[length] = resolve;
					fn.apply(fn, arguments);
				} else {
					resolve.apply(resolve, arguments);
				}
			};

			document.body.appendChild(oScript);

		});
	}

	/**
	 * Register a namespace to specified or window
	 *
	 * Name with dot notation for nested namespace
	 * 
	 * @param  {string} name   [Namespace dot notation]
	 */
	function registerNameSpace(name) {

		let rootObject = window;
		let nsparts = name.split('.');

		nsparts.forEach(currentPart => {

			rootObject = rootObject[currentPart] = rootObject[currentPart] || {};

		});
	}

	/**
	 * Bind events to a middleware
	 *
	 * handlers example:
	 * let handler = {
	 * 		on: function(){}
	 * 		once: function(){}
	 * }
	 * @param  {object} middleware [middleware having on, once, etc.]
	 * @param  {object} handlers   [containing event function to be called by middleware]
	 */
	function subscribe(middleware, handlers) {

		Object.keys(handlers).forEach(evtName => {

			Object.keys(handlers[evtName]).forEach(fnName => {

				let handler = handlers[evtName][fnName];
				middleware[fnName](evtName, handler);

			});
		});

	}

	return Object.assign(self, {
		loadScript: loadScript,
		registerNameSpace: registerNameSpace,
		subscribe: subscribe
	});
})();