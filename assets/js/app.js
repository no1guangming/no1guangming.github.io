
function GetURLParameter(key) {
	var re=new RegExp('(?:\\?|&)'+key+'=(.*?)(?=&|$)','gi');
	var r=[], m;
	while ((m=re.exec(document.location.search)) != null) r.push(m[1]);
	return r;
}

$( document ).ready(function() {   

	// light box init...
	// NOTE: magnificPopup is defined on jQuery's prototype ($.fn.magnificPopup),
	// not in global scope, so `typeof magnificPopup` is always 'undefined'
	// and the old check never ran. Check $.fn instead.
	if (window.jQuery && jQuery.fn && jQuery.fn.magnificPopup) {
		$('.ltbox').magnificPopup({type: 'image',
			closeOnContentClick: true,
			closeBtnInside: false,
			fixedContentPos: true,
			mainClass: 'mfp-no-margins mfp-with-zoom', 
			image: {
				verticalFit: true
			},
			zoom: {
				enabled: true,
				duration: 500
			}
		});
	}

	//Check to see if the window is top if not then display button
	$(window).scroll(function(){
		if ($(this).scrollTop() > 100) {
			$('.scrollToTop').fadeIn();
		} else {
			$('.scrollToTop').fadeOut();
		}
	});

	//Click event to scroll to top
	$('.scrollToTop').click(function(){
		$('html, body').animate({scrollTop : 0},800);
		return false;
	});
});
