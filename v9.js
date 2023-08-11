const { resolvePtr } = require('dns');
const modbus = require('jsmodbus')
const net = require('net')
const moduleSql= require('./NodeModbusSQL.js');

var EventLogger = require('node-windows').EventLogger;
 var log = new EventLogger('NodeModbusApp');       
//@main
(async () => {
   
    var dbR = await getDB(); 
  
    for (var ups of dbR) {
         createUPSThread(ups.UPSID);
         console.log("Thread created for UPS :" + ups.UPSID)
         
      }
})()

var PoolingSleep = 1000;
var NextRoundSleep=1000;
//@ups
async function createUPSThread(upsid) {

  var dbS = await getStringDB(upsid);
 
    createStringThread(dbS);
    console.log("String thread created for :" + dbS.BatteryStringID )
    
}
async function createStringThread(stringJSON) {
  var firstBatteryId = 1;
   
      for (var string of stringJSON)  
        {
           
             await  readModbus(string.IPAddress,  string.COMPort,string.SlaveID, 3, string.NoOfBattery, "",firstBatteryId,string.BatteryStringID,"Volt")
         
           firstBatteryId += string.NoOfBattery;
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
            .then(function (resp)
             {
                console.log("Slaveid" +  bankDeviceId)
                console.log(resp.response._body.valuesAsArray)
                socket.end()
            if (Type == "Volt")
               {
               // voltageSaveDBSQL(resp.response._body.valuesAsArray, firstBatteryId,StringID);
               }
              
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

async function voltageSaveDBSQL(value,firstBatteryId,StringID)
{
  //*********************************Add in DB array*****************************************
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  var raw = JSON.stringify({
      "BatteryStringID": StringID,
    "Value": value
  });

  var requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow'
  };

  fetch("http://localhost:1212/insertarray", requestOptions)
    .then(response => response.text())
    .then(result => console.log(result))
    .catch(error => console.log('error', error));
    
  //********************************************************************************************
    for (i=0, j=firstBatteryId; i<value.length; i++, j++) {
     
       //*********************************Add in DB*****************************************
       var myHeaders = new Headers();
       myHeaders.append("Content-Type", "application/json");

       var raw = JSON.stringify({
           "BatteryId": j,
         "Value": parseInt(value[i])/1000,
         "StringId" : StringID
       });

       var requestOptions = {
         method: 'POST',
         headers: myHeaders,
         body: raw,
         redirect: 'follow'
       };

       console.log("BatteryId-" + j + "StringID-" + StringID)
       fetch("http://localhost:1212/insertInDashboardVoltage", requestOptions)
         .then(response => response.text())
        // .then(result => console.log(result))
         .catch(error => console.log('error', error));
       //********************************************************************************************
      // let batteryIdinsert=j;
      // let Value=value[i];
    
      //   var myHeaders = new Headers();
      //   myHeaders.append("Content-Type", "application/json");
      //   var raw = JSON.stringify({ "BatteryId": batteryIdinsert });
      //   var requestOptions = { method: 'POST', headers: myHeaders, body: raw, redirect: 'follow' };

      //   fetch("http://localhost:1212/checkDashboardVoltageByBatteryID", requestOptions).then(response => response.text())
      //     .then(result =>{
      //       var tempJSON = JSON.parse(result);
      //        var count=tempJSON.recordset[0].Count;        
                     
      //       if (count == 0)
      //       {
      //          console.log("Insert--"+"count : " + count + "--batteryidinsert : " + batteryIdinsert+ "--Value : "+Value)
      //          var myHeaders = new Headers();
      //          myHeaders.append("Content-Type", "application/json");
      //           var raw = JSON.stringify({"BatteryId": batteryIdinsert,"Value":Value/1000 });
      //           var requestOptions = { method: 'POST',headers: myHeaders, body: raw, redirect: 'follow'};

      //         fetch("http://localhost:1212/insertInDashboardVoltage", requestOptions).then(response => response.text())
      //           .then(result => console.log(result))
      //           .catch(error => console.log('error', error));
      //      }
      //       else
      //       {
            
      //        var myHeaders = new Headers();
      //        myHeaders.append("Content-Type", "application/json");
      //        var raw = JSON.stringify({ "Value":Value/1000 ,"BatteryId": batteryIdinsert });
      //        var requestOptions = { method: 'PUT', headers: myHeaders, body: raw, redirect: 'follow' };

      //       fetch("http://localhost:1212/updateDashboardVoltageByBatteryID", requestOptions).then(response => response.text())
      //         .then(result => console.log(result))
      //         .catch(error => console.log('error', error)); }
      //  }) .catch(error => console.log('error', error));
       
  }
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

    //console.log(resultDB);
    var tempJSON = await resultDB.json();
    var StringInfo = tempJSON.recordset;
   //console.log(StringInfo)

    return StringInfo;

  } catch (err) {
    console.log(err);
  } 

}
