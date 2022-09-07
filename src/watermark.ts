interface Options {
    text?: string;
    positionType?: 'fixed' | 'absolute' | 'static' | 'relative';
    parentSelector?: string;
    canvasClassName?: string;
    gapsX?: number;
    gapsY?: number;
    rotate?: number;
    debounceTime?: number;
    style?: { [props: string]: string };
    canvasStyle?: { [props: string]: string };
    created?: (canvas:HTMLCanvasElement) => (void);
    complete?: () => (void);
}

const DEFAULTS = {
    text: 'watermark',// 水印文本
    positionType: 'fixed', // canvas css position
    parentSelector: 'body', // canvas 父节点元素
    canvasClassName: 'watermark', // canvas className
    gapsX: 20, // 水印 x轴间距
    gapsY: 20, // 水印 y轴间距
    rotate: 45, // 水印 倾斜角度 支持 0 ~ 360 度范围
    debounceTime: 300,// 单位 ms 窗口变化时重新生成水印间隔
    style: {
        font: '16px 微软雅黑',
        fillStyle: '#ddd',
        textBaseline: 'middle'
    }, // ctx 水印 笔触设置
    canvasStyle: {
        left: 0,
        top: 0,
        zIndex: 999,
        pointerEvents: 'none',
        display: 'block'
    }, // canvas css 样式
    created(canvas: HTMLCanvasElement) { // 生成canvas节点后的回调 ，参数canvas 这当前的canvas 元素
        console.log(canvas, 'canvas created');
    },
    complete(ctx: CanvasRenderingContext2D, context: Watermark) { // 完成水印绘制后的回调 参数：ctx 为当前canvas ctx; context 为当前的 Watermark 类实例
        console.log(ctx, context, 'draw completed')
    }
}

export default class Watermark {
    constructor(opt?: Options) {
        let style = {...this.defaults.style, ...opt?.style};
        let canvasStyle = {...this.defaults.canvasStyle, ...opt?.canvasStyle};
        this.options = Object.assign({}, this.defaults, opt, {style, canvasStyle});
    }

    options: { [props: string]: any };

    defaults = DEFAULTS;

    cache: { [props: string]: any } = {}

    initEle(): void {
        const {parentSelector, canvasClassName, positionType, canvasStyle, rotate, created} = this.options;
        let canvas: any = document.createElement('canvas');
        let parent = document.querySelector(parentSelector as string);
        this.cache.parent = parent;
        canvas.class = canvasClassName;
        canvas.style.position = positionType;
        Object.assign(canvas.style, canvasStyle);
        let max = Math.max(parent!.clientWidth, (+parent!.clientHeight || window.innerHeight));
        canvas.width = max;
        canvas.height = max;
        created.apply(this, [canvas]);
        this.cache.canvas = canvas;
        parent!.appendChild(canvas);
        this.cache.ctx = canvas.getContext('2d');
        this.cache.ctx.rotate(rotate * Math.PI / 180);
        canvas.getContext = () => undefined;
        return canvas
    }

    init() {
        const {text} = this.options;
        this.createWatermark(text);
        this.watch(() => {
            this.createWatermark(text);
        })
    }

    createWatermark(text: string) {
        this.initEle();
        this.draw(text);
    }

    setCanvasSize() {
        const {parent,canvas,ctx} = this.cache;
        let max = Math.max(parent.clientWidth, (+parent.clientHeight || window.innerHeight));
        canvas.width = max;
        canvas.height = max;
        ctx.rotate(this.options.rotate * Math.PI / 180);
    }

    clearCanvas() {
        const {canvas, ctx} = this.cache;
        const {rotate} = this.options;
        ctx.rotate(-rotate * Math.PI / 180)
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.rotate(rotate * Math.PI / 180)

    }

    draw(text: string) {
        const {canvas,ctx} = this.cache;
        const {gapsX, gapsY, rotate} = this.options;
        this.options.text = text;
        this.clearCanvas();
        Object.assign(ctx, this.options.style);
        let temp = ctx.measureText(text);
        let textWidth = temp.width + gapsX;
        let textHeight = gapsY + 14 * 1.5;
        let maxWidth = 3 * canvas.width;
        let xCount = Math.ceil(maxWidth / textWidth);
        let yCount = Math.ceil(maxWidth / textHeight);


        for (let x = 0, len = xCount; x < len; x++) {
            for (let y = 0, lenY = yCount; y < lenY; y++) {
                let startOffset = y & 1 ? 0 : textWidth / 5;
                ctx.fillText(text, textWidth * x + startOffset - canvas.height * (Math.ceil(rotate / (rotate > 180 ? 180 : 90)) || 1), textHeight * y - canvas.height * rotate / (rotate > 180 ? 360 : 45));
            }
        }

    }

    watch(userCallBack: () => void) {
        const {positionType, parentSelector: selector, canvasClassName, canvasStyle} = this.options;

        // 选择需要观察变动的节点
        const targetNode = document.querySelector(selector);

        // 观察器的配置（需要观察什么变动）
        const config = {attributes: true, childList: true, subtree: true};

        // 当观察到变动时执行的回调函数
        const callback = function (mutationsList:any[], observer:any) {
            // Use traditional 'for loops' for IE 11
            for (let mutation of mutationsList) {
                if (mutation.type === 'childList') {
                    let len = mutation.removedNodes.length;
                    if (len) {
                        for (let i = 0; i < len; i++) {
                            if (mutation.removedNodes[i].class === canvasClassName) {
                                //watermark(text,rotate);
                                userCallBack()
                            }
                        }
                    }
                } else if (mutation.type === 'attributes') {
                    if (mutation.target.class === canvasClassName && mutation.attributeName === 'style') {
                        mutation.target.style.display = 'block';
                        Object.assign(mutation.target.style, canvasStyle);
                        mutation.target.style.position = positionType;
                    }
                }
            }
        };

        // 创建一个观察器实例并传入回调函数
        const observer = new MutationObserver(callback);

        // 以上述配置开始观察目标节点
        observer.observe(targetNode, config);

        // 之后，可停止观察
        //observer.disconnect();
        this.cache.observer = observer;

        window.addEventListener('resize', () => this.handleResize(), false)
        return observer
    }

    handleResize() {
        const {debounceTime, text} = this.options;
        const cache = this.cache;
        cache._h && clearTimeout(cache._h);
        cache._h = setTimeout(() => {
            this.setCanvasSize();
            this.draw(text)
        }, debounceTime)
    }

    destroy() {
        const {observer, canvas,} = this.cache;
        observer.disconnect();
        canvas.parentNode && canvas.parentNode.removeChild(canvas);
        window.removeEventListener('resize', () => this.handleResize())
    }

}

export {Watermark}