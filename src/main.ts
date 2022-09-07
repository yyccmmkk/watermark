// @ts-ignore
import Watermark from "./watermark.ts";

let instance = new Watermark({
    text: 'watermark',
    style: {
        fillStyle:"#00ffaa"
    },
    created(canvas:any):void {
        console.log('custom canvas created');
    }
})
instance.init();