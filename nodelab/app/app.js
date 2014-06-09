var express = require('express'),
	app = express(),
	pubsub = require('./backend/pubsub.js'),
	topics = require('./backend/topics.js'),
	Datastore = require('./backend/Datastore.node.js');
	TwitterStream = require('./backend/TwitterStream.node.js'),
	PictureRenderer = require('./backend/RenderPic.node.js'),
	LandingPage = require('./backend/LandingPage.node.js');

process.on('uncaughtException', function (exception) {
   console.log("\n\n ------ Error ------");
   console.log(exception);
   console.log("------ Error ------ \n\n");
});

app.set('view engine', 'ejs');
app.engine('.html', require('ejs').__express);

Datastore.init();
TwitterStream.init();
PictureRenderer.init();
//LandingPage.init( Datastore );

app.get('/', function (req, res) {
	Datastore.getSignatures( function (signatures) {
		res.render('index.html', { signatures: signatures } );
	})
});

app.get('/updatedsignatures/:latesttime', function (req, res) {
	if ( !!req.params && !!req.params.latesttime ) {
		Datastore.findNewSignatures( req.params.latesttime, function (err, data) {
			if ( !!err ) {
				res.send( err );
			} else {
				res.send( data );
			}
		});
	} else {
		res.send( '' );
	}
});

app.get('/renderedimage/:yourname/:picdate', function (req, res) {
	if ( !!req.params && !!req.params.yourname ) {
		console.log( "Get Rendered Image for: " + req.params.yourname.match(/[a-zA-Z0-9_\s]{1,30}/gi) );
		var _d = new Date();
		var _did = ''+_d.getFullYear()+('0'+(_d.getMonth()+1)).slice(-2)+('0'+_d.getDay()).slice(-2);
		if ( !!req.params.picdate && !!req.params.picdate.match(/[0-9]{8}/gi) ) {
			_did = req.params.picdate.match(/[0-9]{8}/gi);
		}
		pubsub.publish( topics.IMG_REQUEST_RENDER, { 
			replyto: req.params.yourname.match(/[a-zA-Z0-9_\s]{1,30}/gi)[0], 
			id: _did, 
			callback: function ( imagepath ) {
				res.sendfile( imagepath );
			}
		});
	} else {
		res.send( 412, { error:'incorrect image params' } );
		console.log( req.params );
	}
});

app.listen(3000);
