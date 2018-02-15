$(function () {
	var $window = $(window);
	var $document = $(document);
	var $body = $(document.body);
	var classHide = 'hide';
	var isTooltipInitialized = false;

	// :really-hidden selector
	// Отбирает элементы, скрытые через display: none, visibility: hidden или opacity: 0
	// Учитываются все предки
	$.extend($.expr[':'], {
		'really-hidden': function (element) {
			var $element = $(element);
			var recursiveHidden = function ($element) {
				if ($element.length === 0 || $element.get(0) === document.body) {
					return false;
				}
				return $element.css('display') === 'none' || $element.css('opacity') == 0 || recursiveHidden($element.parent());
			};
			return $element.css('visibility') === 'hidden' || recursiveHidden($(element));
		}
	});

	// jQuery.scrollTo defaults
	var scrollToDuration = 1000;
	if (typeof $.scrollTo !== 'undefined') {
		$.extend($.scrollTo.defaults, {axis: 'y', duration: scrollToDuration, interrupt: true});
	}

	// windowOpen
	var windowOpen = function (url, title, w, h) {
		if (window.name === title) {
			window.location.href = url;
			return window;
		}
		var dualScreenLeft = window.screenLeft != undefined ? window.screenLeft : screen.left;
		var dualScreenTop = window.screenTop != undefined ? window.screenTop : screen.top;
		var width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
		var height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;
		var left = ((width / 2) - (w / 2)) + dualScreenLeft;
		var top = ((height / 2) - (h / 2)) + dualScreenTop;
		var newWindow = window.open(url, title, 'scrollbars=yes, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);
		if (window.focus) {
			newWindow.focus();
		}
		return newWindow;
	};

	// social
	(function () {
		$document.on('click', '.social__link', function (event) {
			event.preventDefault();
			windowOpen(this.href, 'social', 800, 700);
		})
	})();

	// modal
	(function () {
		var strClick = 'click';
		var strKeydown = 'keydown';
		var strModal = 'modal';
		var strGenerated = 'generated';
		var classModal = strModal;
		var classModalClose = classModal + '_close';
		var classModalTrigger = classModal + '_trigger';
		var selectorModal = '.' + classModal;
		var selectorModalClose = '.' + classModalClose;
		var selectorModalTrigger = '.' + classModalTrigger;
		var dataModalSelector = strModal + '-selector';
		var dataModalTemplate = strModal + '-template';
		var handlerKeydown = function (event) {
			if (event.keyCode === 27 && !event.ctrlKey && !event.altKey && !event.shiftKey && !event.metaKey) {
				event.stopImmediatePropagation();
				close();
			}
		};
		var refresh = function () {
			$window.trigger('resize');
		};
		var close = function () {
			var result = false;
			$(selectorModal).each(function () {
				result = true;
				var $this = $(this);
				if (typeof $this.data(strGenerated) !== 'undefined') {
					$this.remove();
				} else {
					$this.removeClass(classModal);
				}
			});
			if (result) {
				$body.css({overflow: ''});
				document.removeEventListener(strKeydown, handlerKeydown, true);
				refresh();
			}
		};
		$document.on(strClick, selectorModalTrigger, function (event) {
			event.preventDefault();
			var result = false;
			var $this = $(this);
			var dataSelector = $this.data(dataModalSelector) || '';
			var dataTemplate = $this.data(dataModalTemplate) || '';
			if (dataSelector !== '') {
				var $modal = $(dataSelector);
				if ($modal.length > 0) {
					result = true;
					$modal.addClass(classModal);
				}
			}
			if (dataTemplate !== '') {
				var html = $(dataTemplate).first().html();
				if (html) {
					result = true;
					var $html = $(html);
					$html.data(strGenerated, 1);
					$html.addClass(classModal);
					$html.appendTo(document.body);
					zloInit();
				}
			}
			if (result) {
				$body.css({overflow: 'hidden'});
				document.addEventListener(strKeydown, handlerKeydown, true);
				refresh();
			}
		});
		$document.on(strClick, selectorModalClose, function (event) {
			event.stopPropagation();
			event.preventDefault();
			close();
		});
	})();

	// more
	(function () {
		var duration = 400;
		$('.more').each(function () {
			var $more = $(this);
			var isHidden = !$more.hasClass('more-expanded');
			var $moreHidden = $more.find('.more-hidden');
			var $moreTriggers = $more.find('.more-trigger');
			if (!isHidden) {
				$moreHidden.show();
			}
			$moreTriggers.each(function () {
				var $trigger = $(this);
				if (!$trigger.hasClass('more-trigger-toggle')) {
					if (isHidden === $trigger.hasClass('more-trigger-hide')) {
						$trigger.addClass(classHide);
					} else {
						$trigger.removeClass(classHide);
					}
				}
			});
		});
		$document.on('click', '.more-trigger', function (event) {
			event.stopPropagation();
			event.preventDefault();
			var $more = $(this).closest('.more');
			var $moreHidden = $more.find('.more-hidden');
			var $moreTriggers = $more.find('.more-trigger');
			var isHidden = !$more.hasClass('more-expanded');
			var slideDown = function () {
				$moreHidden.slideDown(duration);
				$more.addClass('more-expanded');
			};
			var slideUp = function () {
				$moreHidden.slideUp(duration);
				$more.removeClass('more-expanded');
			};
			$moreTriggers.each(function () {
				var $trigger = $(this);
				if (!$trigger.hasClass('more-trigger-toggle')) {
					if (isHidden === $trigger.hasClass('more-trigger-hide')) {
						$trigger.removeClass(classHide);
					} else {
						$trigger.addClass(classHide);
					}
				}
			});
			$moreHidden.stop(true, true);
			if (isHidden) {
				slideDown();
				if ($moreHidden.offset().top > $window.scrollTop() + $window.height() / 3) {
					$window.stop();
					setTimeout(function () {
						$window.stop();
						$.scrollTo($more);
					}, duration);
				}
			} else {
				if ($more.offset().top < $window.scrollTop() - 5) {
					$window.stop();
					$.scrollTo($more, {
						onAfter: slideUp,
						fail: slideUp
					});
				} else {
					slideUp();
				}
			}
		});
	})();

	// Постепенная подгрузка (lazy load)
	(function () {
		var classTemplate = 'lazyload';
		var classUnload = 'lazyload-unload';
		var classWrapper = 'lazyload-wrapper';
		var classContent = 'lazyload-content';
		var classLoaded = 'lazyload-loaded';
		var dataUrl = 'lazyload-url';
		var dataScreensBefore = 'lazyload-screens-before';
		var dataScreensAfter = 'lazyload-screens-after';
		var dataUnload = 'lazyload-unload';
		var $lazyload = $('.' + classTemplate);
		if ($lazyload.length === 0) {
			return;
		}
		var reInit = function () {
			zloInit();
			$window.resize();
		};
		$lazyload.wrap('<div class="' + classWrapper + '"></div>');
		$window.on('resize scroll', function (event) {
			var windowScrollTop = $window.scrollTop();
			var windowScrollLeft = $window.scrollLeft();
			var windowWidth = $window.width();
			var windowHeight = $window.height();
			$('.' + classWrapper).each(function () {
				var $wrapper = $(this);
				var $template = $wrapper.find('.' + classTemplate);
				if ($template.length !== 1) {
					return;
				}
				var screensBefore = $template.data(dataScreensBefore) || 0.0;
				var screensAfter = $template.data(dataScreensAfter) || 0.0;
				var offset = $wrapper.offset();
				var isVisibleV = windowScrollTop >= (offset.top - windowHeight * (screensBefore + 1)) && windowScrollTop <= (offset.top + $wrapper.outerHeight() + windowHeight * screensAfter);
				var isVisibleH = windowScrollLeft >= (offset.left - windowWidth) && windowScrollLeft <= (offset.left + $wrapper.outerWidth());
				var isVisible = (isVisibleV && isVisibleH && !$wrapper.is(':really-hidden'));
				var isLoaded = $wrapper.hasClass(classLoaded);
				if (isVisible !== isLoaded) {
					if (isVisible) {
						var isScript = ($template.prop('tagName') || '').toLowerCase() === 'script';
						var isUnload = $template.hasClass(classUnload);
						var url = $template.data(dataUrl);
						if (isUnload) {
							$wrapper.data(dataUnload, true);
						}
						$wrapper.css({'height': ''});
						$wrapper.addClass(classLoaded);
						var $content = $('<div class="' + classContent + '"></div>');
						$content.appendTo($wrapper);
						if (typeof url === 'string' && url.length > 0) {
							if (!isUnload) {
								$template.remove();
							}
							$content.load(url, reInit);
						} else {
							var html = $template.html();
							html = html.replace(/\{\{(.*)\}\}/g, '$1');
							if (isScript) {
								html = html.replace(/^\s*<!--/, '').replace(/-->\s*$/, '');
							}
							if (!isUnload) {
								$template.remove();
							}
							$content.html(html);
							reInit();
						}
					} else {
						if (typeof $wrapper.data(dataUnload) != 'undefined') {
							$wrapper.css({'height': $wrapper.outerHeight()});
							$wrapper.find('.' + classContent).remove();
							$wrapper.removeClass(classLoaded);
							reInit();
						}
					}
				}
			});
		});
	})();

	// media change
	(function () {
		var selectorIsAnimated = '.is_animated';
		var classStopAnimation = 'stop_animation';
		$(document).on('mediachange', function (event) {
			var $isAnimated = $(selectorIsAnimated);
			$isAnimated.addClass(classStopAnimation);
			$isAnimated.each(function () {
				$(this).offset();
			});
			$isAnimated.removeClass(classStopAnimation);
		});
	})();

	var zloInit = function () {
		// nanoscroller
		(function () {
			if (typeof $.fn.nanoScroller !== 'function') {
				return;
			}
			$('.nano').nanoScroller({preventPageScrolling: true});
			$('.modal').find('.nano-content').focus();
		})();
		// slider
		(function () {
			if (typeof $.fn.slider !== 'function') {
				return;
			}
			var imgSrcset = function (img) {
				var $img = $(img);
				var srcset = $img.data('slider-srcset') || '';
				var src = $img.data('slider-src') || '';
				if (srcset != '') {
					img.srcset = srcset;
				}
				if (src != '') {
					img.src = src;
				}
				$img.removeData(['slider-srcset', 'slider-src']);
				$img.removeAttr('data-slider-srcset data-slider-src');
			};
			$('.slider-simple').not('.slider-ready').each(function () {
				var $slider = $(this);
				var $sliderItem = $slider.find('.slider-item');
				var isInfo = true;
				var images = [];
				var timer;
				var options;
				var preload = function (index, id) {
					var src = function (index) {
						var img = images[index];
						if (typeof img != 'undefined') {
							imgSrcset(img);
							delete images[index];
						}
					};
					src(index);
					src(index + 1);
					src(index - 1);
				};
				var mediaPlay = function (index, id) {
					$sliderItem.eq(index).find('.slider-media').each(function () {
						if (typeof this.poster !== 'undefined' && this.poster) {
							var currentSrc = $(this).data('currentSrc');
							try {
								if (typeof this.paused !== 'undefined' && this.paused) {
									if (typeof currentSrc !== 'undefined') {
										this.src = currentSrc;
									}
									this.play();
								}
							} catch (err) {}
						} else {
							try {
								if (typeof this.paused !== 'undefined' && this.paused) {
									this.play();
								}
							} catch (err) {}
						}
					});
				};
				var mediaPause = function (index, id) {
					$sliderItem.eq(index).find('.slider-media').each(function () {
						if (typeof this.poster !== 'undefined' && this.poster) {
							$(this).data('currentSrc', this.currentSrc);
							try {
								if (typeof this.paused !== 'undefined' && !this.paused) {
									this.pause();
									this.src = this.poster;
									this.load();
								}
							} catch (err) {}
						} else {
							try {
								if (typeof this.paused !== 'undefined' && !this.paused) {
									this.pause();
								}
							} catch (err) {}
						}
					});
				};
				$sliderItem.each(function (i) {
					$(this).find('img[data-slider-src]').each(function () {
						var $this = $(this);
						var src = $this.data('slider-src') || '';
						if (src != '') {
							images[i] = this;
						}
					});
				});
				options = {
					'isKeyboard': true,
					'margin': 22,
					'isFit': true,
					'align': 0,
					'onReady': function (index, id) {
						timer = window.setTimeout(function () {
							$slider.addClass('slider-hover');
						}, 500);
						preload(index, id);
						mediaPlay(index, id);
					},
					'onLeave': function (index, id) {
						mediaPause(index, id);
					},
					'onComplete': function (index, id) {
						preload(index, id);
						mediaPlay(index, id);
					},
					'onClick': function (index, id) {
						window.clearTimeout(timer);
						isInfo = !isInfo;
						if (isInfo) {
							$slider.addClass('slider-hover');
						} else {
							$slider.removeClass('slider-hover');
						}
					},
					'onMostlyVisible': function (index, id) {
						mediaPlay(index, id);
					},
					'onMostlyInvisible': function (index, id) {
						mediaPause(index, id);
					}
				};
				if ($slider.hasClass('slider-simple-single')) {
					options.isElastic = false;
				}
				$slider.slider(options);
			});
		})();
	};

	// changeclass
	(function () {
		$document.on("click", ".changeclass", function (event) {
			var $this = $(this);
			var selector;
			var action;
			var data = $this.data("changeclass");
			if (typeof $this.data("changeclass-nopreventdefault") === "undefined") {
				event.stopPropagation();
				event.preventDefault();
			}
			if (typeof data === "object") {
				for (selector in data) {
					if (typeof data[selector] === "object") {
						for (action in data[selector]) {
							switch (action) {
								case "addClass":
									$(selector).addClass(data[selector][action]);
									break;
								case "removeClass":
									$(selector).removeClass(data[selector][action]);
									break;
								case "toggleClass":
									$(selector).toggleClass(data[selector][action]);
									break;
							}
						}
					}
				}
			}
		});
	})();

	(function () {
		$('.field__input').on('input', function() {
			var $field = $(this).closest('.field');
			if (this.value) {
				$field.addClass('field--not-empty');
			} else {
				$field.removeClass('field--not-empty');
			}
		});
	})();

	// init
	(function () {
		var classNoTouch = 'no-touch';
		var autoScrollTimer;
		$body.addClass(classNoTouch);
		$window.one('touchstart', function (event) {
			$body.removeClass(classNoTouch);
		});
		$window.one('wheel', function (event) {
			clearInterval(autoScrollTimer);
		});
		setInterval(function () {
			$window.triggerHandler('resize');
		}, 500);
		autoScrollTimer = setInterval(function () {
			$window.triggerHandler('scroll');
		}, 250);
		zloInit();
		$window.resize();
	})();
});
