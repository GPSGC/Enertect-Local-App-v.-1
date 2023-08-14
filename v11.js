const { create } = require('domain');
const modbus = require('jsmodbus')
const net = require('net')
var PouchDB = require("pouchdb");
const fs = require("fs");
var modbusRemote = new PouchDB("https://admin:admin@1.qindus.io/d");
var modbusLocal = new PouchDB("d");

/*
process.argv.forEach((value, index) => {
    console.log(process.argv[2])
    if (1 == 2) {
        console.log("3333")
        modbusLocal.replicate.from(modbusRemote, function (err, syncResult) {
            if (err) { return console.log(err); }
            console.log("Sync Done " + syncResult);
            modbusLocal.get(value[2], function (err, doc) {
                if (err) { console.log("Cmd is wrong " + err); }
                console.log(doc);
            })
        })
    }
});
*/

//@main
(async () => {
    await modbusLocal.replicate.from(modbusRemote);
    var dbR = await modbusLocal.query("typeGet", { key: "UPS" });
    //console.log(dbR);
    for (ups of dbR.rows) {
        //console.log(ups);
        createUPSThread(ups.value);
    }
    //createUPSThread(dbR.rows);
    // console.log(process.argv);
    //console.log("below");
    console.log(process.argv[2]);
    //await modbusLocal.replicate.from(modbusRemote);
    /*
    try {
        var rDB = await modbusRemote.get(process.argv[2]);
        console.log(rDB);
        // createUPSThread(rDB);

    } catch (err) { console.log("no no no. Go Away " + err) }
    */

})()

//@ups
async function createUPSThread(upsJSON) {
    //  console.log(upsJSON);

    for (bank of upsJSON.UPSBanks) {
        console.log(bank)

        await delayByMS(1000);

        await readModbus(upsJSON.UPSBanksIP, upsJSON.UPSBanksPort, bank.DeviceNumber, 0, bank.Blocks, upsJSON.UPSBanksDisplayName)

        await delayByMS(1000);

        await readModbus(upsJSON.UPSBanksIP, upsJSON.UPSBanksPort, bank.DeviceNumber, 909, bank.Blocks, upsJSON.UPSBanksDisplayName)

        await delayByMS(1000);

    }
    //await delayByMS(ups.SleepMSPooling);

}

//@modbus
async function readModbus(ipModbusServer, portModbusServer, bankDeviceId,
    registerStartInteger, registerNumberReadInteger, DisplayName) {

    const socket = new net.Socket()
    const client = new modbus.client.TCP(socket, bankDeviceId, 15000);
    socket.on('error', console.error)
    socket.connect({ 'host': ipModbusServer, 'port': 502 })
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