import { Controller, Post, Body } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { SendNotificationDto } from './dto/create-telegram.dto';

@Controller('telegram')
export class TelegramController {
  constructor(private readonly telegramService: TelegramService) {}

  @Post('notify')
  sendNotification(@Body() sendNotificationDto: SendNotificationDto) {
    return this.telegramService.sendNotification(sendNotificationDto.chatId, sendNotificationDto.message);
  }
}
