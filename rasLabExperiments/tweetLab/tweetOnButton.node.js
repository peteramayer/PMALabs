var util = require('util'),
	gpio = require("pi-gpio"),
	twitter_lib = require('twitter'),
	config = require('./config.js');

function RasLab () {

	var twitter,
		looper,
		pinNumMap = { main: 18 },
		lastPin,
		loopExec = [];

	function init () {
		twitter = new twitter_lib( config.twitterConfig );

		looper = setInterval(onLoopExec, 30);
		process.on( 'SIGINT', onSIGINT );
		init_GPIO();
	}

	function onSIGINT () {
		console.log( "\nSIGINT (Ctrl-C) Recieved. Shutting off GPIO." );
		gpio.close(pinNumMap.main, function () { 
			// some other closing procedures go here
			console.log( "\nGPIO closed. Exiting to Bash." );
			process.exit();
		});
	}

	function onLoopExec (argument) {
		if ( loopExec.length > 0 ) {
			for (var i = loopExec.length - 1; i >= 0; i--) {
				loopExec[i]();
			};
		}
	}

	function init_GPIO () {
		gpio.open(pinNumMap.main, "input", onready_GPIO);
	}

	function onready_GPIO (err) { 
		console.log("GPIO Ready. Errors: " + err);
		loopExec.push( readPin_GPIO );
	}

	function readPin_GPIO () {
	    gpio.read(pinNumMap.main, function(err, pinstate) {
	    	if ( lastPin !== pinstate ) {
	    		lastPin = pinstate;
	        	console.log( "Pinstate: " + pinstate );
	        	if ( pinstate == 1 ) {
	        		tweet();
	        	}
	    	}
	    });
	}

	function tweet () {
		twitter.updateStatus( 'This is a tweet sent from NodeJS ' + process.version + " on a GPIO button wired to RasLab #raslabexperiment " + (new Date()), tweetCallback );
	}

	function tweetCallback (data) {
		//console.log( util.inspect(data) );
	}

	init();
}


var RL = new RasLab();
