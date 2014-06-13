/*******************************************
 *	SIGN IT CLASS -- CANVAS TEXT OVER IMG
 ******************************************/

//RAF Pollyfill
"use strict";if(!Date.now)Date.now=function(){return(new Date).getTime()};(function(){var n=["webkit","moz"];for(var e=0;e<n.length&&!window.requestAnimationFrame;++e){var i=n[e];window.requestAnimationFrame=window[i+"RequestAnimationFrame"];window.cancelAnimationFrame=window[i+"CancelAnimationFrame"]||window[i+"CancelRequestAnimationFrame"]}if(/iP(ad|hone|od).*OS 6/.test(window.navigator.userAgent)||!window.requestAnimationFrame||!window.cancelAnimationFrame){var a=0;window.requestAnimationFrame=function(n){var e=Date.now();var i=Math.max(a+16,e);return setTimeout(function(){n(a=i)},i-e)};window.cancelAnimationFrame=clearTimeout}})();

// PREVENT 'CONSOLE' ERRORS IN BROWSERS THAT LACK A CONSOLE.
(function (window){if(!(window.console&&window.console.log)){var noop=function(){};var methods=["assert","clear","count","debug","dir","dirxml","error","exception","group","groupCollapsed","groupEnd","info","log","markTimeline","profile","profileEnd","markTimeline","table","time","timeEnd","timeStamp","trace","warn"];var length=methods.length;var console=window.console={};while(length--)console[methods[length]]=noop}})(window);

;(function SignIt (window, undefined) {

	var sigs = null, 
		pollingTimer = null, 
		breakpoints = [ 767, 511, 0 ], 
		percentages = [ 33, 50, 100 ],
		lastbreakpoint = 0,
		seedID = '';

	function Init () {
		addClickHandlers();
		polling();
		setupTileFlow();
		resizeHandler();
		initTileFlow();
	}

	function polling () {
		pollingTimer = setTimeout(function () {
			lookForMore( polling );
		}, 5000 );
	}

	function generateSeed (num) {
		var text = "";
	    var possible = "0123456789";
	    //var possible = "abcdefghijklmnopqrstuvwxyz";

	    for( var i=0; i < num; i++ )
	        text += possible.charAt(Math.floor(Math.random() * possible.length));

	    return text;
	}

	function resizeHandler () {
		var _bp = lastbreakpoint;
		for (var i = 0, len = breakpoints.length; i < len; i++) {
			if ( breakpoints[i] < $(window).width() ) {
				lastbreakpoint = i;
				break;
			}
		}
		if ( lastbreakpoint !== _bp ) {
			initTileFlow();
		}
	}

	function addClickHandlers () {
		$(window).on( 'resize', resizeHandler);

		$('body').on('click', 'a#mainsignit', function (e) {
			e.preventDefault();
			shareIt( inputName.value );
		});
		$('body').on('click', 'a.twittershare', function (e) {
			e.preventDefault();
			var currNum = $('#sigcount').text();
			var seed = 'sig'+currNum+'_'+generateSeed(3);
			var _url = this.href + '?' + 'url='+ encodeURI( $(this).attr('data-url') ) + '&' + 'text=' + encodeURIComponent( $(this).attr('data-text') + ' #'+seed );

			$(this).attr('data-seed', seed);

			var windowObj = window.open( 
				_url, 
				'twitterwindow', 
				'menubar=no,location=no,resizable=no,scrollbars=yes,status=no,width=500,height=400,top=50%,left=50%'
			);

			checkTwitterPopup( windowObj );
		});
		$('body').on('click', 'a.popup', function (e) {
			e.preventDefault();
			var windowObj = window.open( 
				this.href, 
				'_blank', 
				'menubar=no,location=no,resizable=no,scrollbars=yes,status=no,width=500,height=400,top=50%,left=50%'
			);
		});
	}

	function checkTwitterPopup (windowObj) {
		var _href = true;
		try {
			_href = !!windowObj.location.href;
		} catch (e) {
			_href = true;
		}
		if ( !!_href ) {
			setTimeout( function () { checkTwitterPopup(windowObj) }, 10 );
		} else {
			handleTweetSent();
		}
	}

	function handleTweetSent () {
		var shareBTN = $('a.twittershare');
		shareBTN.css({ 'visibility': 'hidden' });
		seedID = shareBTN.attr('data-seed');
	}

	function setupTileFlow () {
		sigs = $("#signatures li");
		$("#signatures").css('display','none');
		$('body').addClass('appready');	
		var xr = Math.floor(Math.random()*3) * parseFloat( sigs.css('width'), 10 );
		sigs.each(function (i,ele) {
			TweenMax.set( ele, { position:'absolute', top: (-500-(i*100))+'px', left: xr+'%' } );
			xr = Math.floor(Math.random()*3) * parseFloat( sigs.css('width'), 10 );
		});
		$("#signatures").css('display','block');
	}

	function initTileFlow () {
		var sigarr = sigs.not('[data-place]').get();
		sigs.filter('[data-place]').each( function (i, ele) {
			var place = parseInt( $(ele).attr('data-place'), 10 );
			if ( place < sigarr.length ) {
				sigarr.splice( place, 0, ele );
			} else {
				sigarr.push(ele);
			}
		});
		reflowTiles( sigarr );
	}

	function reflowTiles ( tileArray ) {
		$("#signatures").css('display','none');
		var percWidth = percentages[lastbreakpoint];//parseFloat( sigs.css('width'), 10 );
		var height = $("#signatures li").height();
		var limit = Math.floor(100/percWidth);

		console.log( 'percWidth ', percWidth );

		$("#signatures").css('display','block');

		var rowcount = -1;
		var colindex = 0;
		for (var i = 0, len = tileArray.length; i < len; i++) {
			colindex = i % limit;
			if ( colindex === 0 ) {
				rowcount++;
			}
			TweenMax.set( tileArray[i], { left: (percWidth*colindex)+'%', top: height*rowcount } );
			//console.log( tileArray[i], (percWidth*rowcount)+'%', height*rowcount );
		};
		$("#signatures").css( { height: Math.ceil((height * tileArray.length) / limit) } );
		$("#sigcount").text( tileArray.length );
	}

	function lookForMore ( callback ) {
		if ( !!pollingTimer ) {
			clearTimeout( pollingTimer );
			pollingTimer = null;
		}
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
						if ( !!seedID && !!data[i].trackid && data[i].trackid === seedID ) {
							handleFoundSeedID( data[i], seedID );
						}
						var _sig = [
							'<li id="time'+data[i].time+'" data-seedid="'+data[i].trackid+'">',
						   	'<a href="'+data[i].tweetback+'" target="_blank">'+data[i].name+'</a>',
						   	'</li>'
						];
						newsigs.push( _sig.join(' ') );
					};
					$("#signatures ul").prepend( newsigs.join(' ') );
					
					sigs = $("#signatures li");
					initTileFlow();
				}
				callback();
			},
			error: function (err) {
				console.log(err);
				setTimeout( polling, 20000 );
			}
		});
	}

	function handleFoundSeedID ( data, seedID ) {
		console.log('handleFoundSeedID', data);
		seedID = '';

		$('#userimage .imgbox').html('<img src="/static/savedsignatures/'+data.name.replace(/[^a-zA-Z0-9_]*/,'')+'.jpg" alt="" />');
		var shareURLParam = 'http://'+location.host+'/signed/'+data.name.replace(/[^a-zA-Z0-9_]*/,'');
		$("#facebookaftershare").attr('href', $("#facebookaftershare").attr('data-url')+encodeURIComponent(shareURLParam) );
		$("#twitteraftershare").attr('href', $("#twitteraftershare").attr('data-url')+encodeURIComponent(shareURLParam) );
		
		$('.openingcopy').addClass('showthankyou');
		$('#userimage').animate( { height: 350 }, 300 );
		location.hash = '#thankyoumessage';
	}

	function shareIt ( yourname ) {
		console.log("ShareIt: " + yourname);
		var _d = new Date();
		var _did = ''+_d.getFullYear()+('0'+(_d.getMonth()+1)).slice(-2)+('0'+_d.getDay()).slice(-2);
		$("#output").html('<img src="'+'/renderedimage/'+ yourname+'/'+_did+'" alt="" />');
	}

	$(Init);
})(window);

