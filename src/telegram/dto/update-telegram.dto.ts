import { PartialType } from '@nestjs/swagger';
import { SendNotificationDto } from './create-telegram.dto';

export class UpdateTelegramDto extends PartialType(SendNotificationDto) {}
