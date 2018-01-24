/* ***** JSHINT OPTIONS ***** */
/*exported ModLoader*/
/*global Utils*/
/******************************/

/**
 * Helper to load module.
 */

var ModLoader = (function ModLoader(helper, win) {

	'use strict';

	let self = {};

	let _registery = {};

	let _isModuleRegistered = function isModuleRegistered(name){
		return (_registery[name] !== undefined);
	};

	let _onComponentLoading = function onComponentLoading(dotname) {

		let modulename = dotname.split('.')[0];
		_registery[modulename].remaining.push(dotname);
	};

	let _onComponentLoaded = function onComponentLoaded(dotname) {
		let modulename = dotname.split('.')[0];
		let index = _registery[modulename].remaining.indexOf(dotname);
		_registery[modulename].remaining.splice(index, 1);
	};

	let _add = function addModule(name, allLoaded) {

		_registery[name] = {
			remaining: [],
			add: _onComponentLoading,
			remove: function(dotcomponent, next) {
				_onComponentLoaded(dotcomponent);
				let modulename = dotcomponent.split('.')[0];
				/**
				 * Need to resolve component promise
				 * before resolving module promise
				 */
				next();
				if (_registery[modulename].remaining.length === 0) {
					delete _registery[modulename];
					allLoaded(win[modulename]);
				}
			}
		};
	};

	let _getModuleFromRegistery = function getModuleFromRegistery(modulename) {
		return _registery[modulename];
	};

	let _killNoComponent = function killNoComponent(modulename, timeout, done) {

		let killer = setTimeout((end) => {
			end(win[modulename]);
		}, timeout, done);
		if (_registery[modulename].remaining.length > 0) {
			clearTimeout(killer);
		} else {
			delete _registery[modulename];
		}
	};

	/**
	 * Load the loader.js of a folder
	 * @param  {string} name [name of the folder]
	 * @return {promise}
	 * -> Resolve if script loaded correctly
	 * -> Reject any issue with loading the module
	 */
	self.require = function(name, timeout = 200) {

		return new Promise((resolve, reject) => {

			helper.registerNameSpace(name);
			_add(name, resolve);

			helper.loadScript(name + '.loader')
				.then(() => {
					_killNoComponent(name, timeout, resolve);
				}).catch(() => {
					reject(new Error('Failed to load ' + name + ' module. Ensure folder ' + name + ' contains loader.js.'));
				});
		});
	};

	self.register = function(dotcomponent) {

		let modulename = dotcomponent.split('.')[0];

		if(!_isModuleRegistered(modulename)){
			return Promise.reject('Cannot register component before module.loader');
		}
		_getModuleFromRegistery(modulename)
			.add(dotcomponent);
		

		return new Promise((resolve, reject) => {
			helper.loadScript(dotcomponent)
				.then(() => {
					let modulename = dotcomponent.split('.')[0];
					_getModuleFromRegistery(modulename)
						.remove(dotcomponent, resolve);
				}).catch(err => {
					reject(err);
				});
		});
	};

	return self;

})(Utils, window);