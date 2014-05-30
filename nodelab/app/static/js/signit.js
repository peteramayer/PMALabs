/*******************************************
 *	SIGN IT CLASS -- CANVAS TEXT OVER IMG
 ******************************************/
;(function SignIt (window, undefined) {
	try {
		var SignItCanvas = document.getElementById('signit');
		var ctx = SignItCanvas.getContext('2d');
	} catch (e) {
		return;
	}

	var w = 960, h = 360, inputName;

	var decIMG = new Image();
		decIMG.src = '/static/img/declaration.png';
		decIMG.width = w;
		decIMG.height = h;
		decIMG.onload = function () {
			//ontick();
		}

	function Init () {
		inputName = document.getElementById('yourname');
		$('body').on('click', 'a[href$="#share"]', function (e) {
			shareIt();
		});
		ontick();
	}

	function shareIt () {
		var options = [
			'menubar=no',
			'location=yes',
			'resizable=no',
			'scrollbars=no',
			'status=yes',
			'innerWidth=960',
			'innerHeight=360'
		];
		var shareitURL = SignItCanvas.toDataURL();
		window.open( shareitURL, 'shareit', options.join(',') );
	}
	
	function ontick () {
		ctx.clearRect( 0, 0, w, h);
		//ctx.globalCompositeOperation = 'none';
		ctx.drawImage( decIMG, 0, 0 );
		//ctx.globalCompositeOperation = 'multiply';
		ctx.font = '30px "Ruthie"';
		ctx.fillStyle = 'rgba(100,0,0,0.9)';
		ctx.fillText( inputName.value, 340, 220);
		//ctx.globalCompositeOperation = 'none';

		TweenMax.ticker.addEventListener('tick', ontick);
	}

	$(Init);
})(window);

