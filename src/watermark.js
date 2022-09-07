"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
exports.Watermark = void 0;
var DEFAULTS = {
    text: 'watermark',
    positionType: 'fixed',
    parentSelector: 'body',
    canvasClassName: 'watermark',
    gapsX: 20,
    gapsY: 20,
    rotate: 45,
    debounceTime: 300,
    style: {
        font: '16px 微软雅黑',
        fillStyle: '#ddd',
        textBaseline: 'middle'
    },
    canvasStyle: {
        left: 0,
        top: 0,
        zIndex: 999,
        pointerEvents: 'none',
        display: 'block'
    },
    created: function (canvas) {
        console.log(canvas, 'canvas created');
    },
    complete: function (ctx, context) {
        console.log(ctx, context, 'draw completed');
    }
};
var Watermark = /** @class */ (function () {
    function Watermark(opt) {
        this.defaults = DEFAULTS;
        this.cache = {};
        var style = __assign(__assign({}, this.defaults.style), opt === null || opt === void 0 ? void 0 : opt.style);
        var canvasStyle = __assign(__assign({}, this.defaults.canvasStyle), opt === null || opt === void 0 ? void 0 : opt.canvasStyle);
        this.options = Object.assign({}, this.defaults, opt, { style: style, canvasStyle: canvasStyle });
    }
    Watermark.prototype.initEle = function () {
        var _a = this.options, parentSelector = _a.parentSelector, canvasClassName = _a.canvasClassName, positionType = _a.positionType, canvasStyle = _a.canvasStyle, rotate = _a.rotate, created = _a.created;
        var canvas = document.createElement('canvas');
        var parent = document.querySelector(parentSelector);
        this.cache.parent = parent;
        canvas["class"] = canvasClassName;
        canvas.style.position = positionType;
        Object.assign(canvas.style, canvasStyle);
        var max = Math.max(parent.clientWidth, (+parent.clientHeight || window.innerHeight));
        canvas.width = max;
        canvas.height = max;
        created.apply(this, [canvas]);
        this.cache.canvas = canvas;
        parent.appendChild(canvas);
        this.cache.ctx = canvas.getContext('2d');
        this.cache.ctx.rotate(rotate * Math.PI / 180);
        canvas.getContext = function () { return undefined; };
        return canvas;
    };
    Watermark.prototype.init = function () {
        var _this = this;
        var text = this.options.text;
        this.createWatermark(text);
        this.watch(function () {
            _this.createWatermark(text);
        });
    };
    Watermark.prototype.createWatermark = function (text) {
        this.initEle();
        this.draw(text);
    };
    Watermark.prototype.setCanvasSize = function () {
        var _a = this.cache, parent = _a.parent, canvas = _a.canvas, ctx = _a.ctx;
        var max = Math.max(parent.clientWidth, (+parent.clientHeight || window.innerHeight));
        canvas.width = max;
        canvas.height = max;
        ctx.rotate(this.options.rotate * Math.PI / 180);
    };
    Watermark.prototype.clearCanvas = function () {
        var _a = this.cache, canvas = _a.canvas, ctx = _a.ctx;
        var rotate = this.options.rotate;
        ctx.rotate(-rotate * Math.PI / 180);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.rotate(rotate * Math.PI / 180);
    };
    Watermark.prototype.draw = function (text) {
        var _a = this.cache, canvas = _a.canvas, ctx = _a.ctx;
        var _b = this.options, gapsX = _b.gapsX, gapsY = _b.gapsY, rotate = _b.rotate;
        this.options.text = text;
        this.clearCanvas();
        Object.assign(ctx, this.options.style);
        var temp = ctx.measureText(text);
        var textWidth = temp.width + gapsX;
        var textHeight = gapsY + 14 * 1.5;
        var maxWidth = 3 * canvas.width;
        var xCount = Math.ceil(maxWidth / textWidth);
        var yCount = Math.ceil(maxWidth / textHeight);
        for (var x = 0, len = xCount; x < len; x++) {
            for (var y = 0, lenY = yCount; y < lenY; y++) {
                var startOffset = y & 1 ? 0 : textWidth / 5;
                ctx.fillText(text, textWidth * x + startOffset - canvas.height * (Math.ceil(rotate / (rotate > 180 ? 180 : 90)) || 1), textHeight * y - canvas.height * rotate / (rotate > 180 ? 360 : 45));
            }
        }
    };
    Watermark.prototype.watch = function (userCallBack) {
        var _this = this;
        var _a = this.options, positionType = _a.positionType, selector = _a.parentSelector, canvasClassName = _a.canvasClassName, canvasStyle = _a.canvasStyle;
        // 选择需要观察变动的节点
        var targetNode = document.querySelector(selector);
        // 观察器的配置（需要观察什么变动）
        var config = { attributes: true, childList: true, subtree: true };
        // 当观察到变动时执行的回调函数
        var callback = function (mutationsList, observer) {
            // Use traditional 'for loops' for IE 11
            for (var _i = 0, mutationsList_1 = mutationsList; _i < mutationsList_1.length; _i++) {
                var mutation = mutationsList_1[_i];
                if (mutation.type === 'childList') {
                    var len = mutation.removedNodes.length;
                    if (len) {
                        for (var i = 0; i < len; i++) {
                            if (mutation.removedNodes[i]["class"] === canvasClassName) {
                                //watermark(text,rotate);
                                userCallBack();
                            }
                        }
                    }
                }
                else if (mutation.type === 'attributes') {
                    if (mutation.target["class"] === canvasClassName && mutation.attributeName === 'style') {
                        mutation.target.style.display = 'block';
                        Object.assign(mutation.target.style, canvasStyle);
                        mutation.target.style.position = positionType;
                    }
                }
            }
        };
        // 创建一个观察器实例并传入回调函数
        var observer = new MutationObserver(callback);
        // 以上述配置开始观察目标节点
        observer.observe(targetNode, config);
        // 之后，可停止观察
        //observer.disconnect();
        this.cache.observer = observer;
        window.addEventListener('resize', function () { return _this.handleResize(); }, false);
        return observer;
    };
    Watermark.prototype.handleResize = function () {
        var _this = this;
        var _a = this.options, debounceTime = _a.debounceTime, text = _a.text;
        var cache = this.cache;
        cache._h && clearTimeout(cache._h);
        cache._h = setTimeout(function () {
            _this.setCanvasSize();
            _this.draw(text);
        }, debounceTime);
    };
    Watermark.prototype.destroy = function () {
        var _this = this;
        var _a = this.cache, observer = _a.observer, canvas = _a.canvas;
        observer.disconnect();
        canvas.parentNode && canvas.parentNode.removeChild(canvas);
        window.removeEventListener('resize', function () { return _this.handleResize(); });
    };
    return Watermark;
}());
exports.Watermark = Watermark;
exports["default"] = Watermark;
