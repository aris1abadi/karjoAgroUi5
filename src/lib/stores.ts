import { readable, writable,get } from "svelte/store";
import  { persisted }  from "svelte-persisted-store";
import { writev } from "mqtt/lib/BufferedDuplex";

export const isMqttConnected = writable(false);
export const isBleConnected = writable(false);
export const isControllerConnected = writable(false)

export const sensorData = writable<{ time: string; moisture: number }[]>([]);

export const lastCommand = writable<string | null>(null);

export const myTask = writable([])
export const myAktuator = writable([])
export const myTemperatureSensor = writable([])
export const myHumiditySensor = writable([])
export const mySoilSensor = writable([])
export const myDistanceSensor = writable([])
export const taskModeTxt = readable(['AutoTemperature','AutoHumidity','AutoLengas','AutoIntermittent','AutoMix'])
export const taskMode = readable([0,1,2,3,4])
export const isLogin = writable(false)
export const loginWait = writable(false)
export const demoVal = writable(false)
export const demoWait = writable(false)
export const isDemo = writable(false);
export const isTaskEnable  = writable(false)
export const taskChangeWait = writable(false)
export const settingModal = writable(false);
export const settingTitle = writable('Settings')

export const logHistory = writable([]);

export const kontrolID = persisted('kontrolID', 'KA-8CE9')
export const bleDeviceId = persisted('bleDeviceId','')
export const subMqtt = readable("abadinet-out/" + get(kontrolID) + "/#");
export const pubMqtt = readable("abadinet-in/" + get(kontrolID) + "/");
export const msgType ={
    KONTROL: 0,
    TASK: 1,
    AKTUATOR: 2,
    SENSOR: 3,
  };
  export const connectionType = {
    NONE:0,
    BLE: 1,
    MQTT: 2,
  };
  export const nodeType={
    NODE_GATEWAY:0,
    NODE_TEMPERATURE:1,   
    NODE_HUMIDITY:2,    
    NODE_SOIL_MOISTURE:3,
    NODE_DISTANCE:4, 
    NODE_RELAY1:5,
    NODE_RELAY2:6,
    NODE_RELAY3:7,
    NODE_RELAY4:8,
    NODE_RELAY5:9,
    NODE_RELAY6:10,
    NODE_RELAY7:11,
    NODE_RELAY8:12,    
    NODE_DISPLA:13
  }
  export const connectionMode = writable(connectionType.NONE)

  export const localUrl = "http://102.18.4.1"

  export const logMsg = writable("Tes ")