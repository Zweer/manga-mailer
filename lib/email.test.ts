import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { loggerWriteSpy } from '@/test/log';

import { sendEmail } from './email';

const mocks = vi.hoisted(() => {
  return {
    sendMail: vi.fn(),
    verify: vi.fn(),
  };
});

vi.mock(import('nodemailer'), () => {
  return {
    createTransport: () => ({
      sendMail: mocks.sendMail,
      verify: mocks.verify,
    }),
  } as any;
});

describe('lib -> email', () => {
  const originalNodeEnv = process.env.NODE_ENV;
  const originalActuallySendMailFlag = process.env.ACTUALLY_SEND_MAIL_IN_TEST;

  const emailOptions = {
    to: 'recipient@example.com',
    subject: 'Test Subject',
    html: '<p>Test HTML</p>',
    text: 'Test Text',
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    // @ts-expect-error node env is not readonly
    process.env.NODE_ENV = 'development';
    process.env.MAIL_HOST = 'test.mailtrap.io';
    process.env.MAIL_PORT = '2525';
    process.env.MAIL_USER = 'testuser';
    process.env.MAIL_PASS = 'testpass';
    process.env.EMAIL_SENDER = '"Manga Mailer" <noreply@example.com>';
    delete process.env.ACTUALLY_SEND_MAIL_IN_TEST;
  });

  afterAll(() => {
    // @ts-expect-error node env is not readonly
    process.env.NODE_ENV = originalNodeEnv;
    process.env.ACTUALLY_SEND_MAIL_IN_TEST = originalActuallySendMailFlag;
  });

  it('should call transporter.sendMail with correct parameters on successful send', async () => {
    mocks.sendMail.mockResolvedValueOnce({
      messageId: 'test-message-id',
      accepted: [emailOptions.to],
      response: '250 OK',
    });

    const success = await sendEmail(emailOptions);

    expect(success).toBe(true);

    expect(mocks.sendMail).toHaveBeenCalledTimes(1);
    expect(mocks.sendMail).toHaveBeenCalledWith({
      from: process.env.EMAIL_SENDER,
      to: emailOptions.to,
      subject: emailOptions.subject,
      html: emailOptions.html,
      text: emailOptions.text,
    });

    expect(loggerWriteSpy).toHaveBeenCalledTimes(2);
    expect(loggerWriteSpy).toHaveBeenNthCalledWith(1, {
      level: 'info',
      serviceName: 'email',
      msg: 'Attempting to send email...',
      to: emailOptions.to,
      subject: emailOptions.subject,
    });
    expect(loggerWriteSpy).toHaveBeenNthCalledWith(2, {
      level: 'info',
      serviceName: 'email',
      msg: 'Email sent successfully',
      messageId: 'test-message-id',
      accepted: [emailOptions.to],
      response: '250 OK',
    });
  });

  it('should return false and log error if sendMail fails', async () => {
    const error = new Error('SMTP Connection Error');
    mocks.sendMail.mockRejectedValueOnce(error);

    const success = await sendEmail(emailOptions);

    expect(success).toBe(false);
    expect(mocks.sendMail).toHaveBeenCalledTimes(1);

    expect(loggerWriteSpy).toHaveBeenCalledTimes(3);
    expect(loggerWriteSpy).toHaveBeenNthCalledWith(1, {
      level: 'info',
      serviceName: 'email',
      msg: 'Attempting to send email...',
      to: emailOptions.to,
      subject: emailOptions.subject,
    });
    expect(loggerWriteSpy).toHaveBeenNthCalledWith(2, {
      level: 'error',
      serviceName: 'email',
      msg: 'Error sending email',
      subject: 'Test Subject',
      to: 'recipient@example.com',
    });
    expect(loggerWriteSpy).toHaveBeenNthCalledWith(3, {
      level: 'info',
      serviceName: 'email',
      msg: 'SMTP Connection Error',
      err: {
        type: 'Error',
        message: 'SMTP Connection Error',
        stack: expect.stringMatching('.*'),
      },
    });
  });

  describe('test Environment Behavior', () => {
    beforeEach(() => {
      // @ts-expect-error node env is not readonly
      process.env.NODE_ENV = 'test';
    });

    it('should skip sending email and return true in test environment by default', async () => {
      delete process.env.ACTUALLY_SEND_MAIL_IN_TEST;
      const success = await sendEmail(emailOptions);

      expect(success).toBe(true);
      expect(mocks.sendMail).not.toHaveBeenCalled();

      expect(loggerWriteSpy).toHaveBeenCalledTimes(1);
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(1, {
        level: 'info',
        serviceName: 'email',
        msg: 'Email sending skipped in test environment (unless ACTUALLY_SEND_MAIL_IN_TEST is true).',
        options: {
          html: '<p>Test HTML</p>',
          subject: 'Test Subject',
          text: 'Test Text',
          to: 'recipient@example.com',
        },
      });
    });

    it('should attempt to send email in test environment if ACTUALLY_SEND_MAIL_IN_TEST is "true"', async () => {
      process.env.ACTUALLY_SEND_MAIL_IN_TEST = 'true';
      mocks.sendMail.mockResolvedValueOnce({ messageId: 'test-e2e-send', accepted: [emailOptions.to] });

      const success = await sendEmail(emailOptions);

      expect(success).toBe(true);
      expect(mocks.sendMail).toHaveBeenCalledTimes(1);

      expect(loggerWriteSpy).toHaveBeenCalledTimes(2);
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(1, {
        level: 'info',
        serviceName: 'email',
        msg: 'Attempting to send email...',
        to: emailOptions.to,
        subject: emailOptions.subject,
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(2, {
        level: 'info',
        serviceName: 'email',
        msg: 'Email sent successfully',
        messageId: 'test-e2e-send',
        accepted: [emailOptions.to],
      });
    });
  });
});
