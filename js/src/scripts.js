$(function () {
	var $window = $(window);
	var $document = $(document);
	var zloInit = function () {
		// nanoscroller
		(function () {
			if (typeof $.fn.nanoScroller !== 'function') {
				return;
			}
			$('.nano').nanoScroller({preventPageScrolling: true});
		})();
		// slider
		(function () {
			if (typeof $.fn.slider !== 'function') {
				return;
			}
			$('.slider-simple').not('.slider-ready').each(function () {
				var $slider = $(this);
				var options = {
					'isKeyboard': true,
					'isFit': true,
					'margin': 22,
					'align': 0,
				};
				$slider.slider(options);
			});
		})();
	};

	// Кнопки class="changeclass" при нажатии вызывают addClass/removeClass/toggleClass для определённых селекторов
	$document.on('click', '.changeclass', function (event) {
		var $this = $(this);
		var selector;
		var action;
		var result = false;
		var data = $this.data('changeclass');
		if (typeof $this.data('changeclass-nopreventdefault') === 'undefined') {
			event.stopPropagation();
			event.preventDefault();
		}
		if (typeof data === 'object') {
			for (selector in data) {
				if (typeof data[selector] === 'object') {
					for (action in data[selector]) {
						switch (action) {
							case 'addClass':
								$(selector).addClass(data[selector][action]);
								result = true;
								break;
							case 'removeClass':
								$(selector).removeClass(data[selector][action]);
								result = true;
								break;
							case 'toggleClass':
								$(selector).toggleClass(data[selector][action]);
								result = true;
								break;
						}
					}
				}
			}
			if (result) {
				$window.trigger('resize');
			}
		}
	});

	// Бургер-меню
	(function () {
		var isActive = $('.js-menu').hasClass('is_active');
		var toggle = function (newActive) {
			$('.js-menu').toggleClass('is_active', newActive);
			isActive = $('.js-menu').hasClass('is_active');
		};
		$('.js-burger').on('click', function (event) {
			toggle();
		});
		$window.on('resize', function (event) {
			if (isActive) {
				toggle(false);
			}
		});
		$document.on('keydown', function (event) {
			if (isActive && event.keyCode === 27 && !event.ctrlKey && !event.altKey && !event.shiftKey && !event.metaKey) {
				event.stopImmediatePropagation();
				toggle(false);
			}
		});
		$document.on('mousedown touchstart', function (event) {
			if (isActive) {
				toggle(false);
			}
		});
		$('.js-burger, .js-menu').on('mousedown touchstart', function (event) {
			event.stopPropagation();
		});
	})();


	(function () {
		$('.field__input').on('input', function() {
			var $field = $(this).closest('.field');
			if (this.value) {
				$field.addClass('field--not-empty');
				$field.removeClass('field--error');
			} else {
				$field.removeClass('field--not-empty');
			}
		});
	})();


	// init
	(function () {
		zloInit();
		// Вызываем обработчики window.onResize
		$window.trigger('resize');
	})();
});
