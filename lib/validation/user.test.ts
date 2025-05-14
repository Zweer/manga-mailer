import { userValidation } from '@/lib/validation/user';

describe('validation -> user', () => {
  it('should validate a correct full user input', () => {
    const result = userValidation.safeParse({
      name: 'Test User',
      email: 'test@example.com',
      telegramId: 12345,
    });
    expect(result.success).toBe(true);
  });

  it('should allow partial input (as schema uses .partial())', () => {
    const partialInput = { name: 'Only Name' };
    const result = userValidation.safeParse(partialInput);

    expect(result).toHaveProperty('success', true);
    expect(result).toHaveProperty('data.name', partialInput.name);
  });

  describe('name validation', () => {
    it('should accept a valid name', () => {
      const result = userValidation.safeParse({ name: 'Valid Name' });
      expect(result).toHaveProperty('success', true);
    });

    it('should not accept an empty name', () => {
      const result = userValidation.safeParse({ name: '' });
      expect(result).toHaveProperty('success', false);
    });
  });

  describe('email validation', () => {
    it('should accept a valid email', () => {
      const result = userValidation.safeParse({ email: 'valid@email.com' });
      expect(result).toHaveProperty('success', true);
    });

    it('should reject an invalid email format', () => {
      const result = userValidation.safeParse({ email: 'invalid-email' });
      expect(result).toHaveProperty('success', false);
      if (result.success) {
        throw new Error('Test failed');
      }
      expect(result).toHaveProperty('error.errors', expect.arrayContaining([
        expect.objectContaining({
          path: ['email'],
          message: 'Invalid email address',
        }),
      ]));
    });

    it('should reject an email without domain', () => {
      const result = userValidation.safeParse({ email: 'test@' });
      expect(result).toHaveProperty('success', false);
      if (result.success) {
        throw new Error('Test failed');
      }
      expect(result).toHaveProperty('error.errors', expect.arrayContaining([
        expect.objectContaining({
          path: ['email'],
          message: 'Invalid email address',
        }),
      ]));
    });

    it('should reject an email without @ symbol', () => {
      const result = userValidation.safeParse({ email: 'testexample.com' });
      expect(result).toHaveProperty('success', false);
      if (result.success) {
        throw new Error('Test failed');
      }
      expect(result).toHaveProperty('error.errors', expect.arrayContaining([
        expect.objectContaining({
          path: ['email'],
          message: 'Invalid email address',
        }),
      ]));
    });
  });

  describe('telegramId validation', () => {
    it('should accept a valid telegramId (number)', () => {
      const result = userValidation.safeParse({ telegramId: 123456789 });
      expect(result.success).toBe(true);
    });

    it('should reject a string as telegramId', () => {
      const result = userValidation.safeParse({ telegramId: '12345' });
      expect(result).toHaveProperty('success', false);
      if (result.success) {
        throw new Error('Test failed');
      }
      expect(result).toHaveProperty('error.errors', expect.arrayContaining([
        expect.objectContaining({
          path: ['telegramId'],
          message: 'Expected number, received string',
        }),
      ]));
    });
  });

  it('should correctly report multiple errors', () => {
    const veryInvalidInput = {
      email: 'invalid',
      telegramId: 'not-a-number',
    };
    const result = userValidation.safeParse(veryInvalidInput);
    expect(result).toHaveProperty('success', false);
    if (result.success) {
      throw new Error('Test failed');
    }
    expect(result.error.errors).toHaveLength(2);
    expect(result.error.flatten().fieldErrors.email).toBeDefined();
    expect(result.error.flatten().fieldErrors.telegramId).toBeDefined();
  });
});
