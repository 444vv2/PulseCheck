import { Controller, Get, Post, Delete, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CurrentUser } from "../auth/current-user.decorator";
import { NotificationsService } from "./notifications.service";

@Controller("notifications")
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post("telegram/link-token")
  createLinkToken(@CurrentUser() user: { id: string }) {
    return this.notificationsService.createTelegramLinkToken(user.id);
  }

  @Get("telegram/status")
  getLinkStatus(@CurrentUser() user: { id: string }) {
    return this.notificationsService.getTelegramLinkStatus(user.id);
  }

  @Delete("telegram/link")
  unlink(@CurrentUser() user: { id: string }) {
    return this.notificationsService.unlinkTelegram(user.id);
  }
}
