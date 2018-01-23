/* ***** JSHINT OPTIONS ***** */
/*global Chat*/
/******************************/

Chat.MessageBoard = (function MessageBoard(doc) {

	'use strict';

	let _element;

	let module = {
		set element(el) {
			_element = el;
		},
		get element() {
			return _element;
		}
	};

	module.add = function addMessage(msg) {
		let li = doc.createElement('li');
		li.innerHTML = msg;
		_element.appendChild(li);
		_element.scrollTop = _element.scrollHeight;
	};

	/**
	 * Freeze object to avoid conflict
	 * with getter and setter.
	 */
	return Object.freeze(module);

})(document);