import { createTransport } from 'nodemailer';

import { logger } from '@/lib/logger';

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
      logger.error('[Email] Error configuring mail transporter', { error });
    } else {
      logger.info('[Email] Mail transporter configured successfully. Ready to send emails (to Mailtrap).');
    }
  });
}

export async function sendEmail(options: MailOptions): Promise<boolean> {
  if (process.env.NODE_ENV === 'test' && process.env.ACTUALLY_SEND_MAIL_IN_TEST !== 'true') {
    logger.info('[Email] Email sending skipped in test environment (unless ACTUALLY_SEND_MAIL_IN_TEST is true).', { options });
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
    logger.info('[Email] Attempting to send email...', { to: options.to, subject: options.subject });
    const info = await transporter.sendMail(mailData);
    logger.info('[Email] Email sent successfully', { messageId: info.messageId, accepted: info.accepted, response: info.response });
    return info.accepted.length > 0;
  } catch (error) {
    logger.error('[Email] Error sending email', { error, to: options.to, subject: options.subject });
    return false;
  }
}

// Esempio di utilizzo (puoi metterlo in una funzione di test temporanea o in un endpoint API)
export async function sendTestEmail() {
  const success = await sendEmail({
    to: 'test-recipient@example.com', // Questo andrà alla tua inbox Mailtrap
    subject: 'Manga Mailer - Test Email via Mailtrap',
    html: '<h1>Ciao!</h1><p>Questa è un\'email di test da Manga Mailer inviata tramite Mailtrap.</p>',
    text: 'Ciao! Questa è un\'email di test da Manga Mailer inviata tramite Mailtrap.',
  });

  if (success) {
    logger.info('[Email Test] Test email inviata (controlla Mailtrap).');
  } else {
    logger.error('[Email Test] Fallimento invio test email.');
  }
}
