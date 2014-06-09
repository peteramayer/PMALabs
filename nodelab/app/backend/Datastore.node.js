function Datastore () {

	var NeDB = require('nedb'),
		path = require('path'),
		pubsub = require('./pubsub.js'),
		topics = require('./topics.js'),
		db = {};
	  
  	db.signatures = new NeDB({ filename: path.join(__dirname + '/../data/signatures'), autoload: true });
	
	function init (argument) {
		console.log("Datastore inited.");
		pubsub.subscribe( topics.TWT_PIC_POSTED, onNewPicPosted );
	}

	function onNewPicPosted (topic, data) {
		if ( !!data.replyto && !!data.id ) {
			addSignature( data.replyto, data.id );
		}	
	}

	function addSignature ( name, tweetback ) {
		if ( !!name && !!tweetback ) {
			if ( (name[0]) !== "@" ) {
				name = "@"+name;
			}
			db.signatures.insert({ name: name, tweetback: "https://twitter.com/status/show/"+tweetback, type: "signature", time: Date.now() }, function (err, newDoc) {
				if (err) throw err;
				console.log("Signature record added: " + name);
				getSignatures();
			});
		}
	}

	function getSignatures ( callback ) {
		db.signatures.find({ type: 'signature' }).sort({time:-1}).exec(function (err, docs) {
			if (err) throw err;
			if ( !!callback ) {
				callback( docs );
			}
		});
	}

	function findNewSignatures ( latesttime, callback ) {
		var _time = parseInt( latesttime.replace(/[^0-9]/gi,''), 10 );
		db.signatures.find({ time: { $gt: _time } }).sort( {time:-1} ).limit(10).exec(function (err, docs) {
			//console.log( _time );
			if (err) throw err;
			callback( err, docs );
		});
	}

	Datastore.prototype.addSignature = addSignature;
	Datastore.prototype.getSignatures = getSignatures;
	Datastore.prototype.findNewSignatures = findNewSignatures;
	Datastore.prototype.init = init;
}

module.exports = (new Datastore());