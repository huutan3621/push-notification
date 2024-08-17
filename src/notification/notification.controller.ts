import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { UpdateNotificationDto } from './dto/update-notification-dto';
import { NotificationService } from './notification.service';
import { sendNotificationDTO } from './dto/send-notification.dto';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post('sendNotiToDevice/:id')
  sendNotification(
    @Body() pushNotification: sendNotificationDTO,
    @Param('id') id: string,
  ) {
    this.notificationService.sendPush(pushNotification, id);
  }

  @Post('sendNotiToAll')
  sendNotificationToAll(@Body() pushNotification: sendNotificationDTO) {
    this.notificationService.sendPushToAll(pushNotification);
  }

  @Get('')
  findAll() {
    return this.notificationService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.notificationService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateNotificationDto: UpdateNotificationDto,
  ) {
    return this.notificationService.update(+id, updateNotificationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.notificationService.remove(+id);
  }
}
