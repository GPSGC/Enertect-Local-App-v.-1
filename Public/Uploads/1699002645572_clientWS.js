const modbus = require('jsmodbus')
const net = require('net');
const { io } = require("socket.io-client");
const { isGeneratorFunction } = require('util/types');
const ws = io("http://qindus.io:6123")

ws.on('connect', function () {
    console.log("io connected")
});

ws.on('readRegister', function (u, b, s) {
    readModbus(u, b, s);
});

function readModbus(u, b, s) {
    var blocksWhenNotC = b.Blocks;
    if (s.ForString == "C" || s.ForString == "CV") {
        blocksWhenNotC = 5;
    }
    const socket = new net.Socket()
    const client = new modbus.client.TCP(socket, b.DeviceId, 8000); // Timeout 8 sec
    socket.on('error', console.error)
    socket.connect({ 'host': u.IP, 'port': u.Port })
    socket.on('connect', function () {

        client.readHoldingRegisters(s.StartAddress, blocksWhenNotC)
            .then(function (resp) {
                //console.log(`data for ups ${u.UPSInt} , Bank ${b.BankInt}, For ${s.ForString} \n ${resp.response._body.valuesAsArray}`);
                socket.end()
                ws.emit("dataIncoming", resp.response._body.valuesAsArray, u, b, s);
                return;
            }).catch(async function (err) {
                console.log(err);
                socket.end()
                ws.emit("errr", err, u, b, s);
                return;
            })

    })

}

