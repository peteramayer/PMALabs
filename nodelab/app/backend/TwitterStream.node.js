function TwitterStreamer () {

	var twitter_lib = require('twitter'),
		request = require('request'),
		fs = require('fs'),
		pubsub = require('./pubsub.js'),
		topics = require('./topics.js'),
		tuwm = require('./tuwm.node.js'),
		config = require('./config.js');

	var twitter, twitterWithMedia;

	var targetHandle = 'keegangbrown', 
		targetHashTag = 'sillyme',
		messageBank = [
			'Thanks for rocking!',
			"You're neato!",
			'Supercool!'
		];

	function init () {
		twitter = new twitter_lib( config.twitter );
		twitterWithMedia = new tuwm( config.twitter );
		openTwitterStream();
		console.log("TwitterStreamer inited.");
	}

	function openTwitterStream () {
		twitter.stream('user', function( streamHandle ) {
		    streamHandle.on('data', onDataFromTwitter );
		   	streamHandle.on('error', onErrorFromTwitter );
		});
	}

	function onDataFromTwitter (data) {
		if ( !!data.entities && !!data.entities.hashtags ) {
    		console.log( "Twitter Data: " + data.user.screen_name + " -- #: ", data.entities.hashtags);
			if ( ( hasHashTag( targetHashTag, data.entities.hashtags ) ) ) {
				//Remove "true" before QA
				if ( true || ( !!data.user.screen_name && data.user.screen_name !== targetHandle ) ) {
					takeAction(data);
				} else {
					console.log( "Incoming tweet is malformed. Not responding." );
				}
			}
		} else {
			console.log( "Twitter Data. No Tweet." );
		}
    }

	function onErrorFromTwitter (err) {
    	console.log( "Stream error! "+err );
   	}

   	function replyWithPic (topic, data) {
   		console.log('replyWithPic: ');
   		console.log(data);
		twitterWithMedia.post( { 
			status: "@"+data.replyto+" "+messageBank[ (Math.floor(messageBank.length*Math.random())) ],
			in_reply_to_status_id: data.id
		}, data.picpath, successfullTweetback );
   	}

   	function successfullTweetback (err, resp) {
   		console.log("successfullTweetback: " + err);
   	}

	function hasHashTag ( needle, hashtagStack ) {
		for ( var i = 0; i < hashtagStack.length; i++ ) {
			if ( hashtagStack[i].text == needle ) {
				return hashtagStack[i].text;
			}
		} 
		return false;
	}	   	

   	function takeAction ( data ) {
   		console.log('Tweet Correct! Publish message.');
   		pubsub.subscribe( topics.TWT_RENDEREDPIC, replyWithPic )
   		pubsub.publish( topics.TWT_GOTTWEET, { replyto: data.user.screen_name, id: data.id } );
   	}

   	TwitterStreamer.prototype.init = init;
}

module.exports = (new TwitterStreamer());

