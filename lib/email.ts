import { createTransport } from 'nodemailer';

import { createChildLogger } from '@/lib/log';

declare global {
  // eslint-disable-next-line ts/no-namespace
  namespace NodeJS {
    interface ProcessEnv {
      MAIL_HOST: string;
      MAIL_PORT: string;
      MAIL_USER: string;
      MAIL_PASS: string;
      EMAIL_SENDER: string;
    }
  }
}

interface MailOptions {
  to: string;
  subject: string;
  text?: string;
  html: string;
}

const logger = createChildLogger('email');

const transporter = createTransport({
  host: process.env.MAIL_HOST,
  port: Number.parseInt(process.env.MAIL_PORT ?? '2525', 10),
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

if (process.env.NODE_ENV !== 'test') {
  transporter.verify((error) => {
    if (error) {
      logger.error({ error }, 'Error configuring mail transporter');
    } else {
      logger.info('Mail transporter configured successfully. Ready to send emails (to Mailtrap).');
    }
  });
}

export async function sendEmail(options: MailOptions): Promise<boolean> {
  if (process.env.NODE_ENV === 'test' && process.env.ACTUALLY_SEND_MAIL_IN_TEST !== 'true') {
    logger.info({ options }, 'Email sending skipped in test environment (unless ACTUALLY_SEND_MAIL_IN_TEST is true).');
    return true;
  }

  const mailData = {
    from: process.env.EMAIL_SENDER,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  };

  try {
    logger.info({ to: options.to, subject: options.subject }, 'Attempting to send email...');
    const info = await transporter.sendMail(mailData);
    logger.info({ messageId: info.messageId, accepted: info.accepted, response: info.response }, 'Email sent successfully');

    return info.accepted.length > 0;
  } catch (error) {
    logger.error({ to: options.to, subject: options.subject }, 'Error sending email');
    logger.info(error);

    return false;
  }
}
