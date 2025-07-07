import request from 'request'

export const req2captcha = async (clientKey: string, websiteURL: string, websiteKey: string): Promise<O2captchaReq> => {
    return new Promise((resolve, reject) => {
        var options = {
            'method': 'POST',
            'url': 'https://api.2captcha.com/createTask',
            'headers': {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                clientKey,
                "task": {
                    "type": "RecaptchaV2TaskProxyless",
                    websiteURL,
                    websiteKey,
                    "isInvisible": false
                }
            })

        }
        
        request(options, function (error, response) {
            if (error) reject(new Error(error))
            resolve(JSON.parse(response.body));
        });
    })
}
export const get2captchaRes = async (taskId: number, clientKey: string): Promise<O2captchaRes> => {
    return new Promise((resolve, reject) => {
        var options = {
            'method': 'POST',
            'url': 'https://api.2captcha.com/getTaskResult',
            'headers': {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                clientKey,
                taskId
            })
        };
        request(options, function (error, response) {
            if (error) reject(new Error(error))
            resolve(JSON.parse(response.body));
        });
    })
}