# index.ts
使用 client.ts 的 newZskSpider 构建 ZskClient [定义代码](./types/global.d.ts#L130-L154)
```
const client = newZskSpider({
        /**
         * 是否最大化窗口
         */
        maximized?: boolean,
        /**
         * 是否忽略代理, 同时忽略proxy参数的代理
         */
        disableSystemProxy?: boolean,
        /**
         * 全局的被控端响应时间
         */
        ctlResTimeout?: number,
        /**
         * 代理地址
         */
        proxy?: string | null,
        /**
         * 伪装位置, 大写两位国家代码 如JP/IT/CA/US
         */
        loc?: string | null,
        /**
         * 是否保存userdata
         */
        keepUserdata?: boolean,
        /**
         * 保存的sessionid的userdata
         */
        sessionId?: string,
        /**
         * 指定浏览器窗口位置 x,y
         */
        windowPosition?: string,
        /**
         * 是否启用xhr劫持
         */
        xhrHijack?: boolean,
        /**
         * 是否启用fetch劫持
         */
        fetchHijack?: boolean,
        /**
         * 开启谷歌人机识别
         */
        tcaptchaGoogle?: boolean,
        /**
         * 开启cloudflare人机识别
         */
        tcaptchaCloudflare?: boolean,
        /**
         * 2captcha的apikey
         */
        tcaptchaClentKey?: string,
        /**
         * 劫持函数, 不可调试, 会以func.toString() 形式传递给js注入脚本, 并以eval形式执行, 所以箭头函数的上下文不会生效
         * 现有: xhr open/ xhr send/ fetch args/ fetch res
         */
        hijackFuncs?: {
            /**
             * 提供参数列表, 可以劫持修改参数
             */
            xhrOpenEventHijackFunc?: ((...args: any[]) => any) | string,
            /**
             * 提供请求和响应数据, 可以劫持修改响应text
             */
            xhrSendEventHijackFunc?: ((reqData: any, resText: string) => any) | string,
            /**
             * 劫持 fetch参数 和 options
             */
            fetchArgsHijackFunc?: ((input: string | Request, init: RequestInit) => any) | string,
            /**
             * 劫持 fetch响应结果
             */
            fetchResHijackFunc?: ((req: FetchArgs, res: any) => any) | string
        }
    })
```
# ele.ts
client 获取到的页面元素对象(querySelector/getElementById/...)
可 点击/触摸/发送按键

同时包含页面元素属性

例:
```
{
        "tag": "H1",
        "id": null,
        "className": "zone-name-title h1",
        "width": 912,
        "height": 60,
        "x": 496,
        "y": 128,
        "html": "<h1 class=\"zone-name-title h1\">test text</h1>",
        "text": "test text",
        "href": null,
        "visible": true,
        "display": "block",
        "visibility": "visible",
        "opacity": "1",
        "position": "static",
        "zIndex": "auto",
        "color": "rgb(49, 49, 49)",
        "backgroundColor": "rgba(0, 0, 0, 0)",
        "fontSize": "40px",
        "fontWeight": "500",
        "overflow": "visible",
        "pointerEvents": "auto",
        "boxSizing": "border-box",
        "margin": "0px",
        "padding": "0px",
        "border": "0px none rgb(49, 49, 49)",
        "attributes": {
            "class": "zone-name-title h1"
        },
        "childrenCount": 0,
        "clickable": false,
        "cssSelector": "html:nth-child(1) > body:nth-child(5) > div.main-wrapper:nth-child(1) > div.main-content:nth-child(1) > h1.zone-name-title.h1:nth-child(1)",
        "eleId": "a94e43c0-7377-4c2e-8830-8813c3279911"
}
```
# 2captcha.ts
2captcha 任务申请/获取结果

支持: google reCAPTCHA v2 和 Cloudflare turnstile
# mail.ts
收发邮件
