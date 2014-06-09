function RenderPic (argument) {

	var fs = require('fs'),
		path = require('path'),

		NodeCanvas = require('canvas'),
		Image = NodeCanvas.Image,
		Font = NodeCanvas.Font,

		pubsub = require('./pubsub.js'),
		topics = require('./topics.js'),

		imageSaveRoot = '/../data/savedimages/',

		settings = { w:600, h:340 },
		canvas = new NodeCanvas( settings.w, settings.h );

		signatureConfigs = [
			{ imgx: 0, imgy: 0, txtx: 175, txty: 210 }
			/*
			, { imgx: -210, imgy: -150, txtx: 195, txty: 295 }
			, { imgx: -420, imgy: -210, txtx: 220, txty: 320 }
			, { imgx: -400, imgy: -190, txtx: 695, txty: 300 }
			, { imgx: -390, imgy: -160, txtx: 30, txty: 300 }
			*/
		];

	var decIMG = null, logoIMG = null, ctx = null, sigFont = null;
	
	function loadsignaturefont () {
		var _path = path.join(__dirname + '/../static/fonts/Montserrat-Regular.ttf');
		sigFont = new Font( "Montserrat-Regular", _path );
	}

	function loadimages () {
		var _path = path.join(__dirname + '/../static/img/declaration-zoom.png');
		fs.readFile(_path, function(err, decIMGSrc){
			if (err) throw err;
			decIMG = new Image;
			decIMG.src = decIMGSrc;
		});
		var _logopath = path.join(__dirname + '/../static/img/reply-tweet-logo.png');
		fs.readFile(_logopath, function(err, logoIMGSrc){
			if (err) throw err;
			logoIMG = new Image;
			logoIMG.src = logoIMGSrc;
		});
	}

	function getcanvas () {
		ctx = canvas.getContext('2d');
	}

	function renderImage ( data_replyto, data_id, _picpath, callback ) {
		if ( decIMG !== null && logoIMG !== null && ctx !== null && sigFont !== null ) {
			var _cfg = signatureConfigs[ Math.floor( signatureConfigs.length * Math.random() ) ];
			
			fs.exists(_picpath, function (exists) {
				if ( exists ) { 
					console.log( "Using cached image" );
					callback();
					return; 
				}

				console.log( "Rendering image" );
				ctx.addFont(sigFont);
				ctx.clearRect( 0, 0, settings.w, settings.h);
				ctx.save();

				ctx.drawImage( decIMG, _cfg.imgx, _cfg.imgy );
				ctx.drawImage( logoIMG, 40, 0 );

				ctx.font = '35px "Montserrat-Regular"';
				ctx.fillStyle = 'rgba(50,0,0,0.9)';
				ctx.translate( _cfg.txtx, _cfg.txty );
				ctx.rotate( Math.round((Math.random()*6)-4)*(Math.PI / 180) );
				ctx.fillText( data_replyto, 0, 0);
				ctx.restore();

				var out = fs.createWriteStream(_picpath);
				var stream = canvas.jpegStream();

				stream.on('data', function(chunk) {
					out.write(chunk);
				});
				stream.on('error', function(err) {
					console.log('error saving image: ' + err);
				});
				stream.on('end', function(err, result) {
					var _callback = function () {
						callback();
					}
					out.end( _callback );
				});
			});
		}
	}

	function onGotTweet ( topic, data ) {
		var postflag = false;
		var _replyto = "@"+(data.replyto).match(/[a-zA-Z0-9_]+/gi);
		var _id = (""+data.id).match(/[a-zA-Z0-9_]+/gi);

		var _d = new Date();
		var _did = ''+_d.getFullYear()+('0'+(_d.getMonth()+1)).slice(-2)+('0'+_d.getDay()).slice(-2);

		var _picpath = path.join(__dirname + imageSaveRoot + _replyto.match(/[a-zA-Z0-9_]+/gi) + '.jpg');

		var onRenderedCallback = function () {
			if ( !postflag ) {
				pubsub.publish( topics.TWT_RENDEREDPIC, { picpath: _picpath, replyto: data.replyto, id: data.id } );
				postflag = true;
			}
			console.log("Tweeting... " + data.replyto + " - " + data.id );
		}
		
		renderImage( _replyto, data.id, _picpath, onRenderedCallback );
	}

	function requestImage ( topic, data ) {
		var postflag = false;
		var _replyto = "@"+(data.replyto).replace(/[^a-zA-Z0-9_\s]/gi, '').substr(0,18);
		var _id = (""+data.id).match(/[a-zA-Z0-9_]+/gi);
		var _picpath = path.join(__dirname + imageSaveRoot + _replyto.replace(/\@/gi, '').replace(/\s/gi, '-') + '.jpg');
		
		console.log( _picpath );
		var onRenderedCallback = function () {
			if ( !postflag ) {
				data.callback( _picpath );
				postflag = true;
			}
			console.log("sending file... " + _replyto + " - " + _id );
		}
		
		renderImage( _replyto, _id, _picpath, onRenderedCallback );
	}



	function init () {
		pubsub.subscribe( topics.TWT_GOTTWEET, onGotTweet );
		pubsub.subscribe( topics.IMG_REQUEST_RENDER, requestImage );
		loadsignaturefont();
		loadimages();
		getcanvas();
		console.log("RenderPic inited.");
	}

	RenderPic.prototype.init = init;
}

module.exports = (new RenderPic());