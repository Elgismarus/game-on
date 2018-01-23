/* ***** JSHINT OPTIONS ***** */
/*global Chat,io,Utils*/
/******************************/

$(function() {

	'use strict';

	let chatSetup = function() {
		// Get message board element
		Chat.MessageBoard.element = document.getElementById('messages');

		let handler = {
			'chat': {
				'on': Chat.MessageBoard.add
			}
		};

		Utils.subscribe(io(), handler);
	};

	Utils.registerNameSpace('Chat');
	Utils.loadScript('Chat.messageboard')
	.then(chatSetup);
});