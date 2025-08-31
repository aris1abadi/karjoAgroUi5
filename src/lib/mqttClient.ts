import mqtt from 'mqtt';
import { msgType,isMqttConnected, isControllerConnected, myTask, myAktuator, myHumiditySensor, myTemperatureSensor, mySoilSensor, myDistanceSensor, isLogin, pubMqtt, subMqtt, loginWait } from './stores';
import { get } from "svelte/store";

const clientId = "CL" + Math.random().toString(16).substr(2, 4).toUpperCase();
let lastMsg = ""

//const url = "wss://broker.hivemq.com:8884/mqtt"; // contoh 

const brokerUrl = 'wss://z442812a.ala.asia-southeast1.emqxsl.com:8084/mqtt'

const options = {
  keepalive: 30,
  clientId,
  username: 'abadinet',
  password: 'abadinet123',
  protocolId: "MQTT",
  protocolVersion: 4,
  clean: true,
  reconnectPeriod: 5000,
  connectTimeout: 30 * 1000,
  will: {
    topic: "WillMsg",
    payload: "Connection Closed abnormally..!",
    qos: 0,
    retain: false,
  },
  rejectUnauthorized: false,
};


const mqttClient = mqtt.connect(brokerUrl, options);


function cekIncomingMsg(topic,msg) {
  const payload = msg.toString()
  if (lastMsg != payload) {
    lastMsg = payload

    const topicSplit = topic.split('/')

    if (topicSplit[4] === "infoAllStatus") {
      const msgSplit = JSON.parse(payload).infoAllStatus
      myTask.set(JSON.parse(msgSplit[0]).task)
      myAktuator.set(JSON.parse(msgSplit[1]).aktuator)
      myTemperatureSensor.set(JSON.parse(msgSplit[2]).TemperatureSensor)
      myHumiditySensor.set(JSON.parse(msgSplit[3]).HumiditySensor)
      mySoilSensor.set(JSON.parse(msgSplit[4]).SoilSensor)
      myDistanceSensor.set(JSON.parse(msgSplit[5]).DistanceSensor)
      loginWait.set(false)     
      isControllerConnected.set(true)
                                                                                                                                                               
      //console.log(get(myAktuator))
    }else if(topicSplit[4] === "loginResponse"){
      console.log(payload)
      const payloadSplit = payload.split('_')
      if(payloadSplit[2] === 'OK'){
        isLogin.set(true)
        
        kirimMsg(msgType.KONTROL,0,'getAllStatus','1')
      }

    }
  }
}
mqttClient.on('connect', () => {
  isMqttConnected.set(true);
  mqttClient.subscribe(get(subMqtt));
  //
});

mqttClient.on('message', (topic, msg) => {
  //console.log("Topic: " + topic + "\nMsg: " + msg);
  cekIncomingMsg(topic, msg)


  /*
  if (topic === 'irigasi/sensor') {
    let data = JSON.parse(msg.toString());
    sensorData.update((list) => [
      ...list.slice(-20), // keep last 20 records
      { time: formatTime(new Date()), moisture: data.moisture }
    ]);
  }
    */
});

export function loginStart(pass = "demoPass") {
  let formatedPass = "0000," + pass + ',-;'
  //console.log('login request')
    kirimMsg(msgType.KONTROL, 0, 'loginRequest', formatedPass);
    
  
}

function kirimMsg(type, num, cmd, msg) {
  let ms = get(pubMqtt) + type + "/" + num + "/" + cmd;
  const topicMsg = ms.replace(/\s/g, '');
  const bleMsg = topicMsg + ";" + msg + ";";
  if (get(isMqttConnected)) {
    //console.log("sendMsg:\ntopic: " + topicMsg +'\npayload: ' + msg)
  mqttClient.publish(topicMsg, msg, { qos: 0, retain: false });
  }



}

mqttClient.on('error', () => isMqttConnected.set(false));

export default mqttClient;
