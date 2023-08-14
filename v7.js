const { resolvePtr } = require('dns');
const modbus = require('jsmodbus')
const net = require('net')
var PouchDB = require("pouchdb");
var modbusRemote = new PouchDB("https://admin:admin@1.qindus.io/d");
var modbusLocal = new PouchDB("d");

//@main
(async () => {
    await modbusLocal.replicate.from(modbusRemote);
    var dbR = await modbusLocal.query("typeGet", { key: "UPS" });
    createUPSThread(dbR.rows);

})()

//@ups
async function createUPSThread(upsJSON) {

    for (ups of upsJSON) {
        for (bank of ups.value.UPSBanks) {

            await readModbus(ups.value.IP, ups.value.Port, bank.DeviceNumber, 0, bank.Blocks, ups.value.DisplayName, bank.DisplayName)
            await delayByMS(10000);

        }

    }
}

//@modbus
async function readModbus(ipModbusServer, portModbusServer, bankDeviceId,
    registerStartInteger, registerNumberReadInteger, DisplayName, BankDisplayName) {

    const socket = new net.Socket()
    const client = new modbus.client.TCP(socket, bankDeviceId, 15000);
    socket.on('error', console.error)
    socket.connect({ 'host': ipModbusServer, 'port': portModbusServer })
    socket.on('connect', function () {
        client.readHoldingRegisters(registerStartInteger, registerNumberReadInteger)
            .then(function (resp) {
                //console.log(resp.response._body.valuesAsArray)
                socket.end()

                voltageSaveDB(resp.response._body.valuesAsArray, DisplayName);
            }).catch(function (err) {
                console.log(err);
                socket.end()
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
    console.log(finalJSON2Upload);
    try {
        modbusRemote.post(finalJSON2Upload);
    } catch (err) { console.log(err); }
}