function TwitterStreamer () {

	var twitter_lib = require('twitter'),
		request = require('request'),
		fs = require('fs'),
		pubsub = require('./pubsub.js'),
		topics = require('./topics.js'),
		tuwm = require('./tuwm.node.js'),
		config = require('./config.js'),
		Datastore = require('../backend/Datastore.node.js');

	var twitter, twitterWithMedia;

	var targetHandle = 'SignIt2014', //'peteramayer',
		devmodeonly = false, //Must be false in production
		targetIncomingHashTag = 'ADevHasht', //'SignIt2014',
		targetOutgoingHashTag = 'Just2ADev', //'YouSignedIt2014',
		publicURL = "http://signit2014.com/", // 'http://signit2014.com/',
		trackerURL = "http://signit2014.com/", // 'http://bit.ly/xxxx',
		signitMessage = 'Yes, I want to sign the Declaration of Independence, #%%HASHTAG%%, @%%HANDLE%%.',
		replyMessage = '@%%HANDLE%% just signed the Declaration #%%HASHTAG%%. Share it with the world: %%URL%%';

	function init () {
		twitter = new twitter_lib( config.twitter );
		twitterWithMedia = new tuwm( config.twitter );
		openTwitterStream();
   		pubsub.subscribe( topics.TWT_RENDEREDPIC, replyWithPic )		
		console.log("TwitterStreamer inited.");
	}

	function getTweetMessage (handle, hashtag, url, message) {
		var output = message.replace('%%HASHTAG%%', hashtag);
		output = output.replace('%%URL%%', url)
		return output.replace('%%HANDLE%%', handle);
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
					console.log( "Incoming tweet is from this account. Doing nothing." );
				}
			} else if ( data.user.screen_name === targetHandle && ( hasHashTag( targetOutgoingHashTag, data.entities.hashtags ) ) ) {
				console.log( "Outgoing Hashtag used: " + data.in_reply_to_screen_name );
			}
		} else if ( !!data.delete ) {
			console.log( "Twitter Data -- delete request.", data.delete.status );
			pubsub.publish( topics.TWT_DELETE, { id_str:  data.delete.status.id_str } )
		} else {
			console.log( "Twitter Data -- No applicable data." );
		}
    }

	function onErrorFromTwitter (err) {
    	console.log( "Stream error! "+err );
   	}

   	function parseTrackerID (hashtags) {
   		var output = '';
   		if ( hashtags.length > 1 ) {
	   		for (var i = hashtags.length - 1; i >= 0; i--) {
	   			if ( !!hashtags[i].text.match(/^sig[a-zA-Z0-9_]+/) ) {
	   				output = hashtags[i].text.match(/^sig[a-zA-Z0-9_]+/)[0];
	   			}
	   		}
   		}
   		return output;
   	}

   	function replyWithPic (topic, data) {
   		console.log('replyWithPic');
   		//var _replyto = data.replyto;
   		//var _replyto_id = data.id_str;

		twitterWithMedia.post( { 
			//status: "@"+data.replyto+" "+messageBank[ (Math.floor(messageBank.length*Math.random())) ]+' #'+targetOutgoingHashTag,
			status: getTweetMessage( data.replyto, targetIncomingHashTag, publicURL, replyMessage ),
			in_reply_to_status_id: data.id
		}, data.picpath, function (err, resp) {
			successfullTweetback( err, resp, data )
		});
   	}

   	function successfullTweetback ( err, resp, incomingdata ) {
   		if (!!err) throw err;
   		var data = JSON.parse( resp.body );
   		console.log('successfullTweetback: ', incomingdata );
   		if ( !!data.in_reply_to_screen_name && !!data.id_str ) {
   			pubsub.publish( topics.TWT_PIC_POSTED, { replyto: data.in_reply_to_screen_name, id: data.id_str, trackid: incomingdata.trackid } );
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
   		console.log('Tweet Correct! Check duplicate.');
   		//Datastore.getOneSignature( data.user.screen_name, function (onesig) {
   			//console.log('New signature: ' + !onesig);
   			//if ( !onesig ) {
		   		pubsub.publish( topics.TWT_GOTTWEET, { 
		   			replyto: data.user.screen_name, 
		   			id: data.id_str, 
		   			trackid: parseTrackerID( data.entities.hashtags )
		   		});
	   		//}
   		//});
   	}

   	function getSignItMessage () {
   		return getTweetMessage( targetHandle, targetIncomingHashTag, publicURL, signitMessage );
   	}

   	TwitterStreamer.prototype.targetHandle = targetHandle;
   	TwitterStreamer.prototype.trackerURL = trackerURL;
   	TwitterStreamer.prototype.publicURL = publicURL;
   	TwitterStreamer.prototype.getSignItMessage = getSignItMessage;
   	TwitterStreamer.prototype.init = init;
}

TwitterStreamer.instance = null;
TwitterStreamer.getInstance = function(){
    if(this.instance === null){
        this.instance = new TwitterStreamer();
    }
    return this.instance;
}

module.exports = TwitterStreamer.getInstance();

