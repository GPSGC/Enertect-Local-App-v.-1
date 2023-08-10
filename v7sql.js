const { resolvePtr } = require('dns');
const modbus = require('jsmodbus')
const net = require('net')
// var PouchDB = require("pouchdb");
// var modbusRemote = new PouchDB("https://admin:admin@1.qindus.io/d");
// var modbusLocal = new PouchDB("d");
var EventLogger = require('node-windows').EventLogger;
 var log = new EventLogger('NodeModbusApp');       
 

//@main
(async () => {
    await modbusLocal.replicate.from(modbusRemote);
    var dbR = await getDB(); // await modbusLocal.query("typeGet", { key: "UPS" });
    createUPSThread(dbR.rows);

})()

var PoolingSleep = 1000;
var NextRoundSleep=1000;
//@ups
async function createUPSThread(upsJSON) {

    // for (ups of upsJSON) {
    //     for (bank of ups.value.UPSBanks) {
        var firstBatteryId = 1;
    for (var i = 0; i < upsJSON.length; i++)
     {
        var IPAddress = upsStringInfo[i].IPAddress;
        var COMPort = upsStringInfo[i].COMPort;
        var SlaveID = upsStringInfo[i].SlaveID;
        var NoOfBattery = upsStringInfo[i].NoOfBattery;
        var StringId = upsStringInfo[i].BatteryStringID;
        var UPSID = upsStringInfo[i].UPSID;
            console.log("I am sleeping for " + PoolingSleep + "Bank Name is " + SlaveID)
            await delayByMS(PoolingSleep);
            console.log("Time to read - Voltage")
            await readModbus( IPAddress,  COMPort,SlaveID, 3, NoOfBattery, "",firstBatteryId)

            // console.log("I am sleeping for " + ups.value.PoolingSleep + "Bank Name is " + bank.DisplayName)
            // await delayByMS(ups.value.PoolingSleep);
            // console.log("Time to read - Temperature")
            // await readModbus(ups.value.IP, ups.value.Port, bank.DeviceNumber, 909, bank.Blocks, ups.value.DisplayName)

            console.log("Next ROUND - Another bank wil sleep for " + NextRoundSleep)
            await delayByMS(NextRoundSleep);
            firstBatteryId += NoOfBattery;
        
        //await delayByMS(ups.SleepMSPooling);
    }
}

//@modbus
async function readModbus(ipModbusServer, portModbusServer, bankDeviceId,
    registerStartInteger, registerNumberReadInteger, DisplayName,firstBatteryId) {

    const socket = new net.Socket()
    const client = new modbus.client.TCP(socket, bankDeviceId, 15000);
    socket.on('error', console.error)
    socket.connect({ 'host': ipModbusServer, 'port': portModbusServer })
    socket.on('connect', function () {
        client.readHoldingRegisters(registerStartInteger, registerNumberReadInteger)
            .then(function (resp) {
                //console.log(resp.response._body.valuesAsArray)
                socket.end()
               // voltageSaveDB(resp.response._body.valuesAsArray, DisplayName);
                 voltageSaveDBSQL(resp.response._body.valuesAsArray, firstBatteryId);
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

// //@voltage
// async function voltageSaveDB(voltageArray, DisplayName) {
//     var voltageJSONArray = [];

//     var finalJSON2Upload = {
//         "Date": new Date(),
//         "Type": "VoltageValue",
//         "UPSDisplayName": DisplayName,
//         "VoltageValues": voltageArray
//     }
//     console.log(finalJSON2Upload);
//     try {
//         modbusRemote.post(finalJSON2Upload);
//     } catch (err) { console.log(err); }
// }
async function voltageSaveDBSQL(value,firstBatteryId)
{
    for (i=0, j=firstBatteryId; i<value.length; i++, j++) {
        //console.log("1 row inserted")
      //  console.log("batteryid" + j);
      let batteryIdinsert=j;
      let Value=value[i];
    
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        var raw = JSON.stringify({ "BatteryId": batteryIdinsert });
        var requestOptions = { method: 'POST', headers: myHeaders, body: raw, redirect: 'follow' };

        fetch("http://localhost:1212/checkDashboardVoltageByBatteryID", requestOptions).then(response => response.text())
          .then(result =>{
            var tempJSON = JSON.parse(result);
             var count=tempJSON.recordset[0].Count;        
                     
            if (count == 0)
            {
               console.log("Insert--"+"count : " + count + "--batteryidinsert : " + batteryIdinsert+ "--Value : "+Value)
               var myHeaders = new Headers();
               myHeaders.append("Content-Type", "application/json");
               var raw = JSON.stringify({"BatteryId": batteryIdinsert,"Value":Value/1000 });

              var requestOptions = { method: 'POST',headers: myHeaders,
                body: raw,
                redirect: 'follow'
              };

              fetch("http://localhost:1212/insertInDashboardVoltage", requestOptions)
                .then(response => response.text())
                .then(result => console.log(result))
                .catch(error => console.log('error', error));
          
            }
            else
            {
              console.log("Update--"+"count : " + count + "--batteryidinsert : " + batteryIdinsert+ "--Value : "+Value)
              //*********************************Update in DB*****************************************
            var myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/json");

            var raw = JSON.stringify({
                
              "Value":Value/1000 ,// parseInt(value[i])/1000
              "BatteryId": batteryIdinsert
            });

            var requestOptions = {
              method: 'PUT',
              headers: myHeaders,
              body: raw,
              redirect: 'follow'
            };

            fetch("http://localhost:1212/updateDashboardVoltageByBatteryID", requestOptions)
              .then(response => response.text())
              .then(result => console.log(result))
              .catch(error => console.log('error', error));
        
          }
      
          })
          .catch(error => console.log('error', error));
        //********************************************************************************************
        
  }
}
async function getDB() {
    try {
      var resultDB = await fetch("http://localhost:1212/getUPSStringData", { method: 'GET', redirect: 'follow' });
      var tempJSON = await resultDB.json();
      var upsStringInfo = tempJSON.recordset;
      //console.log(upsStringInfo)
  
      return upsStringInfo;
  
    } catch (err) {
      console.log(err);
    } 
  
  }