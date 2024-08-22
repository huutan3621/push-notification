import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { sendNotificationDTO } from './dto/send-notification.dto';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post('sendNotiToDevice/:id')
  async sendNotification(
    @Body() pushNotification: sendNotificationDTO,
    @Param('id') id: string,
  ) {
    const result = await this.notificationService.sendPush(
      pushNotification,
      id,
    );
    if (!result.success) {
      throw new HttpException(result.message, HttpStatus.BAD_REQUEST);
    }
    return result;
  }

  @Post('sendNotiToAll')
  async sendNotificationToAll(@Body() pushNotification: sendNotificationDTO) {
    const result =
      await this.notificationService.sendPushToAll(pushNotification);
    if (!result.success) {
      throw new HttpException(result.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return result;
  }

  @Get('getAll')
  async findAll() {
    return await this.notificationService.findAll();
  }

  @Get('getNotiById/:id')
  async findOne(@Param('id') id: string) {
    const notification = await this.notificationService.findOne(+id);
    if (!notification) {
      throw new HttpException('Notification not found', HttpStatus.NOT_FOUND);
    }
    return notification;
  }

  @Delete('removeNoti/:id')
  async remove(@Param('id') id: string) {
    const result = await this.notificationService.remove(+id);
    if (!result.success) {
      throw new HttpException(result.message, HttpStatus.NOT_FOUND);
    }
    return result;
  }
}
