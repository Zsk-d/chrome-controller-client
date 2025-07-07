import { ZskSpiderEle } from "./ele"
import { randomFloat } from "./util"
import { getLogger } from "./logger"

import { req2captcha, get2captchaRes } from './2captcha'
import WebSocket from 'ws'

const logger = getLogger(__filename)

/**
 * 创建一个浏览器客户端
 * @param config 
 * @returns 
 */
export const newZskSpider = async (config: ZskClientOption): Promise<ZskClient> => {

	const data: ZskClientData = {
		resolve: null,
		reject: null,
	}

	const ws = new WebSocket("ws://localhost:8899");
	const reg = (ws: WebSocket) => {
		ws.send(JSON.stringify({
			"type": "ctlReg",
			data: {
				config
			}
		}));
	}
	const checkRes = (res: any, reject: ((reason: Error) => void) | null) => {
		if (res.status !== 200 && reject) {
			reject(new Error(`[Client] 请求失败，状态码：${res.status}, 原因: ${res.msg}`))
			return false
		}
		return true
	}
	const sendCtlMsg = async (command: string, args: any[] = [], timeout = 60): Promise<any> => {
		return await new Promise(async (resolve, reject) => {
			// logger.info(`[Client] 新resolve-------------`, command);
			data.resolve = resolve;
			data.reject = reject;
			let msgStr = JSON.stringify({
				"type": "ctl-send",
				"command": command,
				"args": args,
				timeout
			})
			ws.send(msgStr);
			logger.info(`[Client] 发送消息: ${msgStr}`)
		})
	}
	const sendCtlWindow = async (command: string, args = [], timeout = 60) => {
		return await new Promise(async (resolve, reject) => {
			// logger.info(`[Client] 新resolve-------------`, command);
			data.resolve = resolve;
			data.reject = reject;
			ws.send(JSON.stringify({
				"type": "ctlWindow",
				"command": command,
				"args": args,
				timeout
			}));
		})
	}
	await new Promise(async (resolve, reject) => {
		// logger.info(`[Client] 注册 resolve-------------`);
		data.resolve = resolve;
		data.reject = reject;
		ws.on("open", () => {
			// 注册控制会话
			logger.info("[client] 注册控制端");
			reg(ws);
		})
		// 接收消息
		ws.onmessage = (event: any) => {
			console.debug("[Transfer server] 收到消息：", event.data);
			let msg = JSON.parse(event.data);
			if (msg.type === 'ctl-res') {
				if (data.resolve !== null) {
					if (checkRes(msg.data, data.reject)) {
						data.resolve(msg.data.data)
						data.resolve = null
						data.reject = null
						// logger.info(`[Client] resolve调用--------`);
					}
				}
			}
		}
	})
	let action: ZskClient = {
		async openPage(url: string): Promise<void> {
			logger.info("[Client] 打开页面", url);
			await sendCtlMsg('openPage', [url])
		},
		async sleep(s: number): Promise<void> {
			logger.info("[Client] 等待", s, '秒');
			// await sendCtlMsg( 'sleep', [s])
			await new Promise(resolve => setTimeout(resolve, s * 1000));
		},
		async getElementById(id: string): Promise<ZskSpiderEle> {
			logger.info("[Client] 按id获取元素", id);
			let res = await sendCtlMsg('getElementById', [id])
			return ZskSpiderEle(res, sendCtlMsg)
		},
		/**
		 * 使用css 选择器获取元素
		 * @param selector 
		 * @returns 
		 */
		async querySelector(selector: string): Promise<ZskSpiderEle> {
			logger.info("[Client] 按selector获取元素", selector);
			let res = await sendCtlMsg('querySelector', [selector])
			return ZskSpiderEle(res, sendCtlMsg)
		},
		async getElementsByClassName(className: string): Promise<ZskSpiderEle[]> {
			logger.info("[Client] 按class获取元素", className);
			let res = await sendCtlMsg('getElementsByClassName', [className])
			return res.map((item: any) => ZskSpiderEle(item, sendCtlMsg))
		},
		async querySelectorAll(selector: string): Promise<ZskSpiderEle[]> {
			logger.info("[Client] 按selector获取元素", selector);
			let res = await sendCtlMsg('querySelectorAll', [selector])
			return res.map((item: any) => ZskSpiderEle(item, sendCtlMsg))
		},
		/**
		 * 等待元素出现, 未出现时抛出异常
		 * @param {*} selector 
		 * @param {*} timeout 
		 * @param {*} interval 
		 * @returns ele
		 */
		async waitUntilSelector(selector: string, timeout = 30, interval = 1): Promise<ZskSpiderEle> {
			logger.info("[Client] 按selector等待元素出现", selector);
			let res = await sendCtlMsg('waitUntilSelector', [selector, timeout, interval])
			return ZskSpiderEle(res, sendCtlMsg)
		},
		async waitUntilSelectorAll(selector: string, timeout = 10, interval = 1): Promise<ZskSpiderEle[]> {
			logger.info("[Client] 按selector等待所有元素出现", selector);
			let res = await sendCtlMsg('waitUntilSelectorAll', [selector, timeout, interval])
			return res.map((item: any) => ZskSpiderEle(item, sendCtlMsg))
		},
		/**
		 * 点击元素
		 * @param {*} selector 
		 * @param {*} wait 
		 * @param {*} timeout 
		 * @param {*} interval 
		 */
		async clickBySelector(selector: string, wait = false, timeout = 10, interval = 1) {
			let func = null
			if (wait) {
				func = this.waitUntilSelector
			} else {
				func = this.querySelector
			}
			let ele = await func(selector, timeout, interval)
			if (ele) {
				await ele.click()
				return ele
			} else {
				throw new Error("点击元素失败, 元素不存在");
			}
		},
		async randomSleep(min = 0, max = 1): Promise<void> {
			let value = randomFloat(min, max)
			await this.sleep(value)
		},
		async getUrl(tabIndex = 0) {
			// 获取某个页面的url
			return await sendCtlMsg("getUrl", [tabIndex])
		},
		async reload(tabIndex = 0) {
			// 重新加载页面
			return await sendCtlMsg("reload", [tabIndex])
		},
		async eval(evalStr: string) {
			// 执行eval
			return await sendCtlMsg("getEval", [evalStr])
		},
		async hasGoogleV2() {
			// 检查页面上是否有谷歌v2验证
			logger.info('检查页面上是否有谷歌v2验证')
			try {
				await this.querySelector('iframe[style="width: 400px; height: 580px;"]')
				return true
			} catch (error) {
				return false
			}
		},
		/**
		 * 
		 * @param {*} clientKey 
		 * @returns 
		 */
		async handleGoogleV2(clientKey: string) {
			await this.sleep(5)
			// 检查是否有google v2验证
			let res = await this.eval('(()=>{return getRecaptchaClients()})()')
			logger.info('google v2验证:', res)
			if (res && res.length > 0) {
				let siteKey = res[0].sitekey
				let version = res[0].version
				let callback = res[0].callback
				let pageurl = res[0].pageurl
				let func = res[0].function
				// 申请验证码
				let reqRes = await req2captcha(clientKey, pageurl, siteKey)
				if (reqRes.errorId !== 0) {
					throw new Error("2captcha 任务申请错误 " + reqRes);
				}
				// 保存并轮询
				let taskId = reqRes.taskId
				let startTime = new Date().getTime()
				while (true) {
					logger.info(`获取2captcha 结果 ${taskId}...`)
					let taskRes = await get2captchaRes(taskId, clientKey)
					if (taskRes.errorId === 0) {
						// 判断任务状态
						if (taskRes.status === "ready") {
							logger.info("[Client] google v2 验证任务完成");
							// 处理完成
							let token = taskRes.solution.token
							// 执行代码
							await this.eval(`window['${func}']('${token}')`)
							await this.sleep(5)
							logger.info("[Client] google v2 执行验证");
							break
						} else if (taskRes.status === "processing") {
							// 正在处理2captcha
							logger.info(`[Client] google v2 验证任务执行中, 已等待${((new Date().getTime() - startTime) / 1000)}秒`);
							await this.sleep(5)
							continue
						} else {
							throw new Error("2captcha 获取任务错误 " + taskRes);
						}
					} else {
						throw new Error("2captcha 获取任务错误 " + taskRes);
					}
				}
				return true
			}
		},
		close() {
			ws.close()
		}
	}
	return action
}