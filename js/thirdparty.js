/*!
 * requestAnimationFrame polyfill by Erik Möller. fixes from Paul Irish and Tino Zijdel
 *
 * Copyright (c) 2007-2015 Ariel Flesler - aflesler<a>gmail<d>com | http://flesler.blogspot.com
 *
 * MIT license
 * http://paulirish.com/2011/requestanimationframe-for-smart-animating/
 * http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
 */
!function(){for(var n=0,i=["ms","moz","webkit","o"],e=0;e<i.length&&!window.requestAnimationFrame;++e)window.requestAnimationFrame=window[i[e]+"RequestAnimationFrame"],window.cancelAnimationFrame=window[i[e]+"CancelAnimationFrame"]||window[i[e]+"CancelRequestAnimationFrame"];window.requestAnimationFrame||(window.requestAnimationFrame=function(i,e){var a=(new Date).getTime(),o=Math.max(0,16-(a-n)),t=window.setTimeout(function(){i(a+o)},o);return n=a+o,t}),window.cancelAnimationFrame||(window.cancelAnimationFrame=function(n){clearTimeout(n)})}();

/*!
 * scrollTo 2.1.2
 *
 * Copyright (c) 2007-2015 Ariel Flesler - aflesler<a>gmail<d>com | http://flesler.blogspot.com
 * Licensed under MIT
 * @author Ariel Flesler
 * @version 2.1.2
 *
 */
(function(f){"use strict";"function"===typeof define&&define.amd?define(["jquery"],f):"undefined"!==typeof module&&module.exports?module.exports=f(require("jquery")):f(jQuery)})(function($){"use strict";function n(a){return!a.nodeName||-1!==$.inArray(a.nodeName.toLowerCase(),["iframe","#document","html","body"])}function h(a){return $.isFunction(a)||$.isPlainObject(a)?a:{top:a,left:a}}var p=$.scrollTo=function(a,d,b){return $(window).scrollTo(a,d,b)};p.defaults={axis:"xy",duration:0,limit:!0};$.fn.scrollTo=function(a,d,b){"object"=== typeof d&&(b=d,d=0);"function"===typeof b&&(b={onAfter:b});"max"===a&&(a=9E9);b=$.extend({},p.defaults,b);d=d||b.duration;var u=b.queue&&1<b.axis.length;u&&(d/=2);b.offset=h(b.offset);b.over=h(b.over);return this.each(function(){function k(a){var k=$.extend({},b,{queue:!0,duration:d,complete:a&&function(){a.call(q,e,b)}});r.animate(f,k)}if(null!==a){var l=n(this),q=l?this.contentWindow||window:this,r=$(q),e=a,f={},t;switch(typeof e){case "number":case "string":if(/^([+-]=?)?\d+(\.\d+)?(px|%)?$/.test(e)){e= h(e);break}e=l?$(e):$(e,q);case "object":if(e.length===0)return;if(e.is||e.style)t=(e=$(e)).offset()}var v=$.isFunction(b.offset)&&b.offset(q,e)||b.offset;$.each(b.axis.split(""),function(a,c){var d="x"===c?"Left":"Top",m=d.toLowerCase(),g="scroll"+d,h=r[g](),n=p.max(q,c);t?(f[g]=t[m]+(l?0:h-r.offset()[m]),b.margin&&(f[g]-=parseInt(e.css("margin"+d),10)||0,f[g]-=parseInt(e.css("border"+d+"Width"),10)||0),f[g]+=v[m]||0,b.over[m]&&(f[g]+=e["x"===c?"width":"height"]()*b.over[m])):(d=e[m],f[g]=d.slice&& "%"===d.slice(-1)?parseFloat(d)/100*n:d);b.limit&&/^\d+$/.test(f[g])&&(f[g]=0>=f[g]?0:Math.min(f[g],n));!a&&1<b.axis.length&&(h===f[g]?f={}:u&&(k(b.onAfterFirst),f={}))});k(b.onAfter)}})};p.max=function(a,d){var b="x"===d?"Width":"Height",h="scroll"+b;if(!n(a))return a[h]-$(a)[b.toLowerCase()]();var b="client"+b,k=a.ownerDocument||a.document,l=k.documentElement,k=k.body;return Math.max(l[h],k[h])-Math.min(l[b],k[b])};$.Tween.propHooks.scrollLeft=$.Tween.propHooks.scrollTop={get:function(a){return $(a.elem)[a.prop]()}, set:function(a){var d=this.get(a);if(a.options.interrupt&&a._last&&a._last!==d)return $(a.elem).stop();var b=Math.round(a.now);d!==b&&($(a.elem)[a.prop](b),a._last=this.get(a))}};return p});

/*! modernizr 3.5.0 (Custom Build) | MIT *
 * https://modernizr.com/download/?-csspositionsticky-flexbox-objectfit-webp-setclasses !*/
!function(e,n,t){function r(e,n){return typeof e===n}function i(){var e,n,t,i,o,s,a;for(var l in _)if(_.hasOwnProperty(l)){if(e=[],n=_[l],n.name&&(e.push(n.name.toLowerCase()),n.options&&n.options.aliases&&n.options.aliases.length))for(t=0;t<n.options.aliases.length;t++)e.push(n.options.aliases[t].toLowerCase());for(i=r(n.fn,"function")?n.fn():n.fn,o=0;o<e.length;o++)s=e[o],a=s.split("."),1===a.length?Modernizr[a[0]]=i:(!Modernizr[a[0]]||Modernizr[a[0]]instanceof Boolean||(Modernizr[a[0]]=new Boolean(Modernizr[a[0]])),Modernizr[a[0]][a[1]]=i),w.push((i?"":"no-")+a.join("-"))}}function o(e){var n=x.className,t=Modernizr._config.classPrefix||"";if(S&&(n=n.baseVal),Modernizr._config.enableJSClass){var r=new RegExp("(^|\\s)"+t+"no-js(\\s|$)");n=n.replace(r,"$1"+t+"js$2")}Modernizr._config.enableClasses&&(n+=" "+t+e.join(" "+t),S?x.className.baseVal=n:x.className=n)}function s(e){return e.replace(/([a-z])-([a-z])/g,function(e,n,t){return n+t.toUpperCase()}).replace(/^-/,"")}function a(e,n){if("object"==typeof e)for(var t in e)C(e,t)&&a(t,e[t]);else{e=e.toLowerCase();var r=e.split("."),i=Modernizr[r[0]];if(2==r.length&&(i=i[r[1]]),"undefined"!=typeof i)return Modernizr;n="function"==typeof n?n():n,1==r.length?Modernizr[r[0]]=n:(!Modernizr[r[0]]||Modernizr[r[0]]instanceof Boolean||(Modernizr[r[0]]=new Boolean(Modernizr[r[0]])),Modernizr[r[0]][r[1]]=n),o([(n&&0!=n?"":"no-")+r.join("-")]),Modernizr._trigger(e,n)}return Modernizr}function l(e,n){return!!~(""+e).indexOf(n)}function f(){return"function"!=typeof n.createElement?n.createElement(arguments[0]):S?n.createElementNS.call(n,"http://www.w3.org/2000/svg",arguments[0]):n.createElement.apply(n,arguments)}function u(e,n){return function(){return e.apply(n,arguments)}}function A(e,n,t){var i;for(var o in e)if(e[o]in n)return t===!1?e[o]:(i=n[e[o]],r(i,"function")?u(i,t||n):i);return!1}function c(n,t,r){var i;if("getComputedStyle"in e){i=getComputedStyle.call(e,n,t);var o=e.console;if(null!==i)r&&(i=i.getPropertyValue(r));else if(o){var s=o.error?"error":"log";o[s].call(o,"getComputedStyle returning null, its possible modernizr test results are inaccurate")}}else i=!t&&n.currentStyle&&n.currentStyle[r];return i}function p(e){return e.replace(/([A-Z])/g,function(e,n){return"-"+n.toLowerCase()}).replace(/^ms-/,"-ms-")}function d(){var e=n.body;return e||(e=f(S?"svg":"body"),e.fake=!0),e}function m(e,t,r,i){var o,s,a,l,u="modernizr",A=f("div"),c=d();if(parseInt(r,10))for(;r--;)a=f("div"),a.id=i?i[r]:u+(r+1),A.appendChild(a);return o=f("style"),o.type="text/css",o.id="s"+u,(c.fake?c:A).appendChild(o),c.appendChild(A),o.styleSheet?o.styleSheet.cssText=e:o.appendChild(n.createTextNode(e)),A.id=u,c.fake&&(c.style.background="",c.style.overflow="hidden",l=x.style.overflow,x.style.overflow="hidden",x.appendChild(c)),s=t(A,e),c.fake?(c.parentNode.removeChild(c),x.style.overflow=l,x.offsetHeight):A.parentNode.removeChild(A),!!s}function g(n,r){var i=n.length;if("CSS"in e&&"supports"in e.CSS){for(;i--;)if(e.CSS.supports(p(n[i]),r))return!0;return!1}if("CSSSupportsRule"in e){for(var o=[];i--;)o.push("("+p(n[i])+":"+r+")");return o=o.join(" or "),m("@supports ("+o+") { #modernizr { position: absolute; } }",function(e){return"absolute"==c(e,null,"position")})}return t}function h(e,n,i,o){function a(){A&&(delete E.style,delete E.modElem)}if(o=r(o,"undefined")?!1:o,!r(i,"undefined")){var u=g(e,i);if(!r(u,"undefined"))return u}for(var A,c,p,d,m,h=["modernizr","tspan","samp"];!E.style&&h.length;)A=!0,E.modElem=f(h.shift()),E.style=E.modElem.style;for(p=e.length,c=0;p>c;c++)if(d=e[c],m=E.style[d],l(d,"-")&&(d=s(d)),E.style[d]!==t){if(o||r(i,"undefined"))return a(),"pfx"==n?d:!0;try{E.style[d]=i}catch(v){}if(E.style[d]!=m)return a(),"pfx"==n?d:!0}return a(),!1}function v(e,n,t,i,o){var s=e.charAt(0).toUpperCase()+e.slice(1),a=(e+" "+Q.join(s+" ")+s).split(" ");return r(n,"string")||r(n,"undefined")?h(a,n,i,o):(a=(e+" "+U.join(s+" ")+s).split(" "),A(a,n,t))}function y(e,n,r){return v(e,t,t,n,r)}var w=[],_=[],b={_version:"3.5.0",_config:{classPrefix:"",enableClasses:!0,enableJSClass:!0,usePrefixes:!0},_q:[],on:function(e,n){var t=this;setTimeout(function(){n(t[e])},0)},addTest:function(e,n,t){_.push({name:e,fn:n,options:t})},addAsyncTest:function(e){_.push({name:null,fn:e})}},Modernizr=function(){};Modernizr.prototype=b,Modernizr=new Modernizr;var C,x=n.documentElement,S="svg"===x.nodeName.toLowerCase();!function(){var e={}.hasOwnProperty;C=r(e,"undefined")||r(e.call,"undefined")?function(e,n){return n in e&&r(e.constructor.prototype[n],"undefined")}:function(n,t){return e.call(n,t)}}(),b._l={},b.on=function(e,n){this._l[e]||(this._l[e]=[]),this._l[e].push(n),Modernizr.hasOwnProperty(e)&&setTimeout(function(){Modernizr._trigger(e,Modernizr[e])},0)},b._trigger=function(e,n){if(this._l[e]){var t=this._l[e];setTimeout(function(){var e,r;for(e=0;e<t.length;e++)(r=t[e])(n)},0),delete this._l[e]}},Modernizr._q.push(function(){b.addTest=a}),Modernizr.addAsyncTest(function(){function e(e,n,t){function r(n){var r=n&&"load"===n.type?1==i.width:!1,o="webp"===e;a(e,o&&r?new Boolean(r):r),t&&t(n)}var i=new Image;i.onerror=r,i.onload=r,i.src=n}var n=[{uri:"data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA=",name:"webp"},{uri:"data:image/webp;base64,UklGRkoAAABXRUJQVlA4WAoAAAAQAAAAAAAAAAAAQUxQSAwAAAABBxAR/Q9ERP8DAABWUDggGAAAADABAJ0BKgEAAQADADQlpAADcAD++/1QAA==",name:"webp.alpha"},{uri:"data:image/webp;base64,UklGRlIAAABXRUJQVlA4WAoAAAASAAAAAAAAAAAAQU5JTQYAAAD/////AABBTk1GJgAAAAAAAAAAAAAAAAAAAGQAAABWUDhMDQAAAC8AAAAQBxAREYiI/gcA",name:"webp.animation"},{uri:"data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA=",name:"webp.lossless"}],t=n.shift();e(t.name,t.uri,function(t){if(t&&"load"===t.type)for(var r=0;r<n.length;r++)e(n[r].name,n[r].uri)})});var B="Moz O ms Webkit",Q=b._config.usePrefixes?B.split(" "):[];b._cssomPrefixes=Q;var T=function(n){var r,i=P.length,o=e.CSSRule;if("undefined"==typeof o)return t;if(!n)return!1;if(n=n.replace(/^@/,""),r=n.replace(/-/g,"_").toUpperCase()+"_RULE",r in o)return"@"+n;for(var s=0;i>s;s++){var a=P[s],l=a.toUpperCase()+"_"+r;if(l in o)return"@-"+a.toLowerCase()+"-"+n}return!1};b.atRule=T;var U=b._config.usePrefixes?B.toLowerCase().split(" "):[];b._domPrefixes=U;var R={elem:f("modernizr")};Modernizr._q.push(function(){delete R.elem});var E={style:R.elem.style};Modernizr._q.unshift(function(){delete E.style}),b.testAllProps=v,b.testAllProps=y,Modernizr.addTest("flexbox",y("flexBasis","1px",!0));var k=b.prefixed=function(e,n,t){return 0===e.indexOf("@")?T(e):(-1!=e.indexOf("-")&&(e=s(e)),n?v(e,n,t):v(e,"pfx"))};Modernizr.addTest("objectfit",!!k("objectFit"),{aliases:["object-fit"]});var P=b._config.usePrefixes?" -webkit- -moz- -o- -ms- ".split(" "):["",""];b._prefixes=P,Modernizr.addTest("csspositionsticky",function(){var e="position:",n="sticky",t=f("a"),r=t.style;return r.cssText=e+P.join(n+";"+e).slice(0,-e.length),-1!==r.position.indexOf(n)}),i(),o(w),delete b.addTest,delete b.addAsyncTest;for(var j=0;j<Modernizr._q.length;j++)Modernizr._q[j]();e.Modernizr=Modernizr}(window,document);