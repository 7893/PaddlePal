function swiper_initialize(resize_cb) {
	var swiper = new Swiper('.swiper-container', {
		pagination: '.swiper-pagination',
		paginationClickable: true,
		keyboardControl: true,
		nextButton: '.swiper-button-next',
		prevButton: '.swiper-button-prev',
		slidesPerView: 4,
		spaceBetween: 20,
		breakpoints: {
			2198: {
				slidesPerView: 3,
				spaceBetween: 20
			},
			1598: {
				slidesPerView: 2,
				spaceBetween: 20
			},
			898: {
				effect : 'coverflow',
				slidesPerView: 1,
				spaceBetween: 20
			}
		},
		onAfterResize: function(swiper){
			if (resize_cb != null) {
				swiper_callback();
			}
		},
		coverflow: {
            rotate: 30,
            stretch: 10,
            depth: 60,
            modifier: 2,
            slideShadows : true
        }
	});
	return swiper;
}