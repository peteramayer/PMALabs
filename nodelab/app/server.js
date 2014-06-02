var express = require('express'),
	app = express(),
	pubsub = require('./backend/pubsub.js'),
	topics = require('./backend/topics.js'),
	TwitterStream = require('./backend/TwitterStream.node.js'),
	PictureRenderer = require('./backend/RenderPic.node.js');

app.get('/', function (req, res) {
	res.sendfile('./views/index.html');
});

TwitterStream.init();
PictureRenderer.init();

app.listen(3000);
