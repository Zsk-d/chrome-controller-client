import nodemailer from 'nodemailer'
import { ImapFlow } from 'imapflow'
import { simpleParser } from 'mailparser'

// --------------------- 发送邮件 ------------------------

export interface SendMailOptions {
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

export const sendMail = async (options: SendMailOptions): Promise<nodemailer.SentMessageInfo> => {
    const transporter = nodemailer.createTransport({
        host: options.host,
        port: options.port,
        secure: options.secure,
        auth: {
            user: options.user,
            pass: options.pass,
        },
    })

    const info = await transporter.sendMail({
        from: options.from,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
    })

    return info
}

// --------------------- 读取邮件 ------------------------

export interface ReadMailOptions {
    host: string
    port?: number
    secure?: boolean
    user: string
    pass: string
    mailbox?: string
    limit?: number
}

export interface ReadMailItem {
    seq: number
    subject: string
    from?: string
    date?: Date
    text?: string
    html?: string
}

type EnvelopeLike = {
    subject?: string
    from?: Array<{ address?: string }>
    date?: Date
}

export const readMails = async (options: ReadMailOptions): Promise<ReadMailItem[]> => {
    const client = new ImapFlow({
        host: options.host,
        port: options.port ?? 993,
        secure: options.secure ?? true,
        auth: {
            user: options.user,
            pass: options.pass,
        },
    })

    await client.connect()
    const mailbox = options.mailbox ?? 'INBOX'
    const limit = options.limit ?? 10
    const mails: ReadMailItem[] = []

    try {
        const lock = await client.getMailboxLock(mailbox)
        try {
            if (!client.mailbox) {
                throw new Error('无法获取邮箱信息')
            }

            const start = Math.max(1, client.mailbox.exists - limit + 1)
            const messages = client.fetch({ seq: `${start}:*` }, { envelope: true, source: true })

            for await (const msg of messages) {
                const env = msg.envelope as EnvelopeLike
                if (!msg.source) {
                    throw new Error('邮件内容为空');
                }
                const parsed = await simpleParser(msg.source)

                mails.push({
                    seq: msg.seq,
                    subject: env.subject ?? '(无主题)',
                    from: env.from?.[0]?.address,
                    date: env.date,
                    text: parsed.text ?? '',
                    html: parsed.html === false ? undefined : parsed.html,
                })
            }
        } finally {
            lock.release()
        }
    } finally {
        await client.logout()
    }

    return mails
}
