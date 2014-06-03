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

	var w = 960, h = 540, inputName;

	var signatureConfigs = [
		{ imgx: -10, imgy: -200, txtx: 120, txty: 150 }
		, { imgx: -210, imgy: -150, txtx: 195, txty: 295 }
		, { imgx: -420, imgy: -210, txtx: 220, txty: 320 }
		, { imgx: -400, imgy: -190, txtx: 695, txty: 300 }
		, { imgx: -390, imgy: -160, txtx: 30, txty: 300 }
	];

	var decIMG = new Image();
		decIMG.src = '/static/img/declaration-wide.png';
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

		var _cfg = signatureConfigs[ signatureConfigs.length-1 ];
		ctx.drawImage( decIMG, _cfg.imgx, _cfg.imgy );
		//ctx.globalCompositeOperation = 'multiply';
		ctx.font = '34px "Dawning of a new Day"';
		ctx.fillStyle = 'rgba(100,0,0,0.9)';
		ctx.fillText( inputName.value, _cfg.txtx, _cfg.txty );
		//ctx.globalCompositeOperation = 'none';

		TweenMax.ticker.addEventListener('tick', ontick);
	}

	$(Init);
})(window);

