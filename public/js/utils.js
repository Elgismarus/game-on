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
	 * @param  {string} dotpath [path in dot annotation]
	 * @return {Promise}
	 * -> onload when resolve
	 * -> onerror when rejected
	 */
	function loadScript(dotpath, async = true) {

		// Prevent to load script twice
		// Only based on id
		if (document.getElementById(dotpath) !== null) {
			return Promise.resolve();
		}

		return new Promise((resolve, reject) => {

			let oScript = document.createElement('script');
			oScript.id = dotpath;

			/**
			 * If name composed of dot
			 * meaning file is in folders
			 */
			let arrNames = dotpath.split('.');
			if (arrNames.length > 1) {
				dotpath = '';
				arrNames.forEach((f, idx, array) => {
					dotpath += f;
					if (idx !== (array.length - 1)) {
						dotpath += '/';
					}
				});
			}

			oScript.type = 'text/javascript';
			oScript.src = '/js/' + dotpath + '.js';
			oScript.async = async;
			oScript.onerror = reject;
			oScript.onload = resolve;

			document.body.appendChild(oScript);

		});
	}

	/**
	 * Short way to load module script.
	 * 
	 * Load a loader.js located in the folder
	 * of the module (module_name provided).
	 *
	 * e.g.: 
	 * Suppose module Chat, the folder structure
	 * should be as follow:
	 *
	 * - Chat (Folder - case sensitive)
	 * -- loader.js
	 * -- Other js files
	 * 
	 * @param  {string} module_name [Name of the module/folder]
	 * @return {promise}
	 * -> resolve if file loaded without any issue.
	 * -> reject if failed loading file for any reason.
	 */
	function loadModule(module_name) {
		return new Promise((resolve, reject) => {
			self.loadScript(module_name + '.loader')
				.then(() => {
					resolve(window[module_name]);
				}).catch(() => {
					reject('Failed to load module ' + module_name + ': Ensure loader.js is in ' + module_name + ' folder.');
				});
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
		loadModule: loadModule,
		registerNameSpace: registerNameSpace,
		subscribe: subscribe
	});
})();