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
		devmodeonly = true, // false, //Must be false in production
		targetIncomingHashTag = 'JustADevHashtag', //'SignIt2014',
		targetOutgoingHashTag = 'JustAnotherDevHashtag', //'YouSignedIt2014',
		messageBank = [
			'Thanks for rocking!',
			"You're neato!",
			'Supercool!'
		];

	function init () {
		twitter = new twitter_lib( config.twitter );
		twitterWithMedia = new tuwm( config.twitter );
		openTwitterStream();
   		pubsub.subscribe( topics.TWT_RENDEREDPIC, replyWithPic )		
		console.log("TwitterStreamer inited.");
	}

	function openTwitterStream () {
		twitter.stream('user', function( streamHandle ) {
			console.log( "Twitter Stream Connected." );
		    streamHandle.on('data', onDataFromTwitter );
		   	streamHandle.on('error', onErrorFromTwitter );
		});
	}

	function onDataFromTwitter (data) {
		if ( !!data.entities && !!data.entities.hashtags && !!data.entities.hashtags.length ) {
    		console.log( "Twitter Data: " + data.user.screen_name + " -- #: ", data.entities.hashtags);
			if ( ( hasHashTag( targetIncomingHashTag, data.entities.hashtags ) ) ) {
				if ( devmodeonly || ( !!data.user.screen_name && data.user.screen_name !== targetHandle ) ) {
					takeAction(data);
				} else {
					console.log( "Incoming tweet is malformed. Not responding." );
				}
			} else if ( data.user.screen_name === targetHandle && ( hasHashTag( targetOutgoingHashTag, data.entities.hashtags ) ) ) {
				console.log( "Outgoing Hashtag used: " + data.in_reply_to_screen_name );
			}
		} else {
			console.log( "Twitter Data -- No applicable tweet." );
		}
    }

	function onErrorFromTwitter (err) {
    	console.log( "Stream error! "+err );
   	}

   	function replyWithPic (topic, data) {
   		console.log('replyWithPic');
   		var _replyto = data.replyto;
   		var _replyto_id = data.id_str;

		twitterWithMedia.post( { 
			status: "@"+data.replyto+" "+messageBank[ (Math.floor(messageBank.length*Math.random())) ]+' #'+targetOutgoingHashTag,
			in_reply_to_status_id: data.id
		}, data.picpath, successfullTweetback );
   	}

   	function successfullTweetback ( err, resp ) {
   		if (!!err) throw err;
   		var data = JSON.parse( resp.body );
   		console.log('successfullTweetback: ' + data.in_reply_to_screen_name + " -- " + data.id_str );
   		if ( !!data.in_reply_to_screen_name && !!data.id_str ) {
   			pubsub.publish( topics.TWT_PIC_POSTED, { replyto: data.in_reply_to_screen_name, id: data.id_str } );
   		}
   	}

	function hasHashTag ( needle, hashtagStack ) {
		for ( var i = 0; i < hashtagStack.length; i++ ) {
			if ( hashtagStack[i].text.toLowerCase() == needle.toLowerCase() ) {
				return hashtagStack[i].text;
			}
		} 
		return false;
	}	   	

   	function takeAction ( data ) {
   		console.log('Tweet Correct! Publish message.');
   		pubsub.publish( topics.TWT_GOTTWEET, { replyto: data.user.screen_name, id: data.id_str } );
   	}

   	TwitterStreamer.prototype.init = init;
}

module.exports = (new TwitterStreamer());

