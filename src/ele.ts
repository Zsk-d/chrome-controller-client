import { randomFloat } from "./util"
export const ZskSpiderEle = (eleObj: any, sendCtlMsg: Function): ZskSpiderEle | null => {
    if (!eleObj) return null
    let data = eleObj
    const zse = {
        ...eleObj,
        async click() {
            await sendCtlMsg('eleClick', [data.eleId, data.eleIndex])
        },
        async sendKey(key: string) {
            await sendCtlMsg('eleSendKey', [data.eleId, data.eleIndex, key])
        },
        async sendKeys(keys: string) {
            for (let i = 0; i < keys.length; i++) {
                await zse.sendKey(keys[i])
                await sendCtlMsg('sleep', [randomFloat(0.05, 0.8)])
            }
        },
        async input(strs: string) {
            for (let i = 0; i < strs.length; i++) {
                await sendCtlMsg('eleInput', [data.eleId, data.eleIndex, strs[i]])
                await sendCtlMsg('sleep', [randomFloat(0.05, 0.1)])
            }
        },
    }
    return zse
}