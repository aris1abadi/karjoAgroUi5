//import * as mqtt from 'mqtt';
import mqtt from 'mqtt';
import { get } from 'svelte/store';
import { msgType,demoWait,isDemo, isMqttConnected, isControllerConnected, myTask, myAktuator, myHumiditySensor, myTemperatureSensor, mySoilSensor, myDistanceSensor, isLogin, pubMqtt, subMqtt, loginWait, taskChangeWait, isTaskEnable, connectionType, connectionMode, logMsg, isBleConnected, nodeType, logHistory } from './stores';
import { bleConnect, bleDisconnect, bleSendMessage } from './bleClient';

const clientId = "CL" + Math.random().toString(16).substr(2, 4).toUpperCase();
let lastMsg = ""
let firstConnect = true;


const brokerUrl = 'wss://z442812a.ala.asia-southeast1.emqxsl.com:8084/mqtt'
//const brokerUrl = 'ws://broker.emqx.io:8083/mqtt'
const options = {
  keepalive: 30,
  clientId,
  username: 'abadinet',
  password: 'abadinet123',
  //username: 'emqx',
  //password: 'public',
  //protocolId: "MQTT",
  // protocolVersion: 4,
  clean: true,
  //reconnectPeriod: 5000,
  //connectTimeout: 30 * 1000,
  will: {
    topic: "WillMsg",
    payload: "Connection Closed abnormally..!",
    qos: 0,
    retain: false,
  },
  rejectUnauthorized: false,
};


function checkInternetConnection(): Promise<void> {
  return new Promise((resolve, reject) => {
    fetch('https://www.google.com', { method: 'HEAD', mode: 'no-cors' })
      .then(() => {
        //console.log('Internet connection is available.');
        resolve();
      })
      .catch(() => {
        console.error('No internet connection detected.');
        reject('No internet connection.');
      });
  });
}

class MqttClientWrapper {
  private mqttClient: mqtt.MqttClient | null = null;

  connect(brokerUrl: string, options: mqtt.IClientOptions, loginPass: string) {
    checkInternetConnection()
      .then(() => {
        this.mqttClient = mqtt.connect(brokerUrl, options);
       

        this.mqttClient.on('connect', () => {
          logMsg.set('Connected to MQTT broker.');
          isMqttConnected.set(true);
          this.mqttClient?.subscribe(get(subMqtt), (err) => {
            if (err) {
              console.error('Failed to subscribe to topics:', err);
            } else {
              //console.log('Subscribed to topics:', get(subMqtt));
            }
          });
          if (firstConnect) {
            firstConnect = false;

            kirimMsg(msgType.KONTROL, 0, 'loginRequest', loginPass);
          }
          connectionMode.set(connectionType.MQTT)

        });

        this.mqttClient.on('message', (topic, msg) => {
          this.handleIncomingMessage(topic, msg);
        });

        this.mqttClient.on('error', (err) => {
          console.error('MQTT connection error:', err);
          logMsg.set('MQTT connection error.');
          isMqttConnected.set(false);
          isControllerConnected.set(false);
          isLogin.set(false)
          firstConnect = true
        });

        this.mqttClient.on('close', () => {
          logMsg.set('MQTT connection closed.');
          isMqttConnected.set(false);
          isControllerConnected.set(false);
          isLogin.set(false)
          firstConnect = true
        });
      })
      .catch((err) => {
        console.error('Failed to connect to MQTT broker:', err);
        logMsg.set('Failed to connect to MQTT broker.');
        isMqttConnected.set(false);
        isControllerConnected.set(false);
        isLogin.set(false)
        firstConnect = true
      });
  }

  publish(topic: string, message: string) {
    if (this.mqttClient && this.mqttClient.connected) {
      this.mqttClient.publish(topic, message, { qos: 0, retain: false }, (err) => {
        if (err) {
          console.error(`Failed to publish message to topic "${topic}":`, err);
        } else {
          //console.log(`Message published to topic "${topic}": ${message}`);
        }
      });
    } else {
      console.error('MQTT client is not connected. Cannot publish message.');
    }
  }

  private handleIncomingMessage(topic: string, msg: Buffer) {
    const message = msg.toString();
    //console.log(`Received message on topic "${topic}": ${message}`);
    // Add your custom logic to handle incoming messages here
    cekIncomingMsg(topic, message);
  }

  disconnect() {
    if (this.mqttClient) {
      this.mqttClient.end(() => {
        //console.log('MQTT client disconnected.');
        logMsg.set('MQTT client disconnected.');
        isControllerConnected.set(false);
        isMqttConnected.set(false);
        isLogin.set(false)
        firstConnect = true
      });
    } else {
      console.error('MQTT client is not initialized.');
    }
  }
}

// Example usage



const mqttClientWrapper = new MqttClientWrapper();

function mqttConnect(pass: string) {
  mqttClientWrapper.connect(brokerUrl, options, pass);

}
export function mqttDisconnect() {
  mqttClientWrapper.disconnect();
}

// Example: Publish a message
//mqttClientWrapper.publish('example/topic', 'Hello, MQTT!');

// Example: Disconnect the client
// mqttClientWrapper.disconnect();

