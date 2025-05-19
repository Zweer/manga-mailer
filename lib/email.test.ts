import { logger } from '@/lib/logger';

import { sendEmail } from './email';

jest.mock('nodemailer', () => {
  const _internalMockSendMail = jest.fn();
  const _internalMockVerify = jest.fn(callback => callback(null, true));
  const _internalTransporterInstance = {
    sendMail: _internalMockSendMail,
    verify: _internalMockVerify,
  };
  const _internalMockCreateTransport = jest.fn(() => _internalTransporterInstance);

  return {
    __esModule: true,
    createTransport: _internalMockCreateTransport,
    _mockSendMail: _internalMockSendMail,
    _mockVerify: _internalMockVerify,
  };
});

jest.mock('@/lib/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    child: jest.fn().mockReturnThis(),
  },
}));
const mockedLoggerInfo = logger.info as jest.Mock;
const mockedLoggerError = logger.error as jest.Mock;

describe('lib -> email', () => {
  const originalNodeEnv = process.env.NODE_ENV;
  const originalActuallySendMailFlag = process.env.ACTUALLY_SEND_MAIL_IN_TEST;

  let nodemailerMockModule: {
    createTransport: jest.Mock;
    _mockSendMail: jest.Mock;
    _mockVerify: jest.Mock;
  };

  beforeAll(() => {
    nodemailerMockModule = jest.requireMock('nodemailer');
  });

  beforeEach(() => {
    jest.clearAllMocks();

    const nodemailerMock = jest.requireMock('nodemailer');
    nodemailerMock.createTransport.mockClear();

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

  const emailOptions = {
    to: 'recipient@example.com',
    subject: 'Test Subject',
    html: '<p>Test HTML</p>',
    text: 'Test Text',
  };

  it('should call transporter.sendMail with correct parameters on successful send', async () => {
    nodemailerMockModule._mockSendMail.mockResolvedValueOnce({
      messageId: 'test-message-id',
      accepted: [emailOptions.to],
      response: '250 OK',
    });

    const success = await sendEmail(emailOptions);

    expect(success).toBe(true);

    expect(nodemailerMockModule._mockSendMail).toHaveBeenCalledTimes(1);
    expect(nodemailerMockModule._mockSendMail).toHaveBeenCalledWith({
      from: process.env.EMAIL_SENDER,
      to: emailOptions.to,
      subject: emailOptions.subject,
      html: emailOptions.html,
      text: emailOptions.text,
    });

    expect(mockedLoggerInfo).toHaveBeenCalledWith(
      '[Email] Attempting to send email...',
      { to: emailOptions.to, subject: emailOptions.subject },
    );
    expect(mockedLoggerInfo).toHaveBeenCalledWith(
      '[Email] Email sent successfully',
      { messageId: 'test-message-id', accepted: [emailOptions.to], response: '250 OK' },
    );
    expect(mockedLoggerError).not.toHaveBeenCalled();
  });

  it('should return false and log error if sendMail fails', async () => {
    const error = new Error('SMTP Connection Error');
    nodemailerMockModule._mockSendMail.mockRejectedValueOnce(error);

    const success = await sendEmail(emailOptions);

    expect(success).toBe(false);
    expect(nodemailerMockModule._mockSendMail).toHaveBeenCalledTimes(1);
    expect(mockedLoggerError).toHaveBeenCalledWith(
      '[Email] Error sending email',
      { error, to: emailOptions.to, subject: emailOptions.subject },
    );
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
      expect(nodemailerMockModule._mockSendMail).not.toHaveBeenCalled();
      expect(mockedLoggerInfo).toHaveBeenCalledWith(
        '[Email] Email sending skipped in test environment (unless ACTUALLY_SEND_MAIL_IN_TEST is true).',
        { options: emailOptions },
      );
    });

    it('should attempt to send email in test environment if ACTUALLY_SEND_MAIL_IN_TEST is "true"', async () => {
      process.env.ACTUALLY_SEND_MAIL_IN_TEST = 'true';
      nodemailerMockModule._mockSendMail.mockResolvedValueOnce({ messageId: 'test-e2e-send', accepted: [emailOptions.to] });

      const success = await sendEmail(emailOptions);

      expect(success).toBe(true);
      expect(nodemailerMockModule._mockSendMail).toHaveBeenCalledTimes(1);
      expect(mockedLoggerInfo).not.toHaveBeenCalledWith(
        expect.objectContaining({}),
        expect.stringContaining('skipped in test environment'),
      );
      expect(mockedLoggerInfo).toHaveBeenCalledWith(
        '[Email] Attempting to send email...',
        { to: emailOptions.to, subject: emailOptions.subject },
      );
    });
  });
});
