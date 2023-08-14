const { resolvePtr } = require('dns');
const modbus = require('jsmodbus')
const net = require('net')
const moduleSql= require('./NodeModbusSQL.js');
var EventLogger = require('node-windows').EventLogger;
 var log = new EventLogger('NodeModbusApp');       
//@main
(async () => {
    //await modbusLocal.replicate.from(modbusRemote);
    var dbR = await getDB(); // await modbusLocal.query("typeGet", { key: "UPS" });
  // console.log(dbR)
    for (var ups of dbR) {
         createUPSThread(ups.UPSID);
      }
})()

var PoolingSleep = 1000;
var NextRoundSleep=1000;
//@ups
async function createUPSThread(upsid) {

  var dbS = await getStringDB(upsid);
  //console.log(dbS)
  //createStringThread(dbS.Rows) 
  var firstBatteryId = 1;
  for( var string of dbS)
  {
       
      await readModbus(string.IPAddress,  string.COMPort,string.SlaveID, 3, string.NoOfBattery, "",firstBatteryId,string.BatteryStringID,"Volt")
      
      firstBatteryId += string.NoOfBattery;
  
  //await delayByMS(ups.SleepMSPooling);
}
}
async function createStringThread(stringJSON) {

  var firstBatteryId = 1;
    // for (var i = 0; i < stringJSON.length; i++)
    //  {
        for( var string of stringJSON)
        {
            // console.log("I am sleeping for " + PoolingSleep + "Bank Name is " + string.SlaveID)
            // await delayByMS(PoolingSleep);
            // console.log("Time to read - Voltage")
            await readModbus(string.IPAddress,  string.COMPort,string.SlaveID, 3, string.NoOfBattery, "",firstBatteryId,string.BatteryStringID,"Volt")
            // console.log("I am sleeping for " + string.PoolingSleep + "Bank Name is " + string.SlaveID)
            // await delayByMS(PoolingSleep);
            // console.log("Time to read - Temperature")
            // await readModbus(string.IPAddress,  string.COMPort,string.SlaveID, 306, string.NoOfBattery, "",firstBatteryId,string.BatteryStringID,"IR")
            // console.log("I am sleeping for " + string.PoolingSleep + "Bank Name is " + string.SlaveID)
            // await delayByMS(PoolingSleep);
            // console.log("Time to read - Temperature")
            // await readModbus(string.IPAddress,  string.COMPort,string.SlaveID, 909, string.NoOfBattery, "",firstBatteryId,string.BatteryStringID,"Temp")

            
            // console.log("I am sleeping for " + PoolingSleep + "Bank Name is " + string.SlaveID)
            // await delayByMS(PoolingSleep);
            // console.log("Time to read - Temperature")
            // await readModbus(string.IPAddress,  string.COMPort,string.SlaveID, 1816, 5, "",firstBatteryId,string.BatteryStringID,"ATSVSC")

            // console.log("Next ROUND - Another bank wil sleep for " + NextRoundSleep)
            // await delayByMS(NextRoundSleep);
            
            firstBatteryId += string.NoOfBattery;
        
        //await delayByMS(ups.SleepMSPooling);
    }
}

//@modbus
async function readModbus(ipModbusServer, portModbusServer, bankDeviceId,
    registerStartInteger, registerNumberReadInteger, DisplayName,firstBatteryId,StringID,Type) {

    const socket = new net.Socket()
    const client = new modbus.client.TCP(socket, bankDeviceId, 15000);
    socket.on('error', console.error)
    socket.connect({ 'host': ipModbusServer, 'port': portModbusServer })
    socket.on('connect', function () {
        client.readHoldingRegisters(registerStartInteger, registerNumberReadInteger)
            .then(function (resp) {
                console.log("IP : "+ ipModbusServer + " SlaveId  : " +bankDeviceId);
                 console.log(resp.response._body.valuesAsArray);
                socket.end()
               // voltageSaveDB(resp.response._body.valuesAsArray, DisplayName);
            //    if (Type == "Volt")
            //    {
            //     voltageSaveDBSQL(resp.response._body.valuesAsArray, firstBatteryId);
            //    }
            //    else if(Type == "IR")
            //     {
            //       IRSaveDBSQL(resp.response._body.valuesAsArray,firstBatteryId);
            //     } 
            //    else if(Type == "Temp")
            //    {
            //     TempSaveDBSQL(resp.response._body.valuesAsArray, firstBatteryId);
            //    } 
            //    else if(Type == "ATSVSC")
            //    {
            //      strVoltage=resp.response._body.valuesAsArray[0]/10 ;
            //      dashboardAt=resp.response._body.valuesAsArray[4]/10 ;
            //      strCurrent=conversionForCurrent(resp.response._body.valuesAsArray[1]) /10;
            //      StrVoltageSaveDBSQL(StringID,strVoltage);
            //      ATSaveDBSQL(StringID,dashboardAt);
            //      StrCurrentSaveDBSQL(StringID,strCurrent);
            //    }  
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


async function getDB() {
  try {
    var resultDB = await fetch("http://localhost:1212/getUPSData", { method: 'GET', redirect: 'follow' });
    var tempJSON = await resultDB.json();
    var upsStringInfo = tempJSON.recordset;
    //console.log(upsStringInfo)

    return upsStringInfo;

  } catch (err) {
    console.log(err);
  } 

}
async function getStringDB(upsid)
 {
  
  try {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    var raw = JSON.stringify({
      UPSID: upsid
    });
    var requestOptions = {method: 'POST',headers: myHeaders,body: raw,redirect: 'follow'};
    var resultDB = await fetch("http://localhost:1212/getUPSStringData", requestOptions);

    console.log(resultDB);
    var tempJSON = await resultDB.json();
    var StringInfo = tempJSON.recordset;
    console.log(StringInfo)

    return StringInfo;

  } catch (err) {
    console.log(err);
  } 

}
function conversionForCurrent(value)
{ 
    //console.log(value);
    let binary = value.toString(2).padStart(16, '0');
    //console.log(binary);
    let negPos,newbinary,CurrenDecimal;
    newbinary=binary.substring(2,binary.length);
    if(binary.substring(0,1) == 0 )
    {       
        negPos=1;
    }
    else
    {
        negPos=-1;
    }
    CurrenDecimal=BinaryToDecimal(newbinary);
    CurrenDecimal = CurrenDecimal * negPos;
    console.log(CurrenDecimal);
    return CurrenDecimal;
}
function BinaryToDecimal(binary) {
    let decimal = 0;
    let binaryLength = binary.length;
    for (let i = binaryLength - 1; i >= 0; i--) {
     if (binary[i] == '1')
      decimal += Math.pow(2, binaryLength - 1 - i);
     }
     return decimal;
}