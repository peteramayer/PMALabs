var util = require('util'),
	twitter_lib = require('twitter'),
	tuwm = require('./twitterUpdateWithMedia.js'),
	request = require('request'),
	RaspiCam = require('raspicam'),
	fs = require('fs'),
	config = require('./config.js');

function RasLab () {

	var twitter, twitterWithMedia, camera,
		panServo = 0, tiltServo = 1, limits = { hi_x: 250, lo_x: 50, hi_y: 220, lo_y: 80 };

	var targetHashTag = 'pmahappy',
		messageBank = [
			'Enjoy yo self!',
			'Looks like fun.',
			'I like your hair.',
			'PMA Parties look like fun!',
			'Down the hatch!'
		],
		ifxbank = 'negative,solarise,sketch,denoise,emboss,oilpaint,hatch,gpen,pastel,watercolour,film,blur,saturation,colourswap,washedout,posterise,colourpoint,colourbalance,cartoon,';

	function init () {
		camera = new RaspiCam( { 
			mode: 'photo', 
			output: 'default.png', 
			encoding: 'png', 
			width: 640, 
			height: 360, 
			vflip: true /* , hflip: true */ 
		} );
		twitter = new twitter_lib( config.twitterConfig );
		twitterWithMedia = new tuwm( config.twumConfig );
		openTwitterStream();
	}

	function onExitCommand (err) {
		console.log( "\nExit Command Recieved, err: " + err );
		process.exit();
	}

	function openTwitterStream () {
		twitter.stream('user', function( streamHandle ) {
		    streamHandle.on('data', onDataFromTwitter );
		   	streamHandle.on('error', onErrorFromTwitter );
		});
	}

	function onDataFromTwitter (data) {
    	console.log( "Got Data from Twitter! " );
		if ( !!data.entities && !!data.entities.hashtags ) {
			console.log("Hashtags: ", data.entities.hashtags);
		}
		if ( (!!data.entities && !!data.entities.hashtags && hasHashTag( targetHashTag, data.entities.hashtags ) ) ) {
			if ( !!data.in_reply_to_screen_name 
				&& data.in_reply_to_screen_name == "RasLabPMA" 
				&& !!data.user 
				&& !!data.user.screen_name 
				&& data.user.screen_name !== "RasLabPMA" ) 
			{
				moveServos( tiltServo, 170 );
				takePicture( data );
			} else {
				console.log( "Incoming tweet is malformed. Not responding." );
			}
		}
    }

	function onErrorFromTwitter (err) {
    	console.log( "Stream error! "+err );
   	}

	function takePicture ( data ) {
		console.log( "Taking Picture!: " );		
		var picdate = (Date.now());
		var picpath = "./pics/"+data.user.screen_name+"-"+picdate+".png";
		var camercallback = f
		moveServos( tiltServo, 115 );
		if ( hasHasEffectHashtag( ifxbank, data.entities.hashtags ) ) {
			camera.set('ifx', hasHasEffectHashtag( ifxbank, data.entities.hashtags ) );
		} else {
			camera.set('ifx', 'none' );
		}
		camera.set("output", picpath );
		camera.on("read", onCameraSavesPicture );
		camera.start();
	}
	function onCameraSavesPicture (err, filename){ 
		console.log( "Camera Read event" + err + " filename: " + filename );
		camera.stop();
	    tweetWithMedia(data, filename);
	}

	function tweetWithMedia (data, picpath) {
		console.log( "Tweeting... " );
		moveServos( tiltServo, 170 );
		twitterWithMedia.post( { 
			status: "@"+data.user.screen_name+" "+messageBank[ (Math.floor(messageBank.length*Math.random())) ]+" #"+targetHashTag,
			in_reply_to_status_id: data.id
		}, picpath, tweetCallback );
	}

	function hasHashTag ( needle, hashtagStack ) {
		for ( var i = 0; i < hashtagStack.length; i++ ) {
			if ( hashtagStack[i].text == needle ) {
				return hashtagStack[i].text;
			}
		} 
		return false;
	}	

	function hasHasEffectHashtag ( needle, hashtagStack ) {
		for ( var i = 0; i < hashtagStack.length; i++ ) {
			if ( needle.match( hashtagStack[i].text + ',' ) ) {
				return true;
			}
		} 
		return false;
	}

	function moveServos( servo, angle ) {
		console.log( "moveServos... " );
		var valid = false;
		if ( servo === panServo ) {
			valid = true;
			if ( angle > limits.hi_x ) angle = limits.hi_x;
			if ( angle < limits.lo_x ) angle = limits.lo_x;
		}
		if ( servo === tiltServo ) {
			valid = true
			if ( angle > limits.hi_y ) angle = limits.hi_y;
			if ( angle < limits.lo_y ) angle = limits.lo_y;
		}
		if ( valid ) {
			console.log( servo + '=' + angle + '\n' );
			var ServoBlaster = fs.createWriteStream('/dev/servoblaster');
			ServoBlaster.end( servo + '=' + angle + '\n' );
		} else {
			console.log( 'Invalid servo movement: '+servo + '=' + angle + '\n' );
		}
	}

	function tweetCallback (data, response) {
		console.log( "Tweeted!" );
	}

	init();
}


var RL = new RasLab();

