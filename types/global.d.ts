export { ZskClient }

declare global {
    type ZskSpiderEle = {
        click: () => Promise<void>,
        sendKey: (key: string) => Promise<void>,
        sendKeys: (keys: string) => Promise<void>,
    }

    type ZskClientData = {
        resolve: null | ((value: T | PromiseLike<T>) => void),
        reject: null | ((reason: Error) => void)
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
    type ZskClientOption = {
        maximized?: boolean,
        disableSystemProxy?: boolean,
        ctlResTimeout?: number,
        proxy?: string | null,
        loc?: string | null,
        // 是否保存userdata
        keepUserdata?: boolean,
        // 保存的sessionid的userdata
        sessionId?: string,
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
        clickBySelector: (selector: string) => Promise<ZskSpiderEle>,
        eval: (url: string) => Promise<any>,
        handleGoogleV2: (key: string) => void,
        hasGoogleV2: () => Promise<boolean>,
        randomSleep: () => Promise<void>
    }
}