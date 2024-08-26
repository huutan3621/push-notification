import { Injectable, Inject } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { sendNotificationDTO } from './dto/send-notification.dto';
import { CreateNotificationDto } from './dto/create-notification-dto';
import { UpdateNotificationDto } from './dto/update-notification-dto';

@Injectable()
export class NotificationService {
  constructor(
    @Inject('FIREBASE_ADMIN')
    private readonly firebaseAdmin: { defaultApp: admin.app.App },
  ) {}

  private get firestore() {
    return this.firebaseAdmin.defaultApp.firestore();
  }

  async create(createNotificationDto: CreateNotificationDto) {
    console.log(createNotificationDto);
    // Implement your logic to save the notification to Firestore here
    return 'This action adds a new notification';
  }

  async findAll() {
    // Implement your logic to retrieve all notifications from Firestore
    return 'This action returns all notifications';
  }

  async findOne(id: number) {
    console.log(id);
    // Implement your logic to retrieve a specific notification from Firestore
    return `This action returns notification #${id}`;
  }

  async update(id: number, updateNotificationDto: UpdateNotificationDto) {
    console.log(updateNotificationDto);
    // Implement your logic to update the notification in Firestore
    return `This action updates notification #${id}`;
  }

  // async remove(id: number) {
  //   console.log(id);
  //   // Implement your logic to remove the notification from Firestore
  //   return `This action removes notification #${id}`;
  // }

  //save to firebase
  private async saveNotificationToFirestore(
    notification: sendNotificationDTO,
    deviceId: string,
    messageId: string,
  ) {
    try {
      const notificationData = {
        title: notification.title,
        body: notification.body,
        messageId: messageId, // Store the message ID
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      };

      // Save the notification under `notifications/{deviceId}`
      await this.firestore
        .collection('notifications')
        .doc(deviceId)
        .collection('messages')
        .add(notificationData);

      console.log(`Notification saved to Firestore for device ID: ${deviceId}`);
    } catch (error) {
      console.error('Error saving notification to Firestore:', error);
    }
  }

  async sendPushToAll(notification: sendNotificationDTO) {
    try {
      // Retrieve all device documents from Firestore
      const devicesSnapshot = await this.firestore.collection('devices').get();
      const sendPromises = devicesSnapshot.docs.map(async (doc) => {
        const deviceData = doc.data();
        const deviceToken = deviceData.deviceToken;

        if (deviceToken) {
          // Create a copy of the notification DTO and set the deviceToken
          const notificationWithToken = { ...notification, deviceToken };
          const response = await this.sendPush(
            notificationWithToken,
            deviceToken,
          ); // Pass the notification with deviceToken
          return response;
        } else {
          return {
            success: false,
            message: 'Device token is missing',
          };
        }
      });

      // Await all notification sending promises
      const results = await Promise.all(sendPromises);

      return {
        success: true,
        message: 'Notifications sent to all devices',
        results,
      };
    } catch (error) {
      console.error('Error sending notifications to all devices:', error);
      return {
        success: false,
        message: 'An error occurred while sending notifications',
      };
    }
  }

  async sendPush(notification: sendNotificationDTO, tokenId: string) {
    if (!notification.deviceToken) {
      return { success: false, message: 'Device ID is required' };
    }

    try {
      const message: admin.messaging.Message = {
        notification: {
          title: notification.title,
          body: notification.body,
        },
        token: tokenId,
        data: {
          id: notification.id,
          title: notification.title,
          body: notification.body,
          imageUrl: notification.imageUrl || '',
          deviceToken: notification.deviceToken || '',
          keyPage: notification.keyPage || '',
        },
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            channelId: 'default',
            ...(notification.imageUrl && { imageUrl: notification.imageUrl }), // Include only if imageUrl is provided
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
          fcmOptions: {
            ...(notification.imageUrl && { imageUrl: notification.imageUrl }), // Include only if imageUrl is provided
          },
        },
      };

      const response = await this.firebaseAdmin.defaultApp
        .messaging()
        .send(message);

      console.log('Notification sent successfully:', response);
      await this.saveNotificationToFirestore(notification, tokenId, response);

      return {
        success: true,
        message: 'Notification sent successfully',
        response,
      };
    } catch (error) {
      console.error('Error sending notification:', error);

      if (error && typeof error === 'object' && 'errorInfo' in error) {
        return {
          success: false,
          message: `Failed to send notification: ${error.errorInfo.message}`,
        };
      }

      return {
        success: false,
        message: 'An unexpected error occurred while sending notification',
      };
    }
  }

  async remove(id: number) {
    try {
      const notificationRef = this.firestore
        .collection('notifications')
        .doc(id.toString());
      await notificationRef.delete();
      return {
        success: true,
        message: `Notification with ID ${id} has been removed`,
      };
    } catch (error) {
      console.error(`Error removing notification with ID ${id}:`, error);
      return { success: false, message: 'Error removing notification' };
    }
  }
}
