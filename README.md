# watermark
利用canvas元素在页面打水印，支持 0 ~ 360 度文本水印，提供更新、销毁水印方法。提供typescript、js 版本

#### 使用方式

    import Watermark from "./watermark.ts";

    let instance = new Watermark({
        text: 'watermark' // 水印文本
    });
    instance.init(); // 初始化水印


#### 默认配置项
    {
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
    

#### 提供的方法
    let instance = new Watermark({
        text: 'watermark' // 水印文本
    });

    instance.init(); // 初始化水印，会生成canvas 节点及监听 水印元素
    instance.destory(); // 销毁水印相关的元素、监听
    instance.draw(text); // 绘制水印


