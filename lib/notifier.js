"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notify = notify;
const mailtrap_1 = require("mailtrap");
const ts_dotenv_1 = require("ts-dotenv");
const env = (0, ts_dotenv_1.load)({
    MAILTRAP_TOKEN: String,
    EMAIL_SENDER: String,
    EMAIL_RECEIVER: String,
});
const mailtrap = new mailtrap_1.MailtrapClient({ token: env.MAILTRAP_TOKEN });
async function notify(subject, text, html) {
    const from = {
        email: 'mailtrap@demomailtrap.com',
        name: env.EMAIL_SENDER,
    };
    const to = [
        {
            email: env.EMAIL_RECEIVER,
        },
    ];
    const mail = await mailtrap.send({
        from,
        to,
        subject,
        text,
        html,
        category: 'manga-mailer',
    });
    return {
        id: mail.message_ids[0],
        sent: mail.success,
    };
}
