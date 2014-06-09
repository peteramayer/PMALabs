/*******************************************
 *	SIGN IT CLASS -- CANVAS TEXT OVER IMG
 ******************************************/
;(function SignIt (window, undefined) {

	function Init () {
		inputName = document.getElementById('yourname');
		$('body').on('click', 'a#mainsignit', function (e) {
			e.preventDefault();
			shareIt( inputName.value );
		});
		polling();
	}

	function polling () {
		setTimeout(function () {
			lookForMore( polling );
		}, 5000 );
	}

	function lookForMore ( callback ) {
		var latesttime = 0;
		$("#signatures li").each( function (i,ele) {
			var _t = parseInt( ele.id.replace(/[^0-9]/gi,''), 10 );
			if ( _t > latesttime ) {
				latesttime = _t;
			}
		});
		$.ajax({
			url: '/updatedsignatures/'+latesttime,
			success: function (data) {
				if ( data.length > 0 ) {
					var newsigs = [];
					for (var i = data.length - 1; i >= 0; i--) {
						var _sig = [
							'<li id="time'+data[i].time+'">',
						   	'<a href="'+data[i].tweetback+'" target="_blank">'+data[i].name+'</a>',
						   	'</li>'
						];
						newsigs.push( _sig.join(' ') );
					};
					$("#signatures ul").prepend( newsigs.join(' ') );
				}
				callback();
			},
			error: function (err) {
				console.log(err);
			}
		});
	}

	function shareIt ( yourname ) {
		console.log("ShareIt: " + yourname);
		var _d = new Date();
		var _did = ''+_d.getFullYear()+('0'+(_d.getMonth()+1)).slice(-2)+('0'+_d.getDay()).slice(-2);
		$("#output").html('<img src="'+'/renderedimage/'+ yourname+'/'+_did+'" alt="" />');
	}

	$(Init);
})(window);

