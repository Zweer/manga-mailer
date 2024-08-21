import { Address, MailtrapClient } from 'mailtrap';
import { load } from 'ts-dotenv';

interface NotifyOutput {
  sent: boolean;
  id: string;
}

const env = load({
  MAILTRAP_TOKEN: String,
  EMAIL_SENDER: String,
  EMAIL_RECEIVER: String,
});

const mailtrap = new MailtrapClient({ token: env.MAILTRAP_TOKEN });

export async function notify(subject: string, text: string, html: string): Promise<NotifyOutput> {
  const from: Address = {
    email: 'mailtrap@demomailtrap.com',
    name: env.EMAIL_SENDER,
  };

  const to: Address[] = [
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
