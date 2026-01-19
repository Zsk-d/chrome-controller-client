export { ZskClient }

declare global {
    type ZskSpiderEle = {
        attributes: any,
        click: () => Promise<void>,
        sendKey: (key: string) => Promise<void>,
        sendKeys: (keys: string) => Promise<void>,
        parentElement: () => Promise<ZskSpiderEle>,
        text?: string
    }
    type XHROpenHijackArgs = {
        method: string,
        url: string,
        async: boolean,
        user: string,
        password: string
    }
    type XHROpenEventData = {
        id: number,
        args: XHROpenHijackArgs
    }
    type XHRSendEventData = {
        id: number,
    }
    /**
     * async = true: 只监听, 不处理数据
     * async = false: 监听并同步处理数据
     */
    type ExtEventListener = (eventData: any) => void;
    type ZskClientData = {
        resolve: null | ((value: T | PromiseLike<T>) => void),
        reject: null | ((reason: Error) => void),
        eventLiseners: { [eventName: string]: ExtEventListener[] }
    }
    type O2captchaReq = {
        errorId: number,
        taskId: number,
    }
    type O2captchaResSolution = {
        token: string
    }
    type O2captchaRes = {
        errorId: number,
        solution: O2captchaResSolution,
        status: string
    }
    type Logger = {
        info: Function,
        debug: Function,
        warn: Function,
        error: Function,
    }
    type FetchArgs = [input: string | Request, init?: RequestInit]
    type ZskClientOption = {
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
    }
    type ZskClient = {
        sleep: (s: number) => Promise<void>,
        reload: () => Promise<void>,
        openPage: (url: string) => Promise<void>,
        close: () => void,
        waitUntilSelector: (selector: string, timeout = 30, interval = 1) => Promise<ZskSpiderEle>,
        waitUntilSelectorAll: (selector: string, timeout = 30, interval = 1) => Promise<ZskSpiderEle[]>,
        querySelector: (selector: string) => Promise<ZskSpiderEle>,
        querySelectorAll: (selector: string) => Promise<ZskSpiderEle[]>,
        getElementById: (id: string) => Promise<ZskSpiderEle>,
        getElementsByClassName: (className: string) => Promise<ZskSpiderEle[]>,
        getUrl: () => Promise<string>,
        clickXY: (x: number, y: number) => Promise<void>,
        touchXY: (x: number, y: number) => Promise<void>,
        screenshot: () => Promise<string>,
        clickBySelector: (selector: string) => Promise<ZskSpiderEle>,
        eval: (url: string) => Promise<any>,
        handleGoogleV2: (key: string) => Promise<void>,
        prepareGoogleV2: (key: string) => Promise<void>,
        hasGoogleV2: () => Promise<boolean>,
        hasCloudflareTurnstile: () => Promise<boolean>,
        randomSleep: (min: number, max: number) => Promise<void>,
        addXHROpenEventListener: (func: ExtEventListener) => void,
        addXHRSendEventListener: (func: ExtEventListener) => void,
        addFetchEventListener: (func: ExtEventListener) => void,
        addCloudflareEventListener: (func: ExtEventListener) => void,
        onEvent: (eventNme: string, eventData: any) => Promise<void>,
        closeOtherTab: () => Promise<void>,
    }
    type XHRHijeckData = {

    }
}