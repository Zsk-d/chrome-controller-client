# Chrome Controller Client 项目开发文档

## 项目概述

Chrome Controller Client 是一个用于控制 Chrome 浏览器的 Node.js 客户端库，通过 WebSocket 与后端服务通信，提供网页自动化、元素操作、验证码处理等功能。

## 项目结构

```
chrome-controller-client/
├── src/                    # 源代码目录
│   ├── client.ts           # 主要客户端实现
│   ├── ele.ts              # 页面元素操作封装
│   ├── 2captcha.ts         # 2captcha 验证码服务
│   ├── mail.ts             # 邮件收发功能
│   ├── logger.ts           # 日志系统
│   ├── util.ts             # 工具函数
│   └── index.ts            # 入口文件
├── types/                  # 类型定义
│   └── global.d.ts         # 全局类型声明
├── README.md               # 项目说明
├── package.json            # 项目依赖和配置
└── tsconfig.json           # TypeScript 配置
```

## 安装与配置

### 依赖安装

```bash
npm install chrome-controller-client
```

### 依赖项

项目依赖以下核心库：
- `ws`: WebSocket 连接
- `request`: HTTP 请求（用于 2captcha API）
- `nodemailer`: 邮件发送
- `imapflow`: 邮件接收
- `mailparser`: 邮件解析

## 核心功能

### 1. 浏览器控制 (`/src/client.ts`)

#### 初始化客户端

```typescript
import { newZskSpider } from './client';

const client = await newZskSpider({
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
});
```

#### 主要方法

- `openPage(url: string)`: 打开指定URL
- `sleep(s: number)`: 等待指定秒数
- `getElementById(id: string)`: 通过ID获取元素
- `querySelector(selector: string)`: 通过CSS选择器获取元素
- `querySelectorAll(selector: string)`: 获取所有匹配的元素
- `waitUntilSelector(selector: string, timeout?, interval?)`: 等待元素出现
- `clickBySelector(selector: string, wait?, timeout?, interval?)`: 点击元素
- `eval(evalStr: string)`: 在页面执行JavaScript代码
- `clickXY(x: number, y: number)`: 在指定坐标点击
- `screenshot()`: 截图
- `hasGoogleV2()`: 检查页面是否有谷歌reCAPTCHA V2
- `handleGoogleV2(clientKey: string)`: 处理谷歌reCAPTCHA V2
- `hasCloudflareTurnstile()`: 检查是否有Cloudflare Turnstile验证
- `close()`: 关闭连接

### 2. 页面元素操作 (`/src/ele.ts`)

页面元素对象包含以下属性和方法：

```typescript
interface ZskSpiderEle {
  attributes: any,          // 元素属性
  click(): Promise<void>,   // 点击元素
  sendKey(key: string): Promise<void>,  // 发送单个按键
  sendKeys(keys: string): Promise<void>, // 发送多个按键
  parentElement(): Promise<ZskSpiderEle>, // 获取父元素
  text?: string             // 元素文本内容
}
```

示例元素对象：
```json
{
  "tag": "H1",
  "id": null,
  "className": "zone-name-title h1",
  "width": 912,
  "height": 60,
  "x": 496,
  "y": 128,
  "html": "<h1 class=/"zone-name-title h1/">test text</h1>",
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

### 3. 验证码处理 (`/src/2captcha.ts`)

提供对 2captcha 服务的支持，包括：

- 谷歌 reCAPTCHA V2 验证码处理
- Cloudflare Turnstile 验证码处理

主要方法：
- `req2captchaGoogleV2(clientKey, websiteURL, websiteKey)`: 申请谷歌V2验证码任务
- [req2captchaCloudflare(clientKey, task)](/src/2captcha.ts#L35-L37): 申请Cloudflare验证码任务
- [get2captchaRes(taskId, clientKey)](/src/2captcha.ts#L38-L61): 获取验证码处理结果

### 4. 邮件功能 (`/src/mail.ts`)

#### 发送邮件

```typescript
interface SendMailOptions {
  host: string
  port: number
  secure: boolean
  user: string
  pass: string
  from: string
  to: string
  subject: string
  text?: string
  html?: string
}

const result = await sendMail(options);
```

#### 接收邮件

```typescript
interface ReadMailOptions {
  host: string
  port?: number
  secure?: boolean
  user: string
  pass: string
  mailbox?: string
  limit?: number
}

const emails = await readMails(options);
```

## 使用示例

### 基础浏览器操作

```typescript
import { newZskSpider } from './client';

async function example() {
  const client = await newZskSpider({
    maximized: true,
    tcaptchaGoogle: true,
    tcaptchaClentKey: 'your-2captcha-key'
  });

  try {
    // 打开网页
    await client.openPage('https://example.com');
    
    // 等待并点击按钮
    const button = await client.waitUntilSelector('#submit-btn', 10);
    await button.click();
    
    // 输入文本
    const input = await client.querySelector('#username');
    await input.sendKeys('myusername');
    
    // 截图
    const screenshot = await client.screenshot();
    
    // 执行自定义JS
    const title = await client.eval('document.title');
    console.log(title);
    
  } finally {
    client.close();
  }
}
```

### 处理验证码

```typescript
// 检查是否有谷歌reCAPTCHA
if (await client.hasGoogleV2()) {
  await client.handleGoogleV2('your-2captcha-key');
}

// 检查是否有Cloudflare验证
if (await client.hasCloudflareTurnstile()) {
  console.log('需要处理Cloudflare验证');
}
```

### 元素交互

```typescript
// 查找并操作元素
const element = await client.querySelector('.my-class');
if (element) {
  await element.click();
  await element.sendKey('Enter');
  console.log(element.text);
}

// 按坐标点击
await client.clickXY(100, 200);

// 等待元素出现
const dynamicElement = await client.waitUntilSelector('#dynamic-element', 30);
```

## 事件监听

可以添加各种事件监听器来处理网络请求等：

- `addXHROpenEventListener(func)`: 添加XHR open事件监听
- `addXHRSendEventListener(func)`: 添加XHR send事件监听
- `addFetchEventListener(func)`: 添加Fetch事件监听
- `addCloudflareEventListener(func)`: 添加Cloudflare验证事件监听

## 构建与发布

项目使用TypeScript编写，需要编译为JavaScript才能运行。

## 许可证

此项目遵循 MIT 许可证（参见 [/LICENSE](/LICENSE) 文件）。

## 维护者

该项目由开发者维护，如有问题请提交 issue 或 pull request。

---

*文档版本: 1.0*  
*最后更新: 2026-01-26*