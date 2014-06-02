function RenderPic (argument) {

	var fs = require('fs'),
		path = require('path'),

		NodeCanvas = require('canvas'),
		Image = NodeCanvas.Image,
		Font = NodeCanvas.Font,

		pubsub = require('./pubsub.js'),
		topics = require('./topics.js'),

		settings = { w:960, h:360 },
		canvas = new NodeCanvas( settings.w, settings.h );

		signatureConfigs = [
			{ imgx: -10, imgy: -200, txtx: 120, txty: 150 }
			, { imgx: -210, imgy: -150, txtx: 195, txty: 295 }
			, { imgx: -420, imgy: -210, txtx: 220, txty: 320 }
			, { imgx: -400, imgy: -190, txtx: 695, txty: 300 }
			, { imgx: -390, imgy: -160, txtx: 30, txty: 300 }
		];

	var decIMG = null, ctx = null, sigFont = null;
	
	function getsignaturefont () {
		var _path = path.join(__dirname + '/../static/fonts/DawningofaNewDay.ttf');
		sigFont = new Font( "DawningofaNewDay", _path );
	}

	function getbackground () {
		var _path = path.join(__dirname + '/../static/img/declaration-wide.png');
		fs.readFile(_path, function(err, decIMGSrc){
			if (err) throw err;
			decIMG = new Image;
			decIMG.src = decIMGSrc;
		});
	}

	function getcanvas () {
		ctx = canvas.getContext('2d');
	}

	function render ( topic, data ) {
		if ( decIMG !== null && ctx !== null && sigFont !== null ) {
			console.log( "Rendering image" );
			ctx.addFont(sigFont);
			ctx.clearRect( 0, 0, settings.w, settings.h);

			var _cfg = signatureConfigs[ Math.floor( signatureConfigs.length * Math.random() ) ];

			ctx.drawImage( decIMG, _cfg.imgx, _cfg.imgy );
			ctx.font = '35px "DawningofaNewDay"';
			ctx.fillStyle = 'rgba(50,0,0,0.9)';
			ctx.fillText( "@"+data.replyto, _cfg.txtx, _cfg.txty );

			var _picpath = path.join(__dirname + '/../savedimages/' + data.replyto.match(/[a-zA-Z0-9_]+/gi) + '-' + data.id + '.jpg');

			out = fs.createWriteStream(_picpath),
			stream = canvas.jpegStream();

			var ondone = function () {
				pubsub.publish( topics.TWT_RENDEREDPIC, { picpath: _picpath, replyto: data.replyto, id: data.id } );
			}

			stream.on('data', function(chunk){
				out.write(chunk);
			});
			stream.on('error', function(err){
				console.log('error saving image: ' + err);
			});
			stream.on('end', function(){
				setTimeout( ondone, 10 );
			});

		}
	}

	function init () {
		pubsub.subscribe( topics.TWT_GOTTWEET, render );
		getsignaturefont();
		getbackground();
		getcanvas();
		console.log("RenderPic inited.");
	}

	RenderPic.prototype.init = init;
}

module.exports = (new RenderPic());