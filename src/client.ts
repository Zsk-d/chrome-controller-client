import { ZskSpiderEle } from "./ele"
import { randomFloat } from "./util"
import { getLogger } from "./logger"

import { req2captchaGoogleV2, req2captchaCloudflare, get2captchaRes } from './2captcha'
import WebSocket from 'ws'

const logger = getLogger(__filename)

/**
 * 创建一个浏览器客户端
 * @param config 
 * @returns 
 */
export const newZskSpider = async (config: ZskClientOption = {}): Promise<ZskClient> => {

	const data: ZskClientData = {
		resolve: null,
		reject: null,
		eventLiseners: {},
	}

	const ws = new WebSocket("ws://localhost:8899");
	const reg = (ws: WebSocket) => {
		// 检查劫持函数
		if (config.hijackFuncs) {
			for (const [key, value] of Object.entries(config.hijackFuncs)) {
				if (typeof value === 'function') {
					config.hijackFuncs[key as keyof typeof config.hijackFuncs] = value.toString();
				}
			}
		}
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
			// logger.debug(`[Client] 新resolve-------------`, command);
			data.resolve = resolve;
			data.reject = reject;
			let msgStr = JSON.stringify({
				"type": "ctl-send",
				"command": command,
				"args": args,
				timeout
			})
			ws.send(msgStr);
			logger.debug(`[Client] 发送消息: ${msgStr}`)
		})
	}
	/**
	 * 发送拦截事件响应
	 * @param eventName 
	 * @param eventData 
	 */
	const sendAddHijackFuncMsg = (name: string, funcStr: string) => {
		ws.send(JSON.stringify({
			type: "ext-add-hijack-func",
			data: { name, funcStr }
		}));
	}
	const sendCtlWindow = async (command: string, args = [], timeout = 60) => {
		return await new Promise(async (resolve, reject) => {
			logger.debug(`[Client] 新resolve-------------`, command);
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
		// logger.debug(`[Client] 注册 resolve-------------`);
		data.resolve = resolve;
		data.reject = reject;
		ws.on("open", () => {
			// 注册控制会话
			logger.debug("[client] 注册控制端");
			reg(ws);
		})
		// 接收消息
		ws.onmessage = async (event: any) => {
			logger.debug("[Transfer server] 收到消息：", event.data);
			let msg = JSON.parse(event.data);
			if (msg.type === 'ctl-res') {
				if (data.resolve !== null) {
					if (checkRes(msg.data, data.reject)) {
						data.resolve(msg.data.data)
						data.resolve = null
						data.reject = null
						// logger.debug(`[Client] resolve调用--------`);
					}
				}
			} else if (msg.type === 'ext-event') {
				// 事件回调
				let { eventName, eventData } = msg.data
				await client.onEvent(eventName, eventData)
			}
		}
	})
	let client: ZskClient = {
		async openPage(url: string): Promise<void> {
			logger.debug("[Client] 打开页面", url);
			await sendCtlMsg('openPage', [url])
		},
		async sleep(s: number): Promise<void> {
			logger.debug("[Client] 等待", s, '秒');
			// await sendCtlMsg( 'sleep', [s])
			await new Promise(resolve => setTimeout(resolve, s * 1000));
		},
		async getElementById(id: string): Promise<ZskSpiderEle> {
			logger.debug("[Client] 按id获取元素", id);
			let res = await sendCtlMsg('getElementById', [id])
			return ZskSpiderEle(res, sendCtlMsg)
		},
		/**
		 * 使用css 选择器获取元素
		 * @param selector 
		 * @returns 
		 */
		async querySelector(selector: string): Promise<ZskSpiderEle> {
			logger.debug("[Client] 按selector获取元素", selector);
			let res = await sendCtlMsg('querySelector', [selector])
			return ZskSpiderEle(res, sendCtlMsg)
		},
		async getElementsByClassName(className: string): Promise<ZskSpiderEle[]> {
			logger.debug("[Client] 按class获取元素", className);
			let res = await sendCtlMsg('getElementsByClassName', [className])
			return res.map((item: any) => ZskSpiderEle(item, sendCtlMsg))
		},
		async querySelectorAll(selector: string): Promise<ZskSpiderEle[]> {
			logger.debug("[Client] 按selector获取元素", selector);
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
			logger.debug("[Client] 按selector等待元素出现", selector);
			let res = await sendCtlMsg('waitUntilSelector', [selector, timeout, interval])
			return ZskSpiderEle(res, sendCtlMsg)
		},
		async waitUntilSelectorAll(selector: string, timeout = 10, interval = 1): Promise<ZskSpiderEle[]> {
			logger.debug("[Client] 按selector等待所有元素出现", selector);
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
			let ele = null
			try {
				ele = await func(selector, timeout, interval)
			} catch (error) {
			}
			if (ele) {
				await this.sleep(1)
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
		/**
		 * 按坐标点击页面
		 * @param x 
		 * @param y 
		 */
		async clickXY(x: number, y: number) {
			return await sendCtlMsg("clickXY", [x, y])
		},
		async touchXY(x: number, y: number) {
			return await sendCtlMsg("touchXY", [x, y])
		},
		async screenshot(): Promise<string> {
			return await sendCtlMsg("screenshot")
		},
		async hasGoogleV2(): Promise<boolean> {
			// 检查页面上是否有谷歌v2验证
			logger.debug('检查页面上是否有谷歌v2验证')
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
		async handleGoogleV2(clientKey: string): Promise<void> {
			await this.sleep(5)
			// 检查是否有google v2验证
			let res = await this.eval('(()=>{return window.getRecaptchaClients()})()')
			logger.debug('google v2验证:', res)
			if (res && res.length > 0) {
				let siteKey = res[0].sitekey
				let version = res[0].version
				let callback = res[0].callback
				let pageurl = res[0].pageurl
				let func = res[0].function
				// 申请验证码
				let reqRes = await req2captchaGoogleV2(clientKey, pageurl, siteKey)
				if (reqRes.errorId !== 0) {
					throw new Error("2captcha 任务申请错误 " + reqRes);
				}
				// 保存并轮询
				let taskId = reqRes.taskId
				let startTime = new Date().getTime()
				while (true) {
					logger.debug(`获取2captcha 结果 taskid:${taskId} ...`)
					let taskRes = await get2captchaRes(taskId, clientKey)
					if (taskRes.errorId === 0) {
						// 判断任务状态
						if (taskRes.status === "ready") {
							logger.debug("[Client] google v2 验证任务完成");
							// 处理完成
							let token = taskRes.solution.token
							// 执行代码
							await this.eval(`window['${func}']('${token}')`)
							await this.sleep(5)
							logger.debug("[Client] google v2 执行验证");
							break
						} else if (taskRes.status === "processing") {
							// 正在处理2captcha
							logger.debug(`[Client] google v2 验证任务执行中, 已等待${((new Date().getTime() - startTime) / 1000)}秒`);
							await this.sleep(5)
							continue
						} else {
							throw new Error("2captcha 获取任务错误 " + taskRes);
						}
					} else {
						throw new Error("2captcha 获取任务错误 " + taskRes);
					}
				}
			}
		},
		async hasCloudflareTurnstile(): Promise<boolean> {
			// 检查是否开启了对应的开关
			if (!config.tcaptchaCloudflare) {
				logger.warn(("未开启cloudflare人机识别开关, 无法处理验证流程, 请设定client(option.tcaptchaCloudflare=true)"))
			}

			await this.sleep(5)
			// 先确定是否有 '.zone-name-title.h1'
			try {
				await this.querySelector('.zone-name-title.h1')
				// 有验证
				// 检查是否需要刷新页面中断验证过程
				try {
					await this.querySelector('input[name="cf-turnstile-response"]')
					// 刷新页面
					await this.reload()
					// 等待重试
					await this.sleep(5)
				} catch (error) {
					// 已经卡住, 直接等待打码
				}
				return true
			} catch (error) {
				return false
			}
		},
		async closeOtherTab(){
			return await sendCtlMsg("closeOtherTab", [])
		},
		/**
		 * 添加xhr open 事件监听
		 * @param xhrOpenEventData 
		 * @returns 
		 */
		addXHROpenEventListener(func: ExtEventListener): void {
			if (!data.eventLiseners['XHROpenEvent']) {
				data.eventLiseners['XHROpenEvent'] = []
			}

			data.eventLiseners['XHROpenEvent'].push(func)
		},
		/**
		 * 添加xhr send 事件监听
		 * @param func 
		 */
		addXHRSendEventListener(func: ExtEventListener): void {
			if (!data.eventLiseners['XHRSendEvent']) {
				data.eventLiseners['XHRSendEvent'] = []
			}

			data.eventLiseners['XHRSendEvent'].push(func)
		},
		/**
		 * 添加fetch事件监听
		 * @param func 
		 */
		addFetchEventListener(func: ExtEventListener): void {
			if (!data.eventLiseners['FetchEvent']) {
				data.eventLiseners['FetchEvent'] = []
			}

			data.eventLiseners['FetchEvent'].push(func)
		},
		addCloudflareEventListener(func: ExtEventListener): void {
			if (!data.eventLiseners['ClouflareTurnstileEvent']) {
				data.eventLiseners['ClouflareTurnstileEvent'] = []
			}

			data.eventLiseners['ClouflareTurnstileEvent'].push(func)
		},

		/**
		 * 
		 * @param eventNme 接收扩展发送的事件
		 * @param eventData 返回给事件发送方
		 */
		async onEvent(eventNme: string, eventData: any): Promise<void> {
			logger.debug(`收到扩展事件: ${eventNme} ${eventData}`)
			// 开始分发事件
			let listeners = data.eventLiseners[eventNme]
			if (listeners && listeners.length > 0) {
				// 调用事件处理
				for (let index = 0; index < listeners.length; index++) {
					await listeners[index](eventData)
				}
			}
		},
		close() {
			ws.close()
		}
	}
	// 添加cloudflare验证码解决监听
	client.addCloudflareEventListener(async (eventData) => {
		// eventData 为 req的 task 部分
		let tcaptchaClentKey = config.tcaptchaClentKey
		if (!tcaptchaClentKey) {
			logger.warn('收到cloudflare验证请求, 无clentKey无法处理验证流程, 请配置client(opttion.tcaptchaClentKey)')
			return
		}
		// 请求2captcha解码
		// 申请验证码
		let reqRes = await req2captchaCloudflare(tcaptchaClentKey, eventData)
		if (reqRes.errorId !== 0) {
			throw new Error("2captcha 任务申请错误 " + reqRes);
		}
		// 保存并轮询
		let taskId = reqRes.taskId
		let startTime = new Date().getTime()
		while (true) {
			logger.debug(`获取2captcha 结果 taskid:${taskId} ...`)
			let taskRes = await get2captchaRes(taskId, tcaptchaClentKey)
			if (taskRes.errorId === 0) {
				// 判断任务状态
				if (taskRes.status === "ready") {
					logger.debug("[Client] cloudflare 验证任务完成");
					// 处理完成
					let token = taskRes.solution.token
					// 执行代码
					await client.eval(`window.tsCallback('${token}')`)
					break
				} else if (taskRes.status === "processing") {
					// 正在处理2captcha
					logger.debug(`[Client] cloudflare 验证任务执行中, 已等待${((new Date().getTime() - startTime) / 1000)}秒`);
					await client.sleep(5)
					continue
				} else {
					throw new Error("2captcha 获取任务错误 " + taskRes);
				}
			} else {
				throw new Error("2captcha 获取任务错误 " + taskRes);
			}
		}
	})
	return client
}