import { Injectable } from "@nestjs/common";
import { Resend } from "resend";

@Injectable()
export class EmailService {
  private readonly resend = new Resend(process.env.RESEND_API_KEY!);

  async sendStatusChangeEmail(
    to: string,
    url: string,
    isUp: boolean,
    checkedAt: string,
  ) {
    const subject = isUp ? `✅ ${url} is back UP` : `🔴 ${url} is DOWN`;
    const text = isUp
      ? `Good news — ${url} responded successfully again at ${checkedAt}.`
      : `${url} stopped responding at ${checkedAt}. You'll get another email when it recovers.`;

    const { error } = await this.resend.emails.send({
      from: process.env.MAIL_FROM!,
      to,
      subject,
      text,
    });

    if (error) {
      throw new Error(error.message);
    }
  }
}
