function LandingPage () {

	var fs = require('fs'),
		path = require('path'),
		pubsub = require('./pubsub.js'),
		topics = require('./topics.js'),
		Datastore = null;

	function init ( _ds ) {
		Datastore = _ds;
		pubsub.subscribe( topics.TWT_PIC_POSTED, onNewPicPosted );
		console.log("LandingPage inited.");
	}

	function onNewPicPosted (topic, data) {
		Datastore.addSignature( data.replyto, data.id );
	}

	function renderSignatures () {
		return Datastore.getSignatures();
	}


	LandingPage.prototype.init = init;
	LandingPage.prototype.renderSignatures = renderSignatures;
}

module.exports = (new LandingPage());