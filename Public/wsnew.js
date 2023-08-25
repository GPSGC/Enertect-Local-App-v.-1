const express = require('express');
const app = express();
const modbus = require('jsmodbus')
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const port = 6003;

const net = require('net')
var PouchDB = require("pouchdb");
const { disconnect } = require('process');
var modbusRemote = new PouchDB("http://admin:admin@127.0.0.1:5984/d");
var modbusLocal = new PouchDB("d");
app.use(express.static('public'))

var intervalID = "";
//@soc
io.on('connection', async function (socketws) {
    console.log('a user connected');
    socketws.on('chat message', async function (msg) {
        console.log('message: ' + msg);
    });

    socketws.on('readRegister', async function (IPModbusServer, portModbusServer, bankDeviceId,
        registerStartInteger, registerNumberReadInteger, DisplayName, BankDisplayName) {

        readModbus(IPModbusServer, portModbusServer, bankDeviceId, registerStartInteger, registerNumberReadInteger, DisplayName, BankDisplayName, socketws)
        /*
    intervalID = setInterval(async function () {
        readModbus("127.0.0.1", 502, 17, 0, 35, "UPS-1", "Bank-1", socketws)
    }, 1000)
    console.log(intervalID); */
    })

});

server.listen(port, () => {
    console.log('listening on *:' + port);
});

//@modbus
async function readModbus(ipModbusServer, portModbusServer, bankDeviceId,
    registerStartInteger, registerNumberReadInteger, DisplayName, BankDisplayName, socketws) {

    const socket = new net.Socket()
    const client = new modbus.client.TCP(socket, bankDeviceId, 15000);
    socket.on('error', console.error)
    socket.connect({ 'host': ipModbusServer, 'port': portModbusServer })
    socket.on('connect', function () {
        client.readHoldingRegisters(registerStartInteger, registerNumberReadInteger)
            .then(function (resp) {
                //console.log(resp.response._body.valuesAsArray)
                socketws.emit("dataIncoming", resp.response._body.valuesAsArray, BankDisplayName)
                socket.end()

                //voltageSaveDB(resp.response._body.valuesAsArray, DisplayName);
            }).catch(function (err) {
                console.log(err);
                socket.end()
                socketws.emit("dataIncoming", err, BankDisplayName);
                return false;
            })
    })

}

async function delayByMS(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}

//@voltage
async function voltageSaveDB(voltageArray, DisplayName, BankDisplayName) {
    var voltageJSONArray = [];

    var finalJSON2Upload = {
        "Date": new Date(),
        "Type": "VoltageValue",
        "DisplayName": DisplayName,
        "DisplayNameBank": BankDisplayName,
        "VoltageValues": voltageArray
    }

    try {
        modbusRemote.post(finalJSON2Upload);
    } catch (err) { console.log(err); }
}

(async () => {
    /*
    setInterval(function () {
        //    readModbus("127.0.0.1", 502, 17, 0, a35, "UPS-1", "Bank-1")
    }, 1000);
    */

})()