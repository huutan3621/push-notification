import { sendNotificationDTO } from './dto/send-notification.dto';
import { CreateNotificationDto } from './dto/create-notification-dto';
import { UpdateNotificationDto } from './dto/update-notification-dto';
import { Injectable, Inject } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class NotificationService {
  constructor(
    @Inject('FIREBASE_ADMIN')
    private readonly firebaseAdmin: { defaultApp: admin.app.App },
  ) {}

  create(createNotificationDto: CreateNotificationDto) {
    console.log(createNotificationDto);
    return 'This action adds a new notification';
  }

  findAll() {
    return 'This action returns all notification';
  }

  findOne(id: number) {
    console.log(id);

    return 'This action return a #${id} notification';
  }

  update(id: number, updateNotificationDto: UpdateNotificationDto) {
    console.log(updateNotificationDto);

    return 'This action updates a #${updateNotificationDto} notification';
  }

  remove(id: number) {
    console.log(id);

    return 'This action removes a #${id} notification';
  }

  async sendPush(notification: sendNotificationDTO) {
    try {
      const response = await this.firebaseAdmin.defaultApp.messaging().send({
        notification: {
          title: notification.title,
          body: notification.body,
        },
        token: notification.deviceId,
        data: {},
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            channelId: 'default',
          },
        },
        apns: {
          headers: {
            'apns-priority': '10',
          },
          payload: {
            aps: {
              contentAvailable: true,
              sound: 'default',
            },
          },
        },
      });
      console.log('Notification sent successfully:', response);
      return response;
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  }
}
