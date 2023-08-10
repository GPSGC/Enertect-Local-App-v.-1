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

            console.log("I am sleeping for " + ups.value.PoolingSleep + "Bank Name is " + bank.DisplayName)
            await delayByMS(ups.value.PoolingSleep);
            console.log("Time to read - Voltage")
            await readModbus(ups.value.IP, ups.value.Port, bank.DeviceNumber, 0, bank.Blocks, ups.value.DisplayName)

            console.log("I am sleeping for " + ups.value.PoolingSleep + "Bank Name is " + bank.DisplayName)
            await delayByMS(ups.value.PoolingSleep);
            console.log("Time to read - Temperature")
            await readModbus(ups.value.IP, ups.value.Port, bank.DeviceNumber, 909, bank.Blocks, ups.value.DisplayName)

            console.log("Next ROUND - Another bank wil sleep for " + ups.value.NextRoundSleep)
            await delayByMS(ups.value.NextRoundSleep);

        }
        //await delayByMS(ups.SleepMSPooling);
    }
}

//@modbus
async function readModbus(ipModbusServer, portModbusServer, bankDeviceId,
    registerStartInteger, registerNumberReadInteger, DisplayName) {

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
async function voltageSaveDB(voltageArray, DisplayName) {
    var voltageJSONArray = [];

    var finalJSON2Upload = {
        "Date": new Date(),
        "Type": "VoltageValue",
        "UPSDisplayName": DisplayName,
        "VoltageValues": voltageArray
    }
    console.log(finalJSON2Upload);
    try {
        modbusRemote.post(finalJSON2Upload);
    } catch (err) { console.log(err); }
}