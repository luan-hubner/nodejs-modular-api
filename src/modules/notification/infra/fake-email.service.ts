import type { EmailService } from '../domain/email.service'

export class FakeEmailService implements EmailService {
  async send(to: string, subject: string, body: string): Promise<void> {
    console.log(`[FakeEmailService] To: ${to} | Subject: ${subject}`)
    console.log(`[FakeEmailService] Body: ${body}`)
  }
}
