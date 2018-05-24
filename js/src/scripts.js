$(function () {
	var STR_UNDEFINED = 'undefined';
	var STR_TABINDEX = 'tabindex';
	var $window = $(window);
	var $document = $(document);
	var $head = $(document.head);
	var $body = $(document.body);
	var scrollThreshold = 50;
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
				var param;
				if (typeof (param = $slider.data('slider-start')) !== 'undefined') {
					options['start'] = param;
				}
				$slider.slider(options);
			});
		})();
	};
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
	var setTabindex = function ($ele, newTabindex) {
		var tabindex = $ele.attr(STR_TABINDEX);
		if (typeof tabindex !== STR_UNDEFINED) {
			$ele.data(STR_TABINDEX, tabindex);
		}
		$ele.attr(STR_TABINDEX, newTabindex);
	};
	var restoreTabindex = function ($ele) {
		var tabindex = $ele.data(STR_TABINDEX);
		if (typeof tabindex !== STR_UNDEFINED) {
			$ele.removeData(STR_TABINDEX);
			$ele.attr(STR_TABINDEX, tabindex);
		} else {
			$ele.removeAttr(STR_TABINDEX);
		}
	};

	// jQuery.scrollTo defaults
	if (typeof $.scrollTo !== STR_UNDEFINED) {
		$.extend($.scrollTo.defaults, {
			axis: 'y',
			duration: 500,
			interrupt: true,
			fail: function (animation) {
				$window.scrollTop(animation.props.scrollTop);
			}
		});
	}

	// Кнопки class="changeclass" при нажатии вызывают addClass/removeClass/toggleClass для определённых селекторов
	$document.on('click', '.changeclass', function (event) {
		var $this = $(this);
		var selector;
		var action;
		var result = false;
		var data = $this.data('changeclass');
		if (typeof $this.data('changeclass-nopreventdefault') === STR_UNDEFINED) {
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

	// noanimation
	(function () {
		var classStopAnimation = 'noanimation';
		$window.on('resize', function (event) {
			var $isAnimated = $('.js-animated');
			$isAnimated.addClass(classStopAnimation);
			$isAnimated.offset();
			$isAnimated.removeClass(classStopAnimation);
		});
	})();

	// float
	(function () {
		var delay = 5000;
		var timer;
		var scrollTopOld = 0;
		var cumulativeDelta = 0;
		var isChecked = false;
		var isDelayed = false;
		var isPanelVisible = false;
		var classIsVisible = 'is_visible';
		var classIsActive = 'is_open';
		var $panel = $('.js-float-panel');
		var $trigger = $('.js-float-trigger');
		if ($panel.length !== 1 || $trigger.length !== 1) {
			return;
		}
		var $burger = $('.js-float-burger');
		var isActive = $panel.hasClass(classIsActive);
		var check = function (isClosed) {
			if (isActive) {
				return;
			}
			var scrollTop = $window.scrollTop();
			var triggerTop = $trigger.offset().top;
			var delta = scrollTop - scrollTopOld;
			scrollTopOld = scrollTop;
			cumulativeDelta += delta;
			if (cumulativeDelta < -scrollThreshold) {
				cumulativeDelta = -scrollThreshold;
			} else if (cumulativeDelta > scrollThreshold) {
				cumulativeDelta = scrollThreshold;
			}
			var isPassedTrigger = scrollTop >= triggerTop;
			var isScrollingUp = cumulativeDelta === -scrollThreshold;
			var isScrollingDown = cumulativeDelta === scrollThreshold;
			if (!isChecked) {
				isChecked = true;
				isDelayed = true;
				timer = setTimeout(function () {
					isDelayed = false;
				}, delay);
			}
			if (isPassedTrigger && (isScrollingUp || isDelayed || isClosed) && !isPanelVisible) {
				$panel.addClass(classIsVisible);
				isPanelVisible = true;
			}
			if ((!isPassedTrigger || isScrollingDown && !isDelayed && !isClosed) && isPanelVisible) {
				$panel.removeClass(classIsVisible);
				isPanelVisible = false;
				if (isDelayed) {
					isDelayed = false;
					clearTimeout(timer);
				}
			}
		};
		var toggle = function (newActive) {
			$panel.toggleClass(classIsActive, newActive);
			isActive = $panel.hasClass(classIsActive);
			check(true);
		};
		$burger.on('click', function (event) {
			event.preventDefault();
			if (isDelayed) {
				isDelayed = false;
				clearTimeout(timer);
			}
			toggle();
		});
		$panel.on('click', 'a[href]', function (event) {
			toggle(false);
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
		$panel.on('mousedown touchstart', function (event) {
			if (isActive) {
				event.stopPropagation();
			}
		});
		$window.on('resize scroll', function (event) {
			check();
		});
		check();
	})();

	// Бургер-меню
	(function () {
		var $burger = $('.js-burger');
		var $menu = $('.js-menu');
		var $focusElements = $menu.find('a[href], label');
		var $focusFirstElement = $focusElements.first();
		var $focusLastElement = $focusElements.last();
		var isActive = $menu.hasClass('is_active');
		var toggle = function (newActive) {
			$burger.toggleClass('is_open', newActive);
			$menu.toggleClass('is_active', newActive);
			isActive = $menu.hasClass('is_active');
			if (isActive) {
				$body.find('a, :input, [tabindex]').not($menu.find('a, :input, [tabindex]')).each(function () {
					var $ele = $(this);
					setTabindex($ele, '-1');
					$ele.addClass('js-inert');
				});
			} else {
				$('.js-inert').each(function () {
					var $ele = $(this);
					restoreTabindex($ele);
					$ele.removeClass('js-inert');
				});
			}
		};
		$burger.on('click', function (event) {
			event.preventDefault();
			toggle();
		});
		$menu.on('click', 'a[href], label', function (event) {
			toggle(false);
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
			if (event.keyCode === 9 && !event.ctrlKey && !event.altKey && !event.metaKey) {
				if (!event.shiftKey && $focusLastElement.is(event.target)) {
					event.preventDefault();
					$focusFirstElement.focus();
				}
				if (event.shiftKey && $focusFirstElement.is(event.target)) {
					event.preventDefault();
					$focusLastElement.focus();
				}
			}
		});
		$document.on('mousedown touchstart', function (event) {
			if (isActive) {
				toggle(false);
			}
		});
		$burger.add($menu).on('mousedown touchstart', function (event) {
			if (isActive) {
				event.stopPropagation();
			}
		});
	})();

	// Поиск
	(function () {
		var $form = $('.js-search-form');
		var $input = $form.find('.js-search-input');
		var $close = $form.find('.js-search-close');
		var $burger = $('.js-burger');
		var $menuList = $('.js-menu-list');
		var $logo = $('.js-logo');
		var classOpen = 'is_expanded';
		var isOpen = false;
		var handlerKeydown = function (event) {
			if (event.keyCode === 27 && !event.ctrlKey && !event.altKey && !event.shiftKey && !event.metaKey && $input.val() === '') {
				event.stopImmediatePropagation();
				close();
				$input.blur();
			}
		};
		var open = function () {
			if (!isOpen) {
				setTabindex($burger, -1);
				setTabindex($logo, -1);
				$menuList.toggleClass('hide', true);
				$form.toggleClass(classOpen, true);
				$document.on('keydown', handlerKeydown);
				isOpen = true;
			}
		};
		var close = function () {
			if (isOpen) {
				$form.toggleClass(classOpen, false);
				$document.off('keydown', handlerKeydown);
				restoreTabindex($burger);
				restoreTabindex($logo);
				$menuList.toggleClass('hide', false);
				isOpen = false;
			}
		};
		if ($menuList.length !== 1) {
			return;
		}
		$input.on('focus', function (event) {
			if (!isOpen) {
				open();
			}
		});
		$input.on('blur', function (event) {
			var value = $input.val();
			var defaultValue = $input.prop('defaultValue');
			if (isOpen && (defaultValue === '' || value !== defaultValue)) {
				close();
			}
		});
		$form.on('submit', function (event) {
			if (!isOpen) {
				event.preventDefault();
				open();
				$input.focus();
			}
		});
		$close.on('click', function (event) {
			event.preventDefault();
			close();
			$input.blur();
		});
		if ($form.hasClass(classOpen)) {
			open();
		}
	})();

	// Диалоги
	(function () {
		var isOpen = false;
		var $dialog;
		var $dialogElements;
		var $focusElements;
		var $focusFirstElement;
		var $focusLastElement;
		var $autofocus;
		var handlerKeydown = function (event) {
			if (event.keyCode === 27 && !event.ctrlKey && !event.altKey && !event.shiftKey && !event.metaKey) {
				event.stopImmediatePropagation();
				close();
			}
			if (event.keyCode === 9 && !event.ctrlKey && !event.altKey && !event.metaKey) {
				if (!event.shiftKey && $focusLastElement.is(event.target)) {
					event.preventDefault();
					$focusFirstElement.focus();
				}
				if (event.shiftKey && $focusFirstElement.is(event.target)) {
					event.preventDefault();
					$focusLastElement.focus();
				}
			}
		};
		var handlerMousedown = function (event) {
			close();
		};
		var handlerScroll = function (event) {
			$window.off('scroll', handlerScroll);
			$body.css({
				position: 'fixed',
				width: '100%',
				height: '100%'
			});
		};
		var refresh = function () {
			$window.trigger('resize');
		};
		var open = function () {
			if (isOpen) {
				return;
			}
			$dialog = $('.js-dialog.is_opened');
			$dialogElements = $dialog.find('a, :input, [tabindex]');
			$focusElements = $dialog.find(':enabled[tabindex!="-1"]');
			$focusFirstElement = $focusElements.first();
			$focusLastElement = $focusElements.last();
			$autofocus = $dialog.find('.js-dialog-autofocus').first();
			if (!$autofocus.length) {
				$autofocus = $focusFirstElement;
			}
			$document.on('keydown', handlerKeydown);
			$document.on('mousedown touchstart', handlerMousedown);
			$window.on('scroll', handlerScroll);
			$body.css({
				overflow: 'hidden'
			});
			$body.find('a, :input, [tabindex]').not($dialogElements).each(function () {
				var $ele = $(this);
				setTabindex($ele, '-1');
				$ele.addClass('js-inert');
			});
			$autofocus.focus().select();
			isOpen = true;
			refresh();
		};
		var close = function () {
			if (!isOpen) {
				return;
			}
			$('.js-dialog.is_opened').removeClass('is_opened');
			$document.off('keydown', handlerKeydown);
			$document.off('mousedown touchstart', handlerMousedown);
			$window.off('scroll', handlerScroll);
			$body.css({
				overflow: '',
				position: '',
				width: '',
				height: ''
			});
			$('.js-inert').each(function () {
				var $ele = $(this);
				restoreTabindex($ele);
				$ele.removeClass('js-inert');
			});
			isOpen = false;
			refresh();
		};
		$document.on('click', '.js-dialog-open', function (event) {
			event.preventDefault();
			$($(this).data('dialog')).addClass('is_opened');
			open();
		});
		$document.on('mousedown touchstart', '.js-dialog-window', function (event) {
			event.stopPropagation();
		});
		$document.on('click', '.js-dialog-close', function (event) {
			event.stopPropagation();
			event.preventDefault();
			close();
		});
		$('.js-dialog.is_opened').each(function () {
			open();
		});
	})();

	// Кнопки «Купить», дублирующие основную
	$document.on('click', '.js-purchase-button', function (event) {
		event.preventDefault();
		$('.js-purchase-form').first().each(function () {
			var $form = $(this);
			var $submit = $form.find('[type=submit]').first();
			if ($submit.length > 0) {
				$submit.trigger('click');
			} else {
				$form.trigger('submit');
			}
		});
	});

	// Подсветка инпутов
	(function () {
		$('.field__input').on('input change', function (event) {
			var $input = $(this);
			var $field = $input.closest('.field');
			if ($input.val() !== '') {
				$field.addClass('field--not-empty');
				$field.removeClass('field--error');
			} else {
				$field.removeClass('field--not-empty');
			}
		});
	})();

	// Подмена URI, <title> и соцкнопок при прокрутке мимо .js-canonical
	(function () {
		var delay = 133;
		var classCanonical = 'js-canonical';
		var classCurrent = 'js-canonical-current';
		var triggerHook = 0.5;
		var triggerOffset;
		var canonicalItems = [];
		var lastItem;
		if (!$('.' + classCanonical).length) {
			return;
		}
		var init = function () {
			history.scrollRestoration = 'manual';
			$window.on('resize scroll', getClosest);
			getClosest();
		};
		var getClosest = function () {
			triggerOffset = $window.height() * triggerHook;
			canonicalItems = [];
			$('.' + classCanonical).each(function () {
				var $element = $(this);
				canonicalItems.push({
					element: this,
					offset: $element.offset().top - (parseInt($element.css('marginTop'), 10) || 0)
				});
			});
			if (!canonicalItems.length) {
				return;
			}
			var i;
			var closest;
			var newDistance;
			/*
			var minNegative;
			var minPositive;
			*/
			var minDistance;
			var windowScrollTop = $window.scrollTop();
			for (i = 0; i < canonicalItems.length; i++) {
				newDistance = canonicalItems[i].offset - windowScrollTop - triggerOffset;
				/*
				if (newDistance <= 0) {
					if (typeof minNegative === STR_UNDEFINED || minNegative < newDistance) {
						minNegative = newDistance;
						closest = i;
					}
				} else {
					if (typeof minPositive === STR_UNDEFINED || minPositive > newDistance) {
						minPositive = newDistance;
						if (typeof closest === STR_UNDEFINED) {
							closest = i;
						}
					}
				}
				*/
				if (newDistance < 0) {
					if (typeof minDistance === STR_UNDEFINED || newDistance > minDistance) {
						minDistance = newDistance;
						closest = i;
					}
				}
			}
			if (typeof closest === STR_UNDEFINED && typeof lastItem !== STR_UNDEFINED) {
				closest = 0;
			}
			if (typeof closest === STR_UNDEFINED || closest === lastItem) {
				return;
			}
			$('.' + classCurrent).removeClass(classCurrent);
			$(canonicalItems[closest].element).each(function () {
				var $canonical = $(this);
				var url = $canonical.data('canonical-url') || '';
				var doctitle = $canonical.data('canonical-doctitle') || '';
				var relativeUrl = url.replace(/^(.*:)?\/\/[^\/]*/, '');
				document.title = doctitle;
				history.replaceState(null, doctitle, relativeUrl);
				$canonical.addClass(classCurrent);
			});
			lastItem = closest;
		};
		$document.on('click', 'a[href^="#"]', function (event) {
			var $a = $(this);
			var href = $a.attr('href');
			if (href.indexOf('#') !== 0) {
				return;
			}
			event.preventDefault();
			if (href === '#') {
				$window.scrollTop(0);
				return;
			}
			$(href).each(function () {
				var $target = $(this);
				var $canonical = $target.closest('.js-canonical');
				var canonical = $canonical.get(0);
				var i;
				for (i = 0; i < canonicalItems.length; i++) {
					if (canonical === canonicalItems[i].element) {
						var headerOffset = 0;
						var scrollTop;
						var $header = $('.js-header');
						if ($header.length === 1) {
							headerOffset = $header.position().top + $header.outerHeight();
						}
						scrollTop = canonicalItems[i].offset - headerOffset;
						$window.scrollTop(scrollTop - scrollThreshold * 2);
						$window.trigger('scroll');
						$window.scrollTop(scrollTop);
						break;
					}
				}
			});
		});
		var $current = $('.' + classCurrent).first();
		if ($current.length === 1) {
			var headerOffset = 0;
			var $header = $('.js-float-panel');
			if ($header.length === 1) {
				$header.addClass('is_visible noanimation');
				$header.offset();
				$header.removeClass('noanimation');
			} else {
				$header = $('.js-header');
			}
			if ($header.length === 1) {
				headerOffset = $header.position().top + $header.outerHeight();
			}
			var scrollTo = function (event) {
				$window.scrollTop($current.offset().top - (parseInt($current.css('marginTop'), 10) || 0) - headerOffset);
			};
			scrollTo();
			var timer = setInterval(scrollTo, delay);
			$window.one('wheel keydown mousedown touchstart', function (event) {
				clearInterval(timer);
				init();
			});
		} else {
			init();
		}
	})();

	// Социальные сети
	(function () {
		var onClick = function (event) {
			if (event) {
				event.stopPropagation();
				event.preventDefault();
			}
			var $a = $(this);
			var $article = $a.closest('.js-article');
			var $data = ($article.length ? $article : $a);
			var href = '';
			var url = '';
			var metaUrl = '';
			var metaTitle = '';
			var metaDescription = '';
			var metaPicture = '';
			var dataNetwork = $a.data('share-network');
			var dataUrl = $data.data('share-url');
			var dataPicture = $data.data('share-picture');
			var dataTitle = $data.data('share-title');
			var dataDescription = $data.data('share-description');
			/*
			var truncate = function (s, n) {
				if (typeof s === 'string' && s.length > n) {
					s = s.slice(0, n) + '...';
				}
				return s;
			};
			var truncateTitle = function (s) {
				return truncate(s, 150);
			};
			var truncateDescription = function (s) {
				return truncate(s, 450);
			};
			var getFullTitle = function () {
				return [dataTitle || metaTitle, dataDescription || metaDescription].join(' / ');
			};
			*/
			var getQuery = function (params) {
				var parts = [];
				for (var i in params) {
					if (params[i]) {
						parts.push(i + '=' + encodeURIComponent(params[i]));
					}
				}
				return parts.join('&');
			};
			if (dataNetwork === '' && event) {
				$('.js-share-link').each(function () {
					var $a = $(this);
					var dataNetwork = $a.data('share-network');
					var isChanged = false;
					if (dataNetwork) {
						if (typeof dataUrl !== STR_UNDEFINED) {
							$a.data('share-url', dataUrl);
							isChanged = true;
						}
						if (typeof dataPicture !== STR_UNDEFINED) {
							$a.data('share-picture', dataPicture);
							isChanged = true;
						}
						if (typeof dataTitle !== STR_UNDEFINED) {
							$a.data('share-title', dataTitle);
							isChanged = true;
						}
						if (typeof dataDescription !== STR_UNDEFINED) {
							$a.data('share-description', dataDescription);
							isChanged = true;
						}
					}
					if (isChanged) {
						onClick.call(this);
					}
				});
			} else {
				if (dataNetwork) {
					metaUrl = $head.find('link[rel="canonical"]').prop('href') || $head.find('meta[property="og:url"]').prop('content') || '';
					metaTitle = $head.find('meta[property="og:title"]').prop('content') || '';
					metaDescription = $head.find('meta[property="og:description"]').prop('content') || '';
					metaPicture = $head.find('link[rel="image_src"]').prop('href') || '';
					url = dataUrl || metaUrl;
					switch (dataNetwork) {
						case 'fb':
							href = 'https://www.facebook.com/sharer/sharer.php?' + getQuery({
								'u': url
								/*
								'title': truncateTitle(dataTitle || metaTitle),
								'description': truncateDescription(dataDescription || metaDescription)
								*/
							});
							break;
						case 'vk':
							href = 'https://vk.com/share.php?' + getQuery({
								'url': url
								/*
								'image': dataPicture || metaPicture,
								'title': truncateDescription(getFullTitle()),
								'noparse': 'true'
								*/
							});
							break;
						case 'tg':
							href = 'https://t.me/share/url?' + getQuery({
								'url': url
								/*
								'text': truncateDescription(getFullTitle())
								*/
							});
							break;
					}
				}
				if (href) {
					this.href = href;
				}
				if (!event || event.ctrlKey || event.altKey || event.shiftKey || event.metaKey) {
					return;
				}
				if (href || this.href && $a.attr('href') !== '#') {
					windowOpen(href ? href : this.href, 'share', 800, 450);
				}
			}
		};
		$document.on('click', '.js-share-link', onClick);
		$('.js-share-link').each(function () {
			onClick.call(this);
		});
	})();

	// init
	(function () {
		zloInit();
		// Вызываем обработчики window.onResize
		$window.trigger('resize');
	})();
});
