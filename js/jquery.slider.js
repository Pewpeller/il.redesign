/*!
 * Bez v1.0.11
 * http://github.com/rdallasgray/bez
 *
 * A plugin to convert CSS3 cubic-bezier co-ordinates to jQuery-compatible easing functions
 *
 * With thanks to Nikolay Nemshilov for clarification on the cubic-bezier maths
 * See http://st-on-it.blogspot.com/2011/05/calculating-cubic-bezier-function.html
 *
 * Copyright 2011 Robert Dallas Gray. All rights reserved.
 * Provided under the FreeBSD license: https://github.com/rdallasgray/bez/blob/master/LICENSE.txt
 */
jQuery.extend({bez:function(coOrdArray){var encodedFuncName="bez_"+jQuery.makeArray(arguments).join("_").replace(/\./g,"p");if(typeof jQuery.easing[encodedFuncName]!=="function"){var polyBez=function(p1,p2){var A=[null,null],B=[null,null],C=[null,null],bezCoOrd=function(t,ax){C[ax]=3*p1[ax],B[ax]=3*(p2[ax]-p1[ax])-C[ax],A[ax]=1-C[ax]-B[ax];return t*(C[ax]+t*(B[ax]+t*A[ax]))},xDeriv=function(t){return C[0]+t*(2*B[0]+3*A[0]*t)},xForT=function(t){var x=t,i=0,z;while(++i<14){z=bezCoOrd(x,0)-t;if(Math.abs(z)<.001)break;x-=z/xDeriv(x)}return x};return function(t){return bezCoOrd(xForT(t),1)}};jQuery.easing[encodedFuncName]=function(x,t,b,c,d){return c*polyBez([coOrdArray[0],coOrdArray[1]],[coOrdArray[2],coOrdArray[3]])(t/d)+b}}return encodedFuncName}});;

/*!
 * jQuery selector :really-hidden
 *
 * Отбирает элементы, скрытые через display: none, visibility: hidden или opacity: 0
 * Учитываются все предки
 *
 * by Anton Zhukov
 * toxa@toxa.ru
 */
jQuery.extend(jQuery.expr[':'], {
	'really-hidden': function (element) {
		var $element = jQuery(element);
		var recursiveHidden = function ($element) {
			if ($element.length === 0 || $element.get(0) === document.body) {
				return false;
			}
			return $element.css('display') === 'none' || $element.css('opacity') == 0 || recursiveHidden($element.parent());
		};
		return $element.css('visibility') === 'hidden' || recursiveHidden(jQuery(element));
	}
});

/*!
 * slider jQuery Plugin v1.15.0
 *
 * by Anton Zhukov
 * toxa@toxa.ru
 *
 * USAGE:
 * $(selector).slider({options});
 * $(selector).slider('goTo', id, duration);
 */
(function ($) {
	'use strict';
	var prefix = 'slider'; // Префикс самого слайдера
	var constMouse = 'mouse'; // Префикс событий типа mousedown, mousemove, mouseup
	var isTouchValue = false; // Устройство поддерживает touch-события
	var isTouchFixed = false; // Переменная isTouchValue установлена
	var $window = $(window);
	var $document = $(document);
	var $root = typeof window.onmousemove != 'undefined' ? $window : $document;

	var init = function () {
		// $.browser.iphone: (boolean) браузер — iPhone
		// $.browser.ipad: (boolean) браузер — iPad
		// $.browser.ipadVersion: (number) версия iPad
		var iphone = (navigator.userAgent.indexOf('iPhone') != -1);
		var ipad = (navigator.userAgent.indexOf('iPad') != -1);
		var ipadVersion = navigator.userAgent.match(/CPU OS (\d+)/);
		if (ipad && ipadVersion && typeof ipadVersion[1] == 'string') {
			ipadVersion = parseInt(ipadVersion[1].replace(/_/g, '.'), 10) || 0;
		} else {
			ipadVersion = '0';
		}
		if (typeof $.browser != 'object') {
			$.browser = {};
		}
		$.extend($.browser, {
			'iphone': iphone,
			'ipad': ipad,
			'ipadVersion': ipadVersion
		});

		// $.support.transform: (boolean) браузер поддерживает CSS transforms
		// $.support.transform3d: (boolean) браузер поддерживает CSS 3D transforms
		var hasTransform;
		var hasTransform3D;
		var ele = document.createElement('div');
		document.body.insertBefore(ele, null);
		var transforms = {
			'webkitTransform': '-webkit-transform',
			'OTransform': '-o-transform',
			'msTransform': '-ms-transform',
			'MozTransform': '-moz-transform',
			'transform': 'transform'
		};
		for (var t in transforms) {
			if (typeof ele.style[t] != 'undefined') {
				ele.style[t] = 'translateX(1px)';
				hasTransform = window.getComputedStyle(ele).getPropertyValue(transforms[t]);
				ele.style[t] = '';
				ele.style[t] = 'translateZ(1px)';
				hasTransform3D = window.getComputedStyle(ele).getPropertyValue(transforms[t]);
				break;
			}
		}
		document.body.removeChild(ele);
		$.extend($.support, {
			'transform': typeof hasTransform != 'undefined' && hasTransform.length > 0 && hasTransform !== 'none',
			'transform3d': typeof hasTransform3D != 'undefined' && hasTransform3D.length > 0 && hasTransform3D !== 'none'
		});
	};

	// Настройки слайдеров по умолчанию
	var defaultOptions = {
		'isVertical': false, // Вертикальный или горизонтальный
		'isDraggable': true, // Можно двигать пальцем
		'isElastic': true, // Elastic-эффект для первого и последнего слайда
		'isLooped': false, // Циклический
		'isKeyboard': false, // Управление с клавиатуры
		'isAutoSlide': false, // Автоматическая смена слайдов при бездействии
		'isAutoSlideRestart': true, // Снимать/ставить setInterval заново или просто игнорировать
		'isTransform': true, // По возможности использовать transform
		'isTransform3d': true, // По возможности использовать transform3d
		'isFit': false, // Останавливаться, если оставшиеся слайды полностью видны в canvas
		'start': 1, // Номер или id начального слайда
		'margin': 0, // Расстояние между слайдами в пикселях, либо в процентах от canvas, если 0 < margin < 1
		'align': 0.5, // Выравнивание текущего слайда относительно рамки (0 — по левому краю, 1 — по правому, 0.5 — по центру)
		'durationDragMin': 250, // Минимальная длительность анимации при поднятии пальца/мыши, мс
		'durationDragMax': 250, // Максимальная длительность анимации при поднятии пальца/мыши, мс
		'durationItem': 250, // Длительность анимации по слайдам, мс
		'autoSlideInterval': 5000, // Интервал автоматической смена слайдов
		'easing': typeof $.bez === 'function' ? $.bez([0, 0, 0.25, 1]) : 'swing', // Easing-функция
		'mouseThreshold': 8, // Зона принятия решения о направлении движения, px, для мыши
		'touchThreshold': 0, // Зона принятия решения о направлении движения, px, для касаний
		'speedThreshold': 0.3, // Чувствительность к скорости движения
		'elasticPercent': 0.15, // Смещение первого и последнего слайда относительно ширины/высоты «рамки»
		'fade': 1.0, // Сводить opacity слайдов к указанному значению
		'customDraw': null, // Возможность изменить алгоритм движения
		'onReady': function (index, id) {}, // Событие инициализации слайдера
		'onLeave': function (index, id) {}, // Событие начала движения от текущего слайда
		'onChange': function (index, id) {}, // Событие смены текущего слайда
		'onStep': function (offset) {}, // Событие шага анимации
		'onComplete': function (index, id) {}, // Событие завершения анимации
		'onClick': function (index, id) {}, // Событие клика на слайд
		'onMostlyVisible': function (index, id) {}, // Событие isMostlyInViewport = true
		'onMostlyInvisible': function (index, id) {} // Событие isMostlyInViewport = false
	};

	// Возвращает true, если это событие мыши
	var isMouse = function (event) {
		return (typeof event == 'object' && typeof event.type == 'string' && event.type.indexOf(constMouse) == 0);
	};

	// Возвращает true, если это событие мыши, но не нажата левая кнопка
	var isMouseNoButton = function (event) {
		return (isMouse(event) && event.which != 1);
	};

	// Фиксация isTouchValue
	var isTouch = function (event) {
		if (!isTouchFixed) {
			isTouchValue = !isMouse(event);
			isTouchFixed = true;
		}
		return isTouchValue;
	};

	// Инициализация группы слайдеров (может быть несколько)
	$.fn[prefix] = function (options) {
		// Если указан метод, пытаемся его вызвать и выходим
		if (typeof options == 'string') {
			var params = Array.prototype.slice.call(arguments, 1);
			return this.each(function () {
				var methods = $(this).data(prefix + '-methods');
				if (typeof methods != 'undefined' && typeof methods[options] == 'function' && $(this).is('.' + prefix + '-ready')) {
					methods[options].apply(this, params);
				}
			});
		}

		// Дополняем настройки
		if (typeof options == 'object') {
			options = $.extend({}, defaultOptions, options);
			// Защита от дурака
			if (typeof options.isVertical != 'boolean') options.isVertical = defaultOptions.isVertical;
			if (typeof options.isDraggable != 'boolean') options.isDraggable = defaultOptions.isDraggable;
			if (typeof options.isElastic != 'boolean') options.isElastic = defaultOptions.isElastic;
			if (typeof options.isLooped != 'boolean') options.isLooped = defaultOptions.isLooped;
			if (typeof options.isKeyboard != 'boolean') options.isKeyboard = defaultOptions.isKeyboard;
			if (typeof options.isAutoSlide != 'boolean') options.isAutoSlide = defaultOptions.isAutoSlide;
			if (typeof options.isAutoSlideRestart != 'boolean') options.isAutoSlideRestart = defaultOptions.isAutoSlideRestart;
			if (typeof options.isFit != 'boolean') options.isFit = defaultOptions.isFit;
			options.start = (typeof options.start == 'number') ? parseInt(options.start, 10) : ((typeof options.start == 'string' && options.start.length > 0) ? options.start : defaultOptions.start);
			options.margin = (typeof options.margin == 'number') ? options.margin : defaultOptions.margin;
			options.align = (typeof options.align == 'number' && options.align >= 0 && options.align <= 1) ? options.align : defaultOptions.align;
			options.durationDragMin = (typeof options.durationDragMin == 'number') ? parseInt(options.durationDragMin, 10) : defaultOptions.durationDragMin;
			options.durationDragMax = (typeof options.durationDragMax == 'number') ? parseInt(options.durationDragMax, 10) : defaultOptions.durationDragMax;
			options.durationItem = (typeof options.durationItem == 'number') ? parseInt(options.durationItem, 10) : defaultOptions.durationItem;
			options.autoSlideInterval = (typeof options.autoSlideInterval == 'number') ? parseInt(options.autoSlideInterval, 10) : defaultOptions.autoSlideInterval;
			options.easing = (typeof options.easing == 'string') ? options.easing : defaultOptions.easing;
			options.mouseThreshold = (typeof options.mouseThreshold == 'number') ? parseInt(options.mouseThreshold, 10) : defaultOptions.mouseThreshold;
			options.touchThreshold = 0; // Опция touchThreshold временно равна 0, чтобы не было глюков (typeof options.touchThreshold == 'number') ? parseInt(options.touchThreshold, 10) : defaultOptions.touchThreshold;
			options.speedThreshold = (typeof options.speedThreshold == 'number') ? options.speedThreshold : defaultOptions.speedThreshold;
			options.elasticPercent = (typeof options.elasticPercent == 'number') ? options.elasticPercent : defaultOptions.elasticPercent;
			options.fade = (typeof options.fade == 'number') ? options.fade : defaultOptions.fade;
			if (typeof options.customDraw != 'function') options.customDraw = defaultOptions.customDraw;
			if (typeof options.onReady != 'function') options.onReady = defaultOptions.onReady;
			if (typeof options.onLeave != 'function') options.onLeave = defaultOptions.onLeave;
			if (typeof options.onChange != 'function') options.onChange = defaultOptions.onChange;
			if (typeof options.onStep != 'function') options.onStep = defaultOptions.onStep;
			if (typeof options.onComplete != 'function') options.onComplete = defaultOptions.onComplete;
			if (typeof options.onClick != 'function') options.onClick = defaultOptions.onClick;
			if (typeof options.onMostlyVisible != 'function') options.onMostlyVisible = defaultOptions.onMostlyVisible;
			if (typeof options.onMostlyInvisible != 'function') options.onMostlyInvisible = defaultOptions.onMostlyInvisible;
		} else {
			options = $.extend({}, defaultOptions);
		}

		// Первичная инициализация
		init();

		// Инициализация отдельного слайдера из списка найденных
		return this.each(function () {
			var $slider = $(this); // Отдельный слайдер
			var $innerSliders = $slider.find('.' + prefix); // Вложенные слайдеры
			var $canvas = $slider.find('.' + prefix + '-canvas').not($innerSliders.find('.' + prefix + '-canvas')); // Рамка (блок с overflow: hidden)
			var $sliderItems = $slider.find('.' + prefix + '-item').not($innerSliders.find('.' + prefix + '-item')); // Слайды
			var $prev = $slider.find('.' + prefix + '-prev').not($innerSliders.find('.' + prefix + '-prev')); // Кнопки навигации назад (вверх/влево)
			var $next = $slider.find('.' + prefix + '-next').not($innerSliders.find('.' + prefix + '-next')); // Кнопки навигации вперёд (вниз/вправо)
			var $nav = $slider.find('.' + prefix + '-nav').not($innerSliders.find('.' + prefix + '-nav')); // Блоки навигации
			var $goto = $slider.find('.' + prefix + '-goto').not($innerSliders.find('.' + prefix + '-goto')); // Переход к слайду
			var $navRepeat = $slider.find('.' + prefix + '-nav-repeat').not($innerSliders.find('.' + prefix + '-nav-repeat')); // Блоки навигации, которые следует размножить
			var $numberCurrent = $slider.find('.' + prefix + '-number-current').not($innerSliders.find('.' + prefix + '-number-current')); // Номер текущего слайда
			var $numberTotal = $slider.find('.' + prefix + '-number-total').not($innerSliders.find('.' + prefix + '-number-total')); // Общее количество слайдов
			var $animation = $({'offset': 0}); // Объект для анимации
			var canvasSize = 0; // Ширина/высота «рамки» (блока с overflow: hidden)
			var itemsSize = 0; // Ширина/высота «ленты» (воображаемой плёнки со слайдами)
			var marginSize = 0; // Расстояние между слайдами в пикселях
			var items = []; // Массив слайдов
			var firstItem;
			var lastItem;
			var current = 0; // Порядковый номер текущего слайда (0, 1, 2, …)
			var currentItem; // Порядковый номер реального текущего слайда (0, 1, 2, …)
			var offset = 0; // Текущее моментальное смещение ленты
			var touches = {}; // Массив касаний
			var isLooped = options.isLooped; // Циклический
			var isFit = options.isFit; // Останавливаться, если оставшиеся слайды полностью видны в canvas
			var isTouched = false; // Наличие как минимум одного касания
			var isDirectionLocked = false; // Зафиксировано направление движения
			var isDirectionOk = false; // Направление движения совпадает с направлением слайдера
			var isShifted = false; // Есть сдвиг слайда
			var isStillReturning = false; // Докрутка продолжается
			var isAutoSlidePlaying = false; // Автоматическая смена слайдов идёт
			var isVisibleInViewport = false; // Слайдер виден на экране
			var isMostlyInViewport = false; // Слайдер большей частью на экране
			var isFocus = false; // Какое-то поле приобрело фокус
			var isMouseHovered = false; // На слайдер наведена мышь
			var isKeyPressed = false; // Нажата управляющая клавиша
			var keyCode = 0; // Код нажатой клавиши
			var startDistance = 0; // Величина сдвига от первого касания
			var lastDistance = 0; // Величина последнего сдвига
			var lastDirection = 0; // Направление последнего плавного движения
			var lastTime; // Время последнего события
			var lastDelay; // Задержка с предыдущего события
			var autoSlideTimer; // Таймер автоматической смены слайдов

			// Функция замедления первого и последнего слайда
			var fnElastic = function (x, range) {
				return options.isElastic && lastItem !== firstItem ? (x / 3 * range) / (x / 3 + range) : 0;
			};

			// Возвращает одно из двух в зависимости от направления
			var getHV = function (h, v) {
				return (options.isVertical ? v : h);
			};

			// Создание массива слайдов и получение фактических размеров рамки и слайдов в px
			var getItems = function () {
				// Абсолютное смещение очередного слайда относительно рамки
				var absoluteOffset = 0;

				// Сохраним минимальный и максимальный размер слайда
				var minItemSize = 0;
				var maxItemSize = 0;

				// Массив слайдов создаём заново
				items = [];

				// Определяем фактическую ширину/высоту рамки
				canvasSize = getHV($canvas.outerWidth(), $canvas.outerHeight());

				// Определяем фактическое расстояние между слайдами в пикселях
				marginSize = options.margin;
				if (marginSize > 0 && marginSize < 1) {
					marginSize *= canvasSize;
				}

				// Перебираем все слайды
				$sliderItems.each(function () {
					var id;
					var $this = $(this);

					// Если слайд имеет display: none, пропускаем его
					if ($this.css('display') == 'none') {
						return;
					}

					// Определяем фактическую ширину/высоту слайда (слайды могут иметь разный размер)
					var itemSize = getHV($this.outerWidth(), $this.outerHeight());

					// Сохраняем минимальный размер слайда
					if (minItemSize > 0 && itemSize < minItemSize) {
						minItemSize = itemSize;
					}

					// Сохраняем максимальный размер слайда
					if (itemSize > maxItemSize) {
						maxItemSize = itemSize;
					}

					id = $this.data(prefix + '-id');
					if (typeof id == 'number') {
						id = id.toString();
					}
					if (typeof id == 'undefined') {
						id = '';
					}

					// Добавляем элемент в массив слайдов
					items.push({
						'id': id,
						'isVisible': true, // Поначалу все элементы помечаем как видимые, чтобы при первом draw() они переместились куда надо
						'size': itemSize, // Ширина/высота слайда
						'offset': absoluteOffset, // Абсолютное смещение слайда
						'element': this // Ссылка на HTML-элемент
					});

					// Следующий слайд будет смещаться на ширину текущего + расстояние между слайдами
					absoluteOffset += itemSize + marginSize;
				});
				itemsSize = absoluteOffset;

				// Первый и последний слайд
				firstItem = 0;
				lastItem = items.length - 1;

				// Если недостаточно слайдов, делаем слайдер не циклическим
				if (options.isLooped) {
					if (itemsSize - marginSize - maxItemSize < canvasSize) {
						isLooped = false;
						isFit = true;
					} else {
						isLooped = options.isLooped;
						isFit = options.isFit;
					}
				}

				// Если включена опция isFit, вычисляем минимальный первый и максимальный последний слайд
				if (isFit && !isLooped) {
					while (lastItem > 0 && itemsSize - marginSize - items[lastItem - 1].offset <= canvasSize - (canvasSize - items[lastItem - 1].size) * options.align) {
						lastItem--;
					}
					while (firstItem < lastItem && items[firstItem + 1].offset <= (canvasSize - items[firstItem + 1].size) * options.align) {
						firstItem++;
					}
					$slider.toggleClass(prefix + '-fit', firstItem === lastItem);
				}
			};

			// Получение номера слайда по его id или порядковому номеру
			var getItemById = function (id) {
				var i;
				var result = -1;
				var count;
				if (typeof id == 'string') {
					for (i = 0; i < items.length; i++) {
						if (items[i].id == id) {
							result = i;
							break;
						}
					}
				}
				if (result == -1) {
					result = (parseInt(id, 10) || 1) - 1;
					count = items.length;
					if (result >= count) {
						result = count - 1;
					}
					if (result < 0) {
						result = 0;
					}
				}
				return result;
			};

			// Проверка на видимость слайдера на экране
			var checkInViewport = function () {
				var windowScrollTop = $window.scrollTop();
				var windowScrollLeft = $window.scrollLeft();
				var windowWidth = $window.width();
				var windowHeight = $window.height();
				var windowCenterV = windowHeight / 2;
				var windowCenterH = windowWidth / 2;
				var sliderWidth = $slider.outerWidth();
				var sliderHeight = $slider.outerHeight();
				var sliderOffset = $slider.offset();
				var sliderTop = sliderOffset.top;
				var sliderLeft = sliderOffset.left;
				var sliderCenterTop = sliderTop + sliderHeight / 2;
				var sliderCenterLeft = sliderLeft + sliderWidth / 2;
				var isHidden = $slider.is(':really-hidden');
				var isVisibleV = !isHidden && windowScrollTop + windowHeight >= sliderTop && windowScrollTop <= sliderTop + sliderHeight;
				var isVisibleH = !isHidden && windowScrollLeft + windowWidth >= sliderLeft && windowScrollLeft <= sliderLeft + sliderWidth;
				var isMostlyVisibleV = !isHidden && (windowScrollTop + windowHeight >= sliderCenterTop && windowScrollTop <= sliderCenterTop) || (windowScrollTop + windowCenterV >= sliderTop && windowScrollTop + windowCenterV <= sliderTop + sliderHeight);
				var isMostlyVisibleH = !isHidden && (windowScrollLeft + windowWidth >= sliderCenterLeft && windowScrollLeft <= sliderCenterLeft) || (windowScrollLeft + windowCenterH >= sliderLeft && windowScrollLeft + windowCenterH <= sliderLeft + sliderWidth);
				var nowVisibleInViewport = (isVisibleV && isVisibleH);
				var nowMostlyInViewport = (isMostlyVisibleV && isMostlyVisibleH);
				// Если поменялось
				if (nowVisibleInViewport != isVisibleInViewport) {
					// Если слайдер показался
					if (nowVisibleInViewport) {
						$slider.addClass(prefix + '-visible');
						// Если браузер поддерживает CSS 3D transforms, преобразовываем все слайды в 3D
						if (options.isTransform && options.isTransform3d && $.support.transform3d) {
							$slider.addClass(prefix + '-3d');
						}
						// Запускаем автоматическую смену слайдов
						autoSlideStart();
					// Если слайдер скрылся
					} else {
						$slider.removeClass(prefix + '-visible');
						// Останавливаем автоматическую смену слайдов
						autoSlideStop();
						// Если браузер поддерживает CSS 3D transforms, временно снимаем преобразование в 3D
						if (options.isTransform && options.isTransform3d && $.support.transform3d) {
							$slider.removeClass(prefix + '-3d');
						}
					}
					// Перерисовываем
					draw();
				}
				if (nowMostlyInViewport != isMostlyInViewport) {
					var currentItem = getPageItem();
					if (nowMostlyInViewport) {
						$slider.addClass(prefix + '-mostly');
						// Вызываем callback-функцию options.onMostlyVisible
						// this — сам слайдер
						// первый параметр — порядковый индекс номер слайда (0, 1, 2…)
						// второй параметр — id или порядковый номер слайда (1, 2, 3…)
						options.onMostlyVisible.call(this, currentItem, (items[currentItem].id.length > 0 ? items[currentItem].id : currentItem + 1));
					} else {
						$slider.removeClass(prefix + '-mostly');
						// Вызываем callback-функцию options.onMostlyInvisible
						// this — сам слайдер
						// первый параметр — порядковый индекс номер слайда (0, 1, 2…)
						// второй параметр — id или порядковый номер слайда (1, 2, 3…)
						options.onMostlyInvisible.call(this, currentItem, (items[currentItem].id.length > 0 ? items[currentItem].id : currentItem + 1));
					}
				}
				isVisibleInViewport = nowVisibleInViewport;
				isMostlyInViewport = nowMostlyInViewport;
			};

			// Обновление слайдеров при изменениях размеров окна и пр.
			var update = function () {
				// Останавливаем любое движение
				$animation.stop(true);

				// Обновляем фактические размеры рамки и слайдов
				getItems();

				// Скорректировать текущий слайд
				fixCurrent();

				// Получаем смещение для текущего слайда
				offset = getOffset();

				// Перерисовываем
				draw();
				isShifted = false;

				// Запускаем автоматическую смену слайдов
				autoSlideStart();
			};

			// Скорректировать текущий слайд, если слайдер не циклический и current < firstItem или >= lastItem
			var fixCurrent = function () {
				if (!isLooped) {
					if (current > lastItem) {
						current = lastItem;
					}
					if (current < firstItem) {
						current = firstItem;
					}
				}
				return current;
			};

			// Получение текущей «страницы», т. е. количества полных кругов слайдера (деление по модулю current на items.length)
			var getPage = function () {
				if (isLooped) {
					var count = items.length;
					return Math.floor(current / count);
				} else {
					return 0;
				}
			};

			// Получение реального текущего слайда (остаток от деления current на items.length)
			var getPageItem = function () {
				if (isLooped) {
					var count = items.length;
					return (current % count + count) % count;
				} else {
					return current;
				}
			};

			// Получение логического номера слайда (учитывая страницу) по номеру реального слайда
			var getCurrent = function (itemIndex) {
				var count = items.length;
				return getPage() * count + itemIndex;
			};

			// Получение смещения ленты для текущего слайда
			var getOffset = function () {
				var currentPage = getPage();
				var currentItem = getPageItem();
				// Смещение целых кругов
				var offsetLoop = -(itemsSize * currentPage);
				// Смещение слайда внутри круга
				var offsetItem = -(items[currentItem].offset);
				// Смещение слайда относительно рамки с учётом выравнивания
				var offsetAlign = (canvasSize - items[currentItem].size) * options.align;
				return offsetLoop + offsetItem + offsetAlign;
			};

			// Магия. Получение нового номера текущего слайда, зная текущее смещение ленты и скорость
			var calculateCurrent = function () {
				var i, j, n;
				var absoluteOffset;
				var loopOffset;
				var nearest = [{}, {}];
				var speed;
				var isSpeed;
				var direction;
				var result = current;

				// Вычисляем скорость последнего движения
				speed = lastDistance / lastDelay;
				isSpeed = Math.abs(speed) >= options.speedThreshold;

				// Если скорость выше пороговой, а предыдущее движение не успело завершиться и оно было в том же направлении, переходим на следующий слайд
				if (isSpeed && isStillReturning && lastDirection * lastDistance > 0) {
					if (lastDistance < 0) {
						result++;
					} else {
						result--;
					}
				} else {
					// Вычисляем два ближайших элемента
					// Перебираем все слайды
					for (i = 0; i < items.length; i++) {
						// Смещение слайда относительно рамки
						absoluteOffset = items[i].offset + offset + (items[i].size - canvasSize) * options.align;

						// С учётом перехода через круг (сначала в минус)
						loopOffset = (absoluteOffset % itemsSize - itemsSize) % itemsSize;

						// Смотрим из минуса в плюс
						for (n = 0; n < 2; n++) {
							// 0: left, 1: right
							for (j = 0; j < 2; j++) {
								if (j == 0 && loopOffset < 0 && (typeof nearest[j].index == 'undefined' || loopOffset > nearest[j].distance) || j == 1 && loopOffset > 0 && (typeof nearest[j].index == 'undefined' || loopOffset < nearest[j].distance)) {
									nearest[j].index = (Math.floor(-absoluteOffset / itemsSize) + n) * items.length + i;
									nearest[j].distance = loopOffset;
								}
							}
							loopOffset += itemsSize;
						}
					}

					// Принимаем решение, в какую сторону двигать
					direction = nearest[0].distance + nearest[1].distance;
					if (isSpeed && speed > 0 || !isSpeed && direction > 0) {
						result = nearest[0].index;
					} else {
						result = nearest[1].index;
					}
				}

				// Запоминаем направление
				lastDirection = lastDistance;

				return result;
			};

			// Обновление всей навигации в соответствии с номером текущего слайда
			var updateNav = function () {
				var currentItem = getPageItem();
				$nav.each(function () {
					$(this).find('.' + prefix + '-nav-item-current').removeClass(prefix + '-nav-item-current');
					$(this).find('.' + prefix + '-nav-item').eq(currentItem).addClass(prefix + '-nav-item-current');
				});
				$numberCurrent.html(currentItem + 1);
				if (!isLooped) {
					if (current == firstItem) {
						$prev.addClass(prefix + '-inactive');
					} else {
						$prev.removeClass(prefix + '-inactive');
					}
					if (current == lastItem) {
						$next.addClass(prefix + '-inactive');
					} else {
						$next.removeClass(prefix + '-inactive');
					}
				}
			};

			// Переход к определённому слайду
			var goTo = function (n, isReturn, elastic, duration) {
				var oldCurrent = current;
				var oldItem = getPageItem();
				current = parseInt(n, 10) || 0;
				fixCurrent();
				var currentItem = getPageItem();
				if (current != oldCurrent) {
					$(items[oldItem].element).removeClass(prefix + '-item-current');
					$(items[currentItem].element).addClass(prefix + '-item-current');
					if (!isReturn) {
						updateNav();
					}
					if (!isShifted) {
						// Вызываем callback-функцию options.onLeave
						// this — текущий слайд
						// первый параметр — порядковый индекс номер слайда (0, 1, 2…)
						// второй параметр — id или порядковый номер слайда (1, 2, 3…)
						options.onLeave.call(items[oldItem].element, oldItem, (items[oldItem].id.length > 0 ? items[oldItem].id : oldItem + 1));
					}
					// Вызываем callback-функцию options.onChange
					// this — текущий слайд
					// первый параметр — порядковый индекс номер слайда (0, 1, 2…)
					// второй параметр — id или порядковый номер слайда (1, 2, 3…)
					options.onChange.call(items[currentItem].element, currentItem, (items[currentItem].id.length > 0 ? items[currentItem].id : currentItem + 1));
				}
				if (current != oldCurrent || isReturn || elastic && options.isElastic) {
					slide(isReturn, elastic, duration);
					if (elastic && !isReturn) {
						// Останавливаем автоматическую смену слайдов
						autoSlideStop();
					} else {
						// Запускаем автоматическую смену слайдов
						autoSlideStart();
					}
				}
			};

			// Переход к слайду по смещению
			var goBy = function (delta) {
				var elastic = 0;
				delta = parseInt(delta, 10) || 0;
				if (delta != 0) {
					if (options.isElastic && !isLooped) {
						if (delta < 0 && (current == firstItem && offset >= getOffset() || firstItem == lastItem)) {
							elastic = -1;
						}
						if (delta > 0 && (current == lastItem && offset <= getOffset() || firstItem == lastItem)) {
							elastic = 1;
						}
					}
					// Переходим к слайду
					goTo(current + delta, false, elastic);
				} else {
					// Возвращаем к первому слайду, если оттянули через край
					if (options.isElastic && isShifted && !isLooped && (current == firstItem && offset >= getOffset()) || (current == lastItem && offset <= getOffset())) {
						goTo(current, true, true);
					} else {
						autoSlideStart();
					}
				}
			};

			// Перерисовка слайдов в отдельно взятый момент
			var draw = function () {
				var i, n;
				var minOffset;
				var maxOffset;
				var drawOffset;
				var absoluteOffset;
				var finalOffset;
				var isItemVisible;
				var css;
				var custom;
				var fade;

				drawOffset = offset;

				// Особый offset для первого и последнего слайда
				if (!isLooped) {
					// items[firstItem].offset
					minOffset = (canvasSize - items[firstItem].size) * options.align - items[firstItem].offset;
					maxOffset = (canvasSize - items[lastItem].size) * options.align - items[lastItem].offset;
					if (offset > minOffset) {
						drawOffset = minOffset + fnElastic(offset - minOffset, canvasSize);
					}
					if (offset < maxOffset) {
						drawOffset = maxOffset + fnElastic(offset - maxOffset, -canvasSize);
					}
				}

				// Перебираем все слайды
				for (i = 0; i < items.length; i++) {
					css = {};
					custom = {};
					fade = options.fade;

					// Смещение слайда относительно рамки
					absoluteOffset = items[i].offset + drawOffset;
					finalOffset = absoluteOffset;

					// Вызываем функцию options.customDraw
					if (typeof options.customDraw === 'function') {
						custom = options.customDraw(i, absoluteOffset, items[i].size, itemsSize);
						if (typeof custom !== 'object') {
							custom = {};
						}
						if (typeof custom.finalOffset === 'number') {
							finalOffset = custom.finalOffset;
						}
						if (typeof custom.fade === 'number' && custom.fade < 1 && custom.fade >= 0) {
							fade = custom.fade;
						}
					}

					// С учётом перехода через круг (сначала в минус)
					if (isLooped) {
						finalOffset = (finalOffset % itemsSize - itemsSize) % itemsSize;
					}

					// Видимость текущего слайда
					isItemVisible = false;

					// Смотрим из минуса в плюс
					for (n = 0; !isItemVisible && n < (isLooped ? 2 : 1); n++) {
						isItemVisible = (finalOffset <= canvasSize && finalOffset + items[i].size >= 0);
						if (!isItemVisible) {
							finalOffset += itemsSize;
						}
					}

					// Если слайд был видимым в прошлый раз или должен быть видимым сейчас
					if (items[i].isVisible || isItemVisible) {
						// Если слайд надо спрятать, сдвигаем его за границы рамки
						if (!isItemVisible) {
							finalOffset = canvasSize + 1;
						}

						// Обновляем CSS

						// Разные CSS-свойства в зависимости от того, что поддерживает браузер
						if (options.isTransform && $.support.transform) {
							if (options.isTransform3d && $.support.transform3d && isVisibleInViewport) {
								css['transform'] = 'translate3d(' + getHV(finalOffset + 'px, 0px, 0px', '0px, ' + finalOffset + 'px, 0px') + ')';
							} else {
								css['transform'] = 'translate(' + getHV(finalOffset + 'px, 0px', '0px, ' + finalOffset + 'px') + ')';
							}
						} else {
							css[getHV('left', 'top')] = finalOffset;
						}

						// Прозрачность
						if (isItemVisible) {
							if (typeof custom.opacity === 'number') {
								css['opacity'] = custom.opacity;
							} else if (fade < 1) {
								css['opacity'] = Math.max(0, 1 - Math.abs((finalOffset - (canvasSize - items[i].size) * options.align) / (canvasSize - (canvasSize - items[i].size) * (0.5 - Math.abs(options.align - 0.5))))) * (1 - fade) + fade;
							} else {
								css['opacity'] = 1;
							}
						}
						if (css['opacity'] >= 1) {
							css['opacity'] = '';
						}

						// Это спасает от падения iPad при большом количестве слайдов, но сильно тормозит Android
						if ($.browser.ipad) {
							css['visibility'] = isItemVisible ? '' : 'hidden';
						}
						$(items[i].element).css(css);
					}

					// Сохраняем флаг видимости текущего слайда в массив слайдов
					items[i].isVisible = isItemVisible;
				}

				// Вызываем callback-функцию options.onStep
				// this — сам слайдер
				// первый параметр — значение offset в пикселях
				options.onStep.call(this, offset);
			};

			// Плавное движение слайдера от текущего offset к текущему слайду
			// Параметр isReturn указывает на то, что это докрутка при поднятии пальца/мыши (влияет на длительность анимации)
			// Параметр elastic == -1 (первый слайд), elastic == 1 (последний слайд). Также влияет на длительность анимации
			var slide = function (isReturn, elastic, duration) {
				var newOffset;
				var elasticOffset;
				if (options.isElastic) {
					elasticOffset = canvasSize * options.elasticPercent;
				} else {
					elasticOffset = 0;
					elastic = 0;
				}

				// Останавливаем любое движение
				$animation.stop(true);

				if (elastic && !isReturn) {
					// Оттягивание первого и последнего слайда кнопками
					if (elastic < 0) {
						newOffset = getOffset() + elasticOffset;
					} else {
						newOffset = getOffset() - elasticOffset;
					}
				} else {
					// Нормальное листание
					newOffset = getOffset();
				}

				// Если движения нет, ничего не двигаем
				if (newOffset == offset) {
					return;
				}

				// Помечаем, что есть сдвиг слайда
				isShifted = true;

				// Помечаем, что началась докрутка
				isStillReturning = isReturn;

				// Определяем длительность анимации
				if (typeof duration !== 'number') {
					if (elastic) {
						duration = Math.round(options.durationItem / 2);
					} else {
						if (isReturn) {
							duration = Math.abs(Math.round((newOffset - offset) / (lastDistance / lastDelay) * 2));
							if (duration > options.durationDragMax) {
								duration = options.durationDragMax;
							}
							if (duration < options.durationDragMin) {
								duration = options.durationDragMin;
							}
						} else {
							duration = options.durationItem;
						}
					}
				}

				// Устанавливаем начальное значение свойства, которое будем анимировать
				$animation.prop({'offset': offset});

				// Отрисовка каждого шага (step) производится через установку промежуточного offset и вызов draw()
				$animation.animate({
					'offset': newOffset
				}, {
					'duration': duration,
					'easing': options.easing,
					'step': function (now, fx) {
						offset = now;
						draw();
					},

					// По окончании анимации помечаем, что нет сдвига слайда
					'complete': function () {
						if (isReturn || !elastic) {
							isShifted = false;
						}
						isStillReturning = false;
						var currentItem = getPageItem();
						if (isReturn) {
							updateNav();
						}
						// Вызываем callback-функцию options.onComplete
						// this — текущий слайд
						// первый параметр — порядковый индекс номер слайда (0, 1, 2…)
						// второй параметр — id или порядковый номер слайда (1, 2, 3…)
						options.onComplete.call(items[currentItem].element, currentItem, (items[currentItem].id.length > 0 ? items[currentItem].id : currentItem + 1));
					}
				});
			};

			// Сохранение текущего времени и вычисление задержки с последнего события
			var getDelay = function () {
				var time = new Date();
				lastDelay = time - lastTime;
				lastTime = time;
			};

			// Сборщик мусора
			var touchGC = function (event) {
				var checkedTouches = {};
				var i;
				if (!isTouch(event) || $.isEmptyObject(touches)) {
					return;
				}
				// Перебираем все актуальные касания
				for (i = 0; i < event.originalEvent.touches.length; i++) {
					touch = event.originalEvent.touches.item(i);
					if (touch && touches[touch.identifier]) {
						// Добавляем это касание к списку актуальных
						checkedTouches[touch.identifier] = true;
					}
				}
				// Удаляем лишние
				for (i in touches) {
					if (typeof checkedTouches[i] == 'undefined') {
						delete touches[i];
					}
				}
				if ($.isEmptyObject(touches)) {
					onDragEnd(event);
				}
			};

			// Drag start
			var onDragStart = function (event) {
				var i;

				// Определяем, touch или mouse. Если событие mouse, а ждём touch, или наоборот, выходим
				if (isTouch(event) == isMouse(event)) {
					return;
				}

				// Обрабатываем только левую кнопку мыши
				if (isMouseNoButton(event)) {
					return;
				}

				// Фиксируем время
				getDelay();

				// К массиву касаний добавляем новые элементы и сохраняем координаты
				// Нажатие мыши также добавляется к массиву с идентификатором mouse
				if (isTouch(event)) {
					for (i = 0; i < event.originalEvent.changedTouches.length; i++) {
						var touch = event.originalEvent.changedTouches.item(i);
						if (touch) {
							touches[touch.identifier] = {
								'startX': touch.pageX,
								'startY': touch.pageY,
								'lastX': touch.pageX,
								'lastY': touch.pageY
							};
						}
					}
				} else {
					touches[constMouse] = {
						'startX': event.pageX,
						'startY': event.pageY,
						'lastX': event.pageX,
						'lastY': event.pageY
					};
				}

				// Если это первое касание
				if (!isTouched) {
					// Есть касание
					isTouched = true;

					// Обнуляем фиксацию направления движения
					isDirectionLocked = false;
					isDirectionOk = false;

					// Сбрасываем величину последнего сдвига
					startDistance = 0;
					lastDistance = 0;

					// Останавливаем любое движение
					$animation.stop(true);

					if (isTouch(event)) {
						// Ставим обработчики touch*
						$canvas.on('touchmove', onDragMove);
						$canvas.on('touchend touchcancel', onDragEnd);
					} else {
						// Ставим обработчики mouse*
						$root.on('mousemove', onDragMove);
						$root.on('mouseup', onDragEnd);
					}

					$window.on('blur', onDragEnd);

					// Останавливаем автоматическую смену слайдов
					autoSlideStop();
				}
			};

			// Drag move
			var onDragMove = function (event) {
				var i, j;
				var touch;
				var direction = options.isVertical ? 1 : 0; // Индекс
				var distance = [0, 0]; // Расстояние [X, Y]
				var distanceAbs = [0, 0]; // Расстояние по модулю [X, Y]
				var maxPositive = [0, 0]; // Самый большой из положительных сдвигов всех пальцев [X, Y]
				var maxNegative = [0, 0]; // Самый большой из отрицательных сдвигов всех пальцев [X, Y]

				// Обрабатываем только левую кнопку мыши
				if (isMouseNoButton(event)) {
					onDragEnd(event);
					return;
				}

				// Если нет касаний, ничего не делаем
				if (!isTouched) {
					return;
				}

				// Фиксируем время
				getDelay();

				// Если ещё не зафиксировано направление движения, определяем его
				if (!isDirectionLocked) {
					if (isTouch(event)) {
						// Перебираем все изменённые касания
						for (i = 0; i < event.originalEvent.changedTouches.length; i++) {
							touch = event.originalEvent.changedTouches.item(i);
							if (touch && touches[touch.identifier]) {
								// Вычисляем сдвиг
								distance[0] = touch.pageX - touches[touch.identifier].startX;
								distance[1] = touch.pageY - touches[touch.identifier].startY;

								// 0: X, 1: Y
								for (j = 0; j < 2; j++) {
									// Вычисляем самый большой из положительных сдвигов
									if (distance[j] > 0 && distance[j] > maxPositive[j]) {
										maxPositive[j] = distance[j];
									}

									// Вычисляем самый большой из отрицательных сдвигов
									if (distance[j] < 0 && distance[j] < maxNegative[j]) {
										maxNegative[j] = distance[j];
									}
								}
							}
						}

						// Суммируем положительный и отрицательный сдвиги
						for (j = 0; j < 2; j++) {
							distance[j] = maxPositive[j] + maxNegative[j];
						}
					} else {
						// Вычисляем сдвиг от mousedown
						distance[0] = event.pageX - touches[constMouse].startX;
						distance[1] = event.pageY - touches[constMouse].startY;
					}

					// Получаем значения сдвига по модулю
					for (j = 0; j < 2; j++) {
						distanceAbs[j] = Math.abs(distance[j]);
					}

					// Если расстояние сдвига достигло значения threshold, фиксируем направление движения
					if (Math.max(distanceAbs[0], distanceAbs[1]) >= (isTouch(event) ? options.touchThreshold : options.mouseThreshold)) {
						isDirectionLocked = true;
						isDirectionOk = (distanceAbs[0] < distanceAbs[1] == options.isVertical);

						// Обновляем lastX/lastY в массиве касаний
						for (i in touches) {
							touches[i].lastX = touches[i].startX;
							touches[i].lastY = touches[i].startY;
						}
					}
				}

				// Если зафиксировано направление движения и касание всего одно, блокируем прокрутку страницы
				if (!isTouch(event) || isDirectionOk && event.originalEvent.touches.length == 1) {
					event.preventDefault();
				}

				// Если зафиксировано направление движения и оно совпадает с направлением слайдера
				if (isDirectionOk) {
					// Вычисляем смещение
					if (isTouch(event)) {
						// Перебираем все изменённые касания
						for (i = 0; i < event.originalEvent.changedTouches.length; i++) {
							touch = event.originalEvent.changedTouches.item(i);
							if (touch && touches[touch.identifier]) {
								// Вычисляем сдвиг от последнего touchmove
								distance[0] = touch.pageX - touches[touch.identifier].lastX;
								distance[1] = touch.pageY - touches[touch.identifier].lastY;

								// 0: X, 1: Y
								for (j = 0; j < 2; j++) {
									// Вычисляем самый большой из положительных сдвигов
									if (distance[j] > 0 && distance[j] > maxPositive[j]) {
										maxPositive[j] = distance[j];
									}

									// Вычисляем самый большой из отрицательных сдвигов
									if (distance[j] < 0 && distance[j] < maxNegative[j]) {
										maxNegative[j] = distance[j];
									}
								}

								// Обновляем lastX/lastY в массиве касаний
								touches[touch.identifier].lastX = touch.pageX;
								touches[touch.identifier].lastY = touch.pageY;
							}
						}

						// Суммируем положительный и отрицательный сдвиги
						for (j = 0; j < 2; j++) {
							distance[j] = maxPositive[j] + maxNegative[j];
						}
					} else {
						// Вычисляем сдвиг от последнего mousemove
						distance[0] = event.pageX - touches[constMouse].lastX;
						distance[1] = event.pageY - touches[constMouse].lastY;

						// Обновляем lastX/lastY в массиве касаний
						touches[constMouse].lastX = event.pageX;
						touches[constMouse].lastY = event.pageY;
					}

					// Останавливаем любое движение
					$animation.stop(true, true);

					// Устанавливаем начальное значение свойства, которое будем анимировать
					$animation.prop({'offset': offset});

					// Прибавляем сдвиг к offset
					offset += distance[direction];

					// Сохраняем величину последнего сдвига
					lastDistance = distance[direction];
					startDistance += lastDistance;

					if (!isShifted) {
						// Вызываем callback-функцию options.onLeave
						// this — текущий слайд
						// первый параметр — порядковый индекс номер слайда (0, 1, 2…)
						// второй параметр — id или порядковый номер слайда (1, 2, 3…)
						var currentItem = getPageItem();
						options.onLeave.call(items[currentItem].element, currentItem, (items[currentItem].id.length > 0 ? items[currentItem].id : currentItem + 1));
						isShifted = true;
					}

					draw();

					/* Межпиксельная анимация
					$animation.animate({
						'offset': offset
					}, {
						'duration': 50,
						'easing': 'linear',
						'step': function (now, fx) {
							offset = now;
							draw();
						}
					});
					*/
				}
			};

			// Drag end
			var onDragEnd = function (event) {
				var i;

				// Если нет касаний, ничего не делаем
				if (!isTouched) {
					return;
				}

				// Из массива касаний удаляем соответствующие элементы
				if (!isTouch(event) || event.type == 'blur') {
					delete touches[constMouse];
				} else {
					for (i = 0; i < event.originalEvent.changedTouches.length; i++) {
						var touch = event.originalEvent.changedTouches.item(i);
						if (touch) {
							delete touches[touch.identifier];
						}
					}
				}

				// Если больше нет касаний
				if ($.isEmptyObject(touches)) {
					// Сохраняем, что больше нет касаний
					isTouched = false;

					// Обнуляем фиксацию направления движения
					isDirectionLocked = false;
					isDirectionOk = false;

					if (isTouch(event)) {
						// Снимаем обработчики touch*
						$canvas.off('touchmove', onDragMove);
						$canvas.off('touchend touchcancel', onDragEnd);
					} else {
						// Снимаем обработчики mouse*
						$root.off('mousemove', onDragMove);
						$root.off('mouseup', onDragEnd);
					}

					$window.off('blur', onDragEnd);

					// Если был сдвиг слайда, вызвать goTo()
					if (isShifted) {
						// Запрещаем обработку события браузером
						event.preventDefault();
						// Получаем номер слайда, к которому следует перейти и переходим
						goTo(calculateCurrent(), true);
					}

					// Запускаем автоматическую смену слайдов
					autoSlideStart();
				}

				// Чистим мусор
				touchGC(event);
			};

			// Click
			var onClick = function (event) {
				if (!isTouched && !isShifted) {
					if (!$(event.target).hasClass(prefix + '-link')) {
						// Вызываем callback-функцию options.onClick
						// this — текущий слайд
						// первый параметр — порядковый индекс номер слайда (0, 1, 2…)
						// второй параметр — id или порядковый номер слайда (1, 2, 3…)
						var currentItem = getPageItem();
						return options.onClick.call(items[currentItem].element, currentItem, (items[currentItem].id.length > 0 ? items[currentItem].id : currentItem + 1));
					}
				} else {
					event.stopPropagation();
					event.preventDefault();
				}
			};

			// Начало автоматической смены слайдов
			var autoSlideStart = function () {
				if (!options.isAutoSlide) {
					return;
				}
				autoSlideStop();
				if (isTouched || isMouseHovered || isKeyPressed) {
					return;
				}
				isAutoSlidePlaying = true;
				if (options.isAutoSlideRestart || typeof autoSlideTimer == 'undefined') {
					autoSlideTimer = setInterval(function () {
						if (isAutoSlidePlaying) {
							goTo(current + 1);
						}
					}, options.autoSlideInterval);
				}
			};

			// Остановка автоматической смены слайдов
			var autoSlideStop = function () {
				if (!options.isAutoSlide) {
					return;
				}
				isAutoSlidePlaying = false;
				if (options.isAutoSlideRestart) {
					clearInterval(autoSlideTimer);
				}
			};

			// Наконец, начинаем инициализировать слайдер
			// ******************************************

			// Публичные методы
			var methods = {
				'goTo': function (id, duration) {
					goTo(getItemById(id), false, false, duration);
				}
			};

			// Записываем публичные методы в data()
			$slider.data(prefix + '-methods', methods);

			// Обновляем фактические размеры рамки и слайдов
			getItems();

			// Если нет слайдов, нет и слайдера
			if (items.length == 0) {
				return;
			}

			// Если задан параметр start, определяем номер слайда
			current = getItemById(options.start);
			fixCurrent();
			currentItem = getPageItem();

			$(items[currentItem].element).addClass(prefix + '-item-current');

			// Получаем смещение для текущего слайда
			offset = getOffset();

			// Если браузер поддерживает touch-события, добавляем соответствующий класс
			if ('ontouchstart' in window) {
				$slider.addClass(prefix + '-touchable');
			}

			// Проверяем, виден ли слайдер на экране
			checkInViewport();

			// Размножаем по числу слайдов однотипные кнопки навигации
			$navRepeat.each(function () {
				var $this = $(this);
				var i;
				var html = '';
				var htmlItem = $this.html();
				for (i = 0; i < items.length; i++) {
					html += htmlItem;
				}
				$this.html(html);
			});

			$numberTotal.html(items.length);

			// Обновляем элементы навигации, чтобы выделились активные элементы
			updateNav();

			// Рисуем слайды (в первый раз перемещаются ВСЕ)
			draw();

			// Добавляем слайдеру класс готовности
			$slider.addClass(prefix + '-ready');

			// Вызываем callback-функцию options.onReady
			// this — текущий слайд
			// первый параметр — порядковый индекс номер слайда (0, 1, 2…)
			// второй параметр — id или порядковый номер слайда (1, 2, 3…)
			options.onReady.call(items[currentItem].element, currentItem, (items[currentItem].id.length > 0 ? items[currentItem].id : currentItem + 1));

			// Запрещаем drag-and-drop
			$slider.on('dragstart', false);

			// Вешаем вызовы checkInViewport() и update()
			$window.one('load', function (event) {
				checkInViewport();
				update();
				updateNav();
			});
			$window.on('resize', function (event) {
				checkInViewport();
				update();
				updateNav();
			});
			$window.on('scroll', function (event) {
				checkInViewport();
			});

			// Приостановка автоматической смены слайдов при наведении
			if (options.isAutoSlide) {
				$slider.on('mouseover', function (event) {
					// Определяем, touch или mouse. Если событие mouse, а ждём touch, или наоборот, выходим
					if (isTouch(event)) {
						return;
					}
					isMouseHovered = true;
					autoSlideStop(event);
				});
				$slider.on('mouseleave', function (event) {
					// Определяем, touch или mouse. Если событие mouse, а ждём touch, или наоборот, выходим
					if (isTouch(event)) {
						return;
					}
					isMouseHovered = false;
					autoSlideStart(event);
				});
			}

			// Drag-события
			if (options.isDraggable) {
				$slider.addClass(prefix + '-draggable');
				$canvas.on('touchstart mousedown', onDragStart);
				$canvas.on('click', onClick);
			}

			// Нажатие на кнопку «Назад»
			$prev.on('touchstart mousedown', '.' + prefix + '-link', function (event) {
				// Обрабатываем только левую кнопку мыши
				if (isMouseNoButton(event)) {
					return;
				}

				// Запрещаем распространение события
				event.stopPropagation();

				// Запрещаем обработку события браузером
				event.preventDefault();

				// Определяем, touch или mouse. Если событие mouse, а ждём touch, или наоборот, выходим
				if (isTouch(event) == isMouse(event)) {
					return;
				}

				goBy(-1);
				updateNav();
			});

			$prev.on('touchend touchcancel mouseup mouseleave', '.' + prefix + '-link', function (event) {
				// Запрещаем обработку события браузером
				event.preventDefault();

				// Если сейчас или до этого было событие mouse, а ждём touch, или наоборот, выходим
				if (isTouchValue == isMouse(event)) {
					return;
				}

				// Если не все пальцы подняты, ничего не делаем
				if (isTouch(event) && event.originalEvent.targetTouches.length > 0 || event.type == 'mouseleave' && typeof touches[constMouse] != 'undefined') {
					return;
				}

				goBy(0);
			});

			$prev.on('click dblclick', '.' + prefix + '-link', false);

			// Нажатие на кнопку «Вперёд»
			$next.on('touchstart mousedown', '.' + prefix + '-link', function (event) {
				// Обрабатываем только левую кнопку мыши
				if (isMouseNoButton(event)) {
					return;
				}

				// Запрещаем распространение события
				event.stopPropagation();

				// Запрещаем обработку события браузером
				event.preventDefault();

				// Определяем, touch или mouse. Если событие mouse, а ждём touch, или наоборот, выходим
				if (isTouch(event) == isMouse(event)) {
					return;
				}

				goBy(+1);
				updateNav();
			});

			$next.on('touchend touchcancel mouseup mouseleave', '.' + prefix + '-link', function (event) {
				// Запрещаем обработку события браузером
				event.preventDefault();

				// Если сейчас или до этого было событие mouse, а ждём touch, или наоборот, выходим
				if (isTouchValue == isMouse(event)) {
					return;
				}

				// Если не все пальцы подняты, ничего не делаем
				if (isTouch(event) && event.originalEvent.targetTouches.length > 0 || event.type == 'mouseleave' && typeof touches[constMouse] != 'undefined') {
					return;
				}

				goBy(0);
			});

			$next.on('click dblclick', '.' + prefix + '-link', false);

			// Для каждой кнопки навигации по слайдам сохраняем номер слайда, которому она соответствует
			$nav.each(function () {
				$(this).find('.' + prefix + '-nav-item').each(function (index) {
					$(this).find('.' + prefix + '-link').prop('href', '#id=' + (items[index] && items[index].id.length > 0 ? items[index].id : index + 1)).data('index', index);
				});
			});

			$nav.on('touchstart mousedown', '.' + prefix + '-link', function (event) {
				var $this = $(this);

				// Обрабатываем только левую кнопку мыши
				if (isMouseNoButton(event)) {
					return;
				}

				// Определяем, touch или mouse. Если событие mouse, а ждём touch, или наоборот, выходим
				if (isTouch(event) == isMouse(event)) {
					return;
				}

				if (typeof $this.data(prefix + '-link-clickable') === 'undefined') {
					// Запрещаем распространение события
					event.stopPropagation();
					goTo(getCurrent(parseInt($this.data('index'), 10) || 0));
					updateNav();
				}
			});

			$nav.on('touchend touchcancel mouseup mouseleave', '.' + prefix + '-link', function (event) {
				// Запрещаем обработку события браузером
				event.preventDefault();
			});

			$nav.on('click', '.' + prefix + '-link', function (event) {
				var $this = $(this);

				if (event.ctrlKey || event.altKey || event.shiftKey || event.metaKey) {
					return;
				}

				// Запрещаем обработку события браузером
				event.preventDefault();

				if (!isShifted && typeof $this.data(prefix + '-link-clickable') !== 'undefined') {
					goTo(getCurrent(parseInt($this.data('index'), 10) || 0));
					updateNav();
				}
			});

			$nav.on('dblclick', '.' + prefix + '-link', false);

			$goto.on('click', function (event) {
				event.preventDefault();
				var $this = $(this);
				var n = $this.data(prefix + '-goto-index');
				var duration = parseInt($this.data(prefix + '-goto-duration'), 10);
				goTo(n, false, false, duration);
			});

			$goto.on('dblclick', false);

			// Управление с клавиатуры
			if (options.isKeyboard) {
				$document.on('keydown keyup', function (event) {
					var arrowLeft = 37;
					var arrowUp = 38;
					var arrowRight = 39;
					var arrowDown = 40;
					// Ловим только Left/Right и Ctrl+Left/Ctrl+Right (Up/Down и Ctrl+Up/Ctrl+Down)
					if (!isFocus && !event.altKey && !event.shiftKey && !event.metaKey) {
						// keydown
						if (event.type == 'keydown') {
							// Left/Up
							if (event.keyCode == getHV(arrowLeft, arrowUp) && (isLooped || current != firstItem || event.keyCode != keyCode) && isMostlyInViewport) {
								isKeyPressed = true;
								goBy(-1);
								updateNav();
								keyCode = event.keyCode;
							}
							// Right/Down
							if (event.keyCode == getHV(arrowRight, arrowDown) && (isLooped || current != lastItem || event.keyCode != keyCode) && isMostlyInViewport) {
								isKeyPressed = true;
								goBy(+1);
								updateNav();
								keyCode = event.keyCode;
							}
						// keyup
						} else {
							// Left/Up/Right/Down
							if (event.keyCode == keyCode && (event.keyCode == getHV(arrowLeft, arrowUp) || event.keyCode == getHV(arrowRight, arrowDown)) && isMostlyInViewport) {
								isKeyPressed = false;
								goBy(0);
								keyCode = 0;
							}
						}
					}
				});
				$document.on('focus', 'input, textarea, select', function (event) {
					isFocus = true;
				});
				$document.on('blur', 'input, textarea, select', function (event) {
					isFocus = false;
				});
			}
		});
	};
})(jQuery);
