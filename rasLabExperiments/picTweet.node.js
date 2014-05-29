var util = require('util'),
	twitter_lib = require('twitter'),
	tuwm = require('./twitterUpdateWithMedia.js'),
	request = require('request'),
	RaspiCam = require("raspicam"),
	config = require('./config.js');

function RasLab () {

	var twitter, twitterWithMedia, camera;

	function init () {
		twitter = new twitter_lib( config.twitterConfig );
		twitterWithMedia = new tuwm( config.twumConfig );
		getTweets();
		//tweetResponse( { user: { screen_name: 'keegangbrown' }, in_reply_to_screen_name: 'RasLabPMA', entities: { hashtags: [ {text:'takeapic'} ] } });
	}

	function onExitCommand (err) {
		console.log( "\nExit Command Recieved, err: " + err );
		process.exit();
	}

	function getTweets () {
		twitter.stream('user', function(stream) {
		    stream.on('data', function(data) {
		    	console.log( "Got Stream! " );
		        //console.log( data );
		        tweetResponse(data);
		    });
		});
	}

	function tweetResponse (data) {
		console.log("hashtag?");
		if ( !!data.entities && !!data.entities.hashtags ) {
			console.log(data.entities.hashtags);
		}
		if ( (!!data.entities && !!data.entities.hashtags && hasHashTag( 'takeapic', data.entities.hashtags ) ) ) {
			if ( !!data.in_reply_to_screen_name && data.in_reply_to_screen_name == "RasLabPMA" ) {
				takePicture(data);
			} 
		}
	}

	function takePicture (data) {
		console.log( "Taking Picture!: " );		
		var picdate = (Date.now());
		var picpath = "./pics/"+data.user.screen_name+"-"+picdate+".jpg";
		var camercallback = function(err, filename){ 
			console.log("camercallback!");
			camera.stop();
		    tweetWithMedia(data, picpath);
		}
		camera = new RaspiCam({ mode: 'photo', output: picpath });
		camera.on("exit", camercallback);
		camera.start();
	}

	function tweetWithMedia (data, picpath) {
		console.log( "Tweeting!: " );
		twitterWithMedia.post( {status: "@"+data.user.screen_name+" hows this? #takeapic "+(new Date()) }, picpath, tweetCallback );
	}

	function hasHashTag ( needle, hashtagStack ) {
		for ( var i = 0; i < hashtagStack.length; i++ ) {
			if ( hashtagStack[i].text == needle ) {
				return true;
			}
		} 
		return false;
	}

	function tweetCallback (data, response) {
		console.log( "Tweeted! " );
		console.log( data );
		console.log( response.body );
	}

	init();
}


var RL = new RasLab();

