import { Injectable } from "@nestjs/common";
import * as nodemailer from "nodemailer";

@Injectable()
export class EmailService {
  private readonly transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST ?? "localhost",
    port: parseInt(process.env.SMTP_PORT ?? "1025", 10),
    secure: false,
  });

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

    await this.transporter.sendMail({
      from: process.env.MAIL_FROM ?? "PulseCheck <alerts@pulsecheck.dev>",
      to,
      subject,
      text,
    });
  }
}
