import { vi } from 'vitest';

import { sendEmail } from '@/lib/email';

// vi.mock('@/lib/email', () => ({
//   sendEmail: vi.fn(),
// }));

export const mockedSendEmail = vi.mocked(sendEmail);

export function mockSendEmailSuccess(): void {
  mockedSendEmail.mockResolvedValueOnce(true);
}
export function mockSendEmailError(): void {
  mockedSendEmail.mockResolvedValueOnce(false);
}
