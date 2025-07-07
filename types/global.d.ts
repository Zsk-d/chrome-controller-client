export { ZskClient }

declare global {
    type ZskSpiderEle = {
        click: Function,
        sendKey: Function,
        sendKeys: Function,
        input: Function
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
        loc?: string | null
    }
    type ZskClient = {
        sleep: Function,
        reload: Function,
        openPage: Function,
        close: Function,
        waitUntilSelector: Function,
        waitUntilSelectorAll: Function,
        querySelector: Function,
        querySelectorAll: Function,
        getElementById: Function,
        getElementsByClassName: Function,
        getUrl: Function,
        eval: Function,
        clickBySelector: Function,
        randomSleep: Function,
        hasGoogleV2: Function,
        handleGoogleV2: Function,
    }
}