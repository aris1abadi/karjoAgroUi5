import { get } from 'svelte/store';
import { logMsg, msgType, isMqttConnected, isControllerConnected, myTask, myAktuator, myHumiditySensor, myTemperatureSensor, mySoilSensor, myDistanceSensor, isLogin, pubMqtt, subMqtt, loginWait, taskChangeWait, isTaskEnable, kontrolID, connectionMode, connectionType, isBleConnected } from './stores';
import { cekIncomingMsg } from './mqttClient';

let btBuff = "";

logMsg.set('karjoAgro ' + get(kontrolID))
class BLEUARTClient {
    constructor() {
        // UUID untuk Nordic UART Service (NUS)
        this.bleNusServiceUUID = '6e400001-b5a3-f393-e0a9-e50e24dcca9e';
        this.bleNusCharTXUUID = '6e400003-b5a3-f393-e0a9-e50e24dcca9e'; // TX Characteristic (Notifications)
        this.bleNusCharRXUUID = '6e400002-b5a3-f393-e0a9-e50e24dcca9e'; // RX Characteristic (Write)

        this.device = null;
        this.server = null;
        this.nusService = null;
        this.txCharacteristic = null;
        this.rxCharacteristic = null;
        this.connected = false;

        // Bind methods to maintain proper 'this' context
        this.onDisconnected = this.onDisconnected.bind(this);
        this.handleNotifications = this.handleNotifications.bind(this);
        this.connect = this.connect.bind(this);
        this.disconnect = this.disconnect.bind(this);
    }

    // Method untuk menghubungkan ke perangkat BLE
    async connect(pass: string) {
        try {
            logMsg.set('Memeriksa dukungan Web Bluetooth...');

            if (!navigator.bluetooth) {
                throw new Error('WebBluetooth API tidak tersedia di browser ini');
            }

            logMsg.set('Mencari perangkat Bluetooth...');

            this.device = await navigator.bluetooth.requestDevice({
                optionalServices: [this.bleNusServiceUUID],
                acceptAllDevices: true,
            });

            logMsg.set('Perangkat ditemukan: ' + this.device.name);

            this.device.addEventListener('gattserverdisconnected', this.onDisconnected);

            logMsg.set('Menghubungkan ke GATT Server...');
            this.server = await this.device.gatt.connect();

            logMsg.set('Mencari layanan NUS...');
            this.nusService = await this.server.getPrimaryService(this.bleNusServiceUUID);

            logMsg.set('Mencari karakteristik RX...');
            this.rxCharacteristic = await this.nusService.getCharacteristic(this.bleNusCharRXUUID);

            logMsg.set('Mencari karakteristik TX...');
            this.txCharacteristic = await this.nusService.getCharacteristic(this.bleNusCharTXUUID);

            logMsg.set('Mengaktifkan notifikasi...');
            await this.txCharacteristic.startNotifications();

            this.txCharacteristic.addEventListener('characteristicvaluechanged', this.handleNotifications);

            this.connected = true;
            //(true);
            connectionMode.set(connectionType.BLE)
            isBleConnected.set(true)
            isControllerConnected.set(true)
            setTimeout(() => {
                bleLogin(pass)
            }, 1000)

            logMsg.set('Terhubung ke ' + this.device.name);



        } catch (error) {
            logMsg.set('Error: ' + error.message);

            // Pastikan untuk memutuskan koneksi jika terjadi error
            if (this.device && this.device.gatt.connected) {
                this.device.gatt.disconnect();

                // updateUI(false);
            }
            isBleConnected.set(false)
            isLogin.set(false)
            this.connected = false;
            // updateUI(false);
        }
    }

    // Method untuk menangani data yang diterima
    handleNotifications(event) {
        const value = event.target.value;
        let chr = "";
        let endMsg = false;
        for (let i = 0; i < value.byteLength; i++) {
            chr = String.fromCharCode(value.getUint8(i));
            btBuff += chr;
            if (chr == "\n") {
                endMsg = true;

                break;
            }
        }
        if (endMsg) {
            if (btBuff.length > 20) {
                //logDisplay += btBuff;

                let btMsgSplit = btBuff.split('$')
                const topic = btMsgSplit[0]
                const msg = btMsgSplit[1]
                logMsg.set('Diterima: ' + btBuff);
                //debugMsgReceive(btBuff)

                const topicSplit = topic.split('-')
                if (topicSplit[0] === 'abadinet') {
                    cekIncomingMsg(topic, msg)

                } else {
                    debugMsgReceive(btBuff)
                }
            } else {
                debugMsgReceive(btBuff)
            }
            btBuff = "";
        }
        /*
    
          const decoder = new TextDecoder();
          const message = decoder.decode(value);
          logMsg.set('Diterima: ' + message);
          const bleMsgSplit = message.split("$");
          const topic = bleMsgSplit[0];        
          const blePayload = bleMsgSplit[1];
          cekIncomingMsg(topic, blePayload);
          */

    }

    // Method untuk mengirim data
    async send(data) {
        if (!this.connected || !this.rxCharacteristic) {
            throw new Error('Tidak terhubung ke perangkat');
        }
        data += "\n";

        try {
            const encoder = new TextEncoder();
            const value = encoder.encode(data);
            await this.rxCharacteristic.writeValue(value);
            logMsg.set('Dikirim: ' + data);
            return true;
        } catch (error) {
            logMsg.set('Gagal mengirim: ' + error.message);
            return false;
        }
    }

    // Method untuk memutuskan koneksi
    disconnect() {
        if (this.device && this.device.gatt.connected) {
            this.device.gatt.disconnect();
        }
        this.onDisconnected();
    }

    // Method untuk menangani event disconnected
    onDisconnected() {
        logMsg.set('Terputus dari perangkat');
        this.connected = false;
        this.device = null;
        this.server = null;
        this.nusService = null;
        this.txCharacteristic = null;
        this.rxCharacteristic = null;
        isBleConnected.set(false)
        isLogin.set(false)

    }

    // Method untuk memeriksa status koneksi
    isConnected() {
        return this.connected;
    }
}

function debugMsgReceive(msg) {
    console.log(msg)
}

function bleLogin(pass: string) { 
    let ms = get(pubMqtt) + "0/0/loginRequest";
    const topicMsg = ms.replace(/\s/g, '');
    const bleMsg = topicMsg + "$" + pass + "$msgCmd$";
    bleSendMessage(bleMsg);
}



// Inisialisasi BLE UART Client
const bleClient = new BLEUARTClient();


// Fungsi untuk menghubungkan ke perangkat
export async function bleConnect(pass: string) {
    await bleClient.connect(pass);
}

// Fungsi untuk memutuskan koneksi
export async function bleDisconnect() {
    await bleClient.disconnect();
}

// Fungsi untuk mengirim pesan
export async function bleSendMessage(message) {


    if (message) {
        await bleClient.send(message);
    } else {
        logMsg.set('Silakan masukkan pesan terlebih dahulu');
    }
}