export function cekIncomingMsg(topic: string, payload: string) {

  if (lastMsg != payload) {
    lastMsg = payload
    //console.log("Topic: " + topic + "\nMsg: " + payload);
    const topicSplit = topic.split('/')
    const type = parseInt(topicSplit[2])
    const idx = parseInt(topicSplit[3])
    const cmd = topicSplit[4]
    if (type === msgType.KONTROL) {
      if (cmd === "resp_getAllStatus") {
        const msgSplit = JSON.parse(payload).infoAllStatus
        myTask.set(JSON.parse(msgSplit[0]).task)
        myAktuator.set(JSON.parse(msgSplit[1]).aktuator)
        myTemperatureSensor.set(JSON.parse(msgSplit[2]).TemperatureSensor)
        myHumiditySensor.set(JSON.parse(msgSplit[3]).HumiditySensor)
        mySoilSensor.set(JSON.parse(msgSplit[4]).SoilSensor)
        myDistanceSensor.set(JSON.parse(msgSplit[5]).DistanceSensor)
        loginWait.set(false)
        isControllerConnected.set(true)

        //console.log(get(myTask))
        const cekTask = get(myTask)
        
      } else if (cmd === "resp_loginRequest") {
        //console.log(payload)
        const payloadSplit = payload.split('_')
        if (payloadSplit[2] === 'OK') {
          isLogin.set(true)
          setTimeout(() => { kirimMsg(msgType.KONTROL, 0, 'getAllStatus', '1') }, 1000)

        }

      } else if (cmd === 'heartbeat') {
        //console.log('heartbeat')
        isControllerConnected.set(true)
      }else if (cmd === 'resp_demoMode') {
          
          demoWait.set(false);
          if (parseInt(payload) === 1) {
            isDemo.set(true)
          } else {
            isDemo.set(false)
          }

        
      }
    } else if (type === msgType.TASK) {
      if (cmd === 'resp_enable') {
        //cek _OK
        //console.log('enable task response: ' + payload)
        const enableResponse = payload.split('_')
        if (enableResponse[1] === 'OK') {
          taskChangeWait.set(false)
          if (enableResponse[0] === '1') {
            isTaskEnable.set(true)
            myTask.update(tasks => { tasks[idx].enable = 1; return tasks })
          } else {
            isTaskEnable.set(false)
            myTask.update(tasks => { tasks[idx].enable = 0;tasks[idx].aktuator1Val= 0;return tasks })
          }
         // console.log(get(myTask))
        }
      } else if (cmd === 'resp_updateTask') {
        //cek _OK
        //console.log('update task response: ' + payload)
        const setResponse = payload.split('_')
        if (setResponse[1] === 'OK') {
          isLogin.set(true)
          setTimeout(() => {
            kirimMsg(msgType.KONTROL, 0, 'getAllStatus', '1')
          }, 1000)
        }
      } else if (cmd === 'resp_aktuator') {
        const cekOk = payload.split('_')
        if (cekOk[1] === 'OK') {
          if (cekOk[0] === '1') {
            myTask.update(tasks => { tasks[idx].aktuator1Val = 1; tasks[idx].enable = 1; return tasks })
            isTaskEnable.set(true)
          } else {
            myTask.update(tasks => { tasks[idx].aktuator1Val = 0; return tasks })
            
          }
        }

      }else if(cmd === 'sensorVal'){
        const newMsg = JSON.parse(payload)
        //console.log('newSensorVal: ' + payload)
        if(newMsg.type === nodeType.NODE_TEMPERATURE){

          myTemperatureSensor.update(tempSensor =>{tempSensor[newMsg.nomerSensor] = {...tempSensor[newMsg.nomerSensor],sensorVal:newMsg.sensorVal}
          return tempSensor
          })
        }

        myTask.update(task => {
          task[idx] = { ...task[idx], sensorVal: newMsg.sensorVal,lastSeen:newMsg.lastSeen };
          return task;
        });
      }else if(cmd ==='resp_getHistory'){   
        const msgSplit = JSON.stringify(payload.split('\n'))    
        logHistory.set(JSON.parse(msgSplit));
      

      }else if(cmd === 'resp_clearHistory'){
        
        logHistory.set([]);

      }
    }
  }
}

export function loginStart(pass: string, mode) {
  const formatedPass = "0000," + pass + ',-;'
  ////console.log('login request')
  if (!get(isLogin)) {
    if (mode === connectionType.BLE) {

      if (get(isMqttConnected)) {
        mqttDisconnect()
      }
      bleConnect(formatedPass);
      logMsg.set('ble lgin request')
    } else if (mode === connectionType.MQTT) {
      if (get(isBleConnected)) {
        bleDisconnect()
      }
      mqttConnect(formatedPass);
      logMsg.set('mqtt lgin request')
    } else {
      logMsg.set('no connection ')
    }
  }


  //kirimMsg(msgType.KONTROL, 0, 'loginRequest', formatedPass);

}
export function updateTask(newTask) {
  let taskStr = JSON.stringify(newTask).replace(/\s/g, '');
  kirimMsg(msgType.TASK, 0, 'updateTask', taskStr);
}

export function kirimMsg(type, num, cmd, msg: string) {
  let ms = get(pubMqtt) + type + "/" + num + "/" + cmd;
  const topicMsg = ms.replace(/\s/g, '');
  const bleMsg = topicMsg + "$" + msg + "$msgCmd$";
  if (get(isMqttConnected)) {
    ////console.log("sendMsg:\ntopic: " + topicMsg +'\npayload: ' + msg)
    mqttClientWrapper.publish(topicMsg, msg);
  } else if (get(isBleConnected)) {
    bleSendMessage(bleMsg)
  }


}