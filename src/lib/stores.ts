import { readable, writable,get } from "svelte/store";
import  { persisted }  from "svelte-persisted-store";
import { writev } from "mqtt/lib/BufferedDuplex";

export const isMqttConnected = writable(false);
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
export const isTaskEnable  = writable(false)
export const taskChangeWait = writable(false)

export const kontrolID = persisted('kontrolID', 'KA-8CE9')
export const subMqtt = readable("abadinet-out/" + get(kontrolID) + "/#");
export const pubMqtt = readable("abadinet-in/" + get(kontrolID) + "/");
export const msgType = {
    KONTROL: 0,
    TASK: 1,
    AKTUATOR: 2,
    SENSOR: 3,
  };