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
    if (!notification.deviceId) {
      return { success: false, message: 'Device ID is required' };
    }

    try {
      // Attempt to send the notification
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

      // Return success response
      console.log('Notification sent successfully:', response);
      return {
        success: true,
        message: 'Notification sent successfully',
        response,
      };
    } catch (error) {
      // General error handling
      console.error('Error sending notification:', error);

      // Check if error is an instance of FirebaseMessagingError
      if (error && typeof error === 'object' && 'errorInfo' in error) {
        return {
          success: false,
          message: `Failed to send notification: ${error.errorInfo.message}`,
        };
      }

      // Handle other cases
      return {
        success: false,
        message: 'An unexpected error occurred while sending notification',
      };
    }
  }
}
