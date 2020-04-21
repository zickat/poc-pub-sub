import { MessageCallback, PubSubMessage, PubSubProvider } from './types';
import * as AWS from 'aws-sdk';
import {
  DeleteMessageRequest,
  Message,
  ReceiveMessageRequest,
} from 'aws-sdk/clients/sqs';
import _get from 'lodash/get';
import uuid from 'uuid/v1';

export class SQSProvider implements PubSubProvider {
  sqs!: AWS.SQS;
  region: string;
  //endpoint: string;

  constructor(region: string /*endpoint: string*/) {
    this.region = region;
    //this.endpoint = endpoint;
  }

  async connect(): Promise<void> {
    await AWS.config.update({ region: this.region });
    // Create an SQS service object
    this.sqs = new AWS.SQS({
      apiVersion: '2012-11-05',
      //endpoint: this.endpoint,
    });
    console.log('Connected on AWS');
  }

  publish(path: string, msg: PubSubMessage): void {
    this.sendMessageToQueue(path, msg);
  }

  request(path: string, msg: PubSubMessage, timeout: number): Promise<any> {
    throw new Error('Not Supported');
  }

  async subscribe(path: string, callback: MessageCallback): Promise<void> {
    const queue = await this.getQueueUrl(path);
    const params: ReceiveMessageRequest = {
      MaxNumberOfMessages: 1,
      QueueUrl: queue,
    };

    this.sqs.receiveMessage(params, (err, data) => {
      this.receiveMessage(err, data, callback, queue);
      this.subscribe(path, callback);
      return true;
    });
  }

  async getQueueUrl(queueName: string): Promise<string> {
    return new Promise(async (resolve, reject) => {
      const params = {
        QueueName: queueName,
      };
      this.sqs.getQueueUrl(params, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data.QueueUrl);
      });
    });
  }

  sendMessageToQueue(path: string, msg: PubSubMessage) {
    return new Promise(async (resolve, reject) => {
      const params = {
        MessageBody: JSON.stringify(msg),
        QueueUrl: await this.getQueueUrl(path),
        MessageDeduplicationId: uuid(),
        // GroupId is used to ensure that fifo is respected
        // All messages with the same groupId will be treated in the fifo way
        // So far we do not need to deal with different group id that’s why it’s fixed to `schoolmouv`
        MessageGroupId: 'schoolmouv',
      };
      this.sqs.sendMessage(params, (err, data) => {
        if (err) {
          return reject(err);
        }
        console.log('Message sent');
        resolve(data.MessageId);
      });
    });
  }

  receiveMessage(
    err: AWS.AWSError,
    data: AWS.SQS.ReceiveMessageResult,
    callback: MessageCallback,
    queue: string,
  ) {
    if (err) {
      callback(err, null);
      return;
    }

    const msg = _get(data, 'Messages[0]', null) as Message | null;

    if (!msg || !msg.Body) {
      return;
    }

    const messageBody = JSON.parse(msg.Body);

    const message: PubSubMessage = {
      headers: {
        ...msg,
        ...messageBody.headers,
        reply: null,
      },
      data: messageBody.data,
    };
    delete message.headers.Body;

    callback(null, message);
    this.ackMessage(queue, msg);
  }

  ackMessage(queueURL: string, message: Message) {
    return new Promise(async (resolve, reject) => {
      const params: DeleteMessageRequest = {
        QueueUrl: queueURL,
        ReceiptHandle: message.ReceiptHandle!,
      };
      this.sqs.deleteMessage(params, (err, data) => {
        if (err) reject(err);
        resolve(data);
      });
    });
  }
}
