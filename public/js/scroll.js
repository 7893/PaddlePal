var direction = 0;
var scrollY = 0;
var maxY = 0;

function scroll_window() {
	if (maxY == 0)
		maxY = document.body.scrollHeight;
	if (direction == 0) {
		window.scrollBy(0,+1);
		if (scrollY > maxY)
			direction = 1;
		else
			scrollY = scrollY + 1;
	} else {
		window.scrollBy(0,-1);
		if ( scrollY == 0 )
			direction = 0;
		else
			scrollY=scrollY - 1;
	}
	setTimeout("scroll_window()", 10);
}
