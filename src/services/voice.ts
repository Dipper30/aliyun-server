import { Request } from 'express';
import WebSocket from 'ws';
import fs from 'fs';
import { v4 as uuidV4 } from 'uuid';
import { APP_CONFIG } from '@/config';
import * as $OpenApi from '@alicloud/openapi-client';
import Sts, * as $Sts from '@alicloud/sts20150401';
import * as $Util from '@alicloud/tea-util';
import BaseService from './base';
import { getUnixTS, handleAliyunError } from '@/utils';
import { AliyunError, AliyunParams } from '@/types';
import { AliyunException, CdnException } from '@/exceptions';
import OSS from 'ali-oss';
import dayjs from 'dayjs';
import { v4 as uuidv4 } from 'uuid';
import { appendLog } from '@/utils/log';

// import StsClient from '@alicloud/sts-sdk';

// Aliyun OSS API
// https://help.aliyun.com/zh/oss/developer-reference/installation-7

type TTSTask = {
  ws: WebSocket | null;
  id: string;
  output: string;
  status: 'pending' | 'started' | 'finished' | 'error';
  msg?: string;
  texts: string[];
  speed: number;
  voice: string;
};

class AliyunCosyVoice extends BaseService {
  // 若没有将API Key配置到环境变量，可将下行替换为：apiKey = 'your_api_key'。不建议在生产环境中直接将API Key硬编码到代码中，以减少API Key泄露风险。
  apiKey: string;
  // WebSocket服务器地址
  wsUrl: string;
  tasks: Map<string, TTSTask>;

  constructor() {
    super();
    this.apiKey = APP_CONFIG.ALIYUN.ALIBABA_BAILIAN_API_KEY;
    this.wsUrl = 'wss://dashscope.aliyuncs.com/api-ws/v1/inference/';
    this.tasks = new Map();
  }

  private getWsInstance(taskId: string, options: AliyunParams.StartTTSTask) {
    const current = this.tasks.get(taskId);
    if (!current) {
      // 创建WebSocket客户端
      const ws = new WebSocket(this.wsUrl, {
        headers: {
          Authorization: `bearer ${this.apiKey}`,
          'X-DashScope-DataInspection': 'enable',
        },
      });
      this.tasks.set(taskId, {
        ws,
        id: taskId,
        output: `${taskId}.mp3`,
        status: 'pending',
        texts: options.texts,
        speed: options.speed || 1,
        voice: options.voice,
      });
      return {
        task: this.tasks.get(taskId)!,
        isNew: true,
      };
    }
    return {
      task: current,
      isNew: true,
    };
  }

  startTask(data: AliyunParams.StartTTSTask) {
    const taskId = uuidV4();
    const { task, isNew } = this.getWsInstance(taskId, data);
    if (!isNew) {
      console.warn(`任务 ${taskId} 正在进行中，请勿重复添加`);
      return false;
    }
    const { ws } = task;
    if (!ws) {
      console.error(`任务 ${taskId} 无法连接至 websocket 服务器`);
      return false;
    }

    ws.on('close', () => {
      console.log(`Task【${taskId}】has disconnected from  websocket server.`);
    });

    ws.on('open', () => {
      console.log(`Task【${taskId}】has connected to  websocket server.`);

      // 发送run-task指令
      const runTaskMessage = JSON.stringify({
        header: {
          action: 'run-task',
          task_id: taskId,
          streaming: 'duplex',
        },
        payload: {
          task_group: 'audio',
          task: 'tts',
          function: 'SpeechSynthesizer',
          model: 'cosyvoice-v1',
          parameters: {
            text_type: 'PlainText',
            voice: task.voice, // 音色
            format: 'mp3', // 音频格式
            sample_rate: 22050, // 采样率
            volume: 50, // 音量
            rate: task.speed, // 语速
            pitch: 1, // 音调
          },
          input: {},
        },
      });
      ws.send(runTaskMessage);
      console.log('已发送run-task消息');
    });

    ws.on('message', (data: any, isBinary) => {
      if (isBinary) {
        // 写入二进制数据到文件
        fs.appendFile(task.output, data, (err) => {
          if (err) {
            console.error('写入数据到文件时出错：', err);
          } else {
            console.log('数据已写入文件');
          }
        });
      } else {
        const message = JSON.parse(data);
        switch (message.header.event) {
          case 'task-started':
            task.status = 'started';
            console.log('任务已开始');
            // 发送continue-task指令
            this.sendContinueTasks(task);
            break;
          case 'task-finished':
            console.log('任务已完成');
            task.status = 'finished';
            ws.close();
            break;
          case 'task-failed':
            console.error('任务失败：', message.header.error_message);
            task.status = 'error';
            ws.close();
            break;
          default:
            // 可以在这里处理result-generated
            break;
        }
      }
    });
    return true;
  }

  sendContinueTasks(task: TTSTask) {
    task.texts.forEach((text, index) => {
      setTimeout(() => {
        if (task.status === 'started') {
          const continueTaskMessage = JSON.stringify({
            header: {
              action: 'continue-task',
              task_id: task.id,
              streaming: 'duplex',
            },
            payload: {
              input: {
                text: text,
              },
            },
          });
          task.ws?.send(continueTaskMessage);
          console.log(`已发送continue-task，文本：${text}`);
        }
      }, index * 1000); // 每隔1秒发送一次
    });

    // 发送finish-task指令
    setTimeout(
      () => {
        if (task.status === 'started') {
          const finishTaskMessage = JSON.stringify({
            header: {
              action: 'finish-task',
              task_id: task.id,
              streaming: 'duplex',
            },
            payload: {
              input: {},
            },
          });
          task.ws?.send(finishTaskMessage);
          console.log('已发送finish-task');
        }
      },
      task.texts.length * 1000 + 1000,
    ); // 在所有continue-task指令发送完毕后1秒发送
  }
}

export default new AliyunCosyVoice();
