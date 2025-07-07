export { }

declare global {
    type ZskSpiderEle = {
        click: Function,
        sendKey: Function,
        sendKeys: Function,
        input: Function
    }

    type ZskClient = {
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
}