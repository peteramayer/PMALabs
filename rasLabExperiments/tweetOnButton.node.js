var util = require('util'),
	Gpio = require('onoff').Gpio,
	twitter_lib = require('twitter'),
	config = require('./config.js');

function RasLab () {

	var twitter,
		pinNumMap = { main: 18 },
		button;
		lastPin = null,
		loopExec = [];

	function init () {
		twitter = new twitter_lib( config.twitterConfig );
		process.on( 'SIGINT', onExitCommand );
		init_GPIO();
	}

	function onExitCommand (err) {
		console.log( "\nExit Command Recieved, err: " + err );
		button.unexport();
		console.log( "\nGPIO unexported. Exiting to Bash." );
		process.exit();
	}

	function onLoopExec (argument) {
		if ( loopExec.length > 0 ) {
			for (var i = loopExec.length - 1; i >= 0; i--) {
				loopExec[i]();
			};
		}
	}

	function init_GPIO () {
		button = new Gpio(pinNumMap.main, 'in', 'both');
		button.watch( readPin_GPIO );
		console.log( "Watching pin "+ pinNumMap.main );
		console.log( button );
	}

	function onready_GPIO (err) { 
		loopExec.push( readPin_GPIO );
	}

	function readPin_GPIO (err, pinstate) {
		if (err) onExitCommand(err);
		console.log( "Read pinstate: "+ pinstate );
    	if ( lastPin !== pinstate ) {
    		console.log( "Pinstate Changed: "+ pinstate );
    		lastPin = pinstate;
        	if ( pinstate == 1 ) {
	        	console.log( "Tweet it!: " + pinstate );
        		tweet();
        	}
    	}
	}

	function tweet () {
		twitter.updateStatus( 'This is a tweet sent from NodeJS ' + process.version + " on a GPIO button wired to RasLab #raslabexperiment " + (new Date()), tweetCallback );
	}

	function tweetCallback (data) {
		console.log( "Tweeted! " );
		console.log( data );
	}

	init();
}


var RL = new RasLab();

