import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
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

  @Get('getAll')
  findAll() {
    return this.notificationService.findAll();
  }

  @Get('getNotiById/:id')
  findOne(@Param('id') id: string) {
    return this.notificationService.findOne(+id);
  }

  // @Patch('updateNoti/:id')
  // update(
  //   @Param('id') id: string,
  //   @Body() updateNotificationDto: UpdateNotificationDto,
  // ) {
  //   return this.notificationService.update(+id, updateNotificationDto);
  // }

  @Delete('removeNoti/:id')
  remove(@Param('id') id: string) {
    return this.notificationService.remove(+id);
  }
}
