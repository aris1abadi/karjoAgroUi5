import { readable, writable, get } from "svelte/store";
import { persisted } from "svelte-persisted-store";
import { writev } from "mqtt/lib/BufferedDuplex";

export const isMqttConnected = writable(false);
export const isBleConnected = writable(false);
export const isControllerConnected = writable(false)

export const sensorData = writable<{ time: string; moisture: number }[]>([]);

export const lastCommand = writable<string | null>(null);

export const myTask = writable([])
export const myAktuator = writable([])
export const mySensor = writable([])
export const taskModeTxt = readable(['AutoTemperature', 'AutoHumidity', 'AutoLengas', 'AutoIntermittent'])
export const taskMode = readable([0, 1, 2, 3, 4])
export const isLogin = writable(false)
export const loginWait = writable(false)
export const demoVal = writable(false)
export const demoWait = writable(false)
export const isDemo = writable(false);
export const isTaskEnable = writable(false)
export const taskChangeWait = writable(false)
export const settingModal = writable(false);
export const settingTitle = writable('Settings')
export const helpModal = writable(false)

export const logHistory = writable([]);

export const kontrolID = persisted('kontrolID', 'KA-8CE9')
export const bleDeviceId = persisted('bleDeviceId', '')
export const subMqtt = writable("abadinet-out/" + get(kontrolID) + "/#");
export const pubMqtt = writable("abadinet-in/" + get(kontrolID) + "/");
export const msgType = {
  KONTROL: 0,
  TASK: 1,
  AKTUATOR: 2,
  SENSOR: 3,
};
export const connectionType = {
  NONE: 0,
  BLE: 1,
  MQTT: 2,
  LOCAL_WEB: 3,
};

export const sensorListTxt = readable(['Gateway','Temperature','Humidity','Intermittent','Intermittent','Moisture','Probe'])
/*
 NODE_GATEWAY,
NODE_TEMPERATURE,
NODE_HUMIDITY,
NODE_ULTRASONIC_SENSOR,
NODE_FUEL_SENSOR,
NODE_CAPASITIVESOIL_SENSOR,
NODE_PROBESOIL_SENSOR,
NODE_RELAY1,
NODE_RELAY2,
NODE_RELAY3,
NODE_RELAY4,  
NODE_DISPLAY,
NODE_LASER_SENSOR

*/
export const nodeType = {
  NODE_GATEWAY: 0,
  NODE_TEMPERATURE: 1,
  NODE_HUMIDITY: 2,
  NODE_ULTRASONIC_SENSOR: 3,
  NODE_FUEL_SENSOR: 4,
  NODE_CAPASITIVESOIL_SENSOR: 5,
  NODE_PROBESOIL_SENSOR: 6,
  NODE_RELAY1: 7,
  NODE_RELAY2: 8,
  NODE_RELAY3: 9,
  NODE_RELAY4: 10,  
  NODE_DISPLAY: 11,
  NODE_LASER_SENSOR:12

}
export const connectionMode = writable(connectionType.NONE)

export const localUrl = "http://10.10.10.1/api/kontrol"

export const logMsg = writable("Tes ")