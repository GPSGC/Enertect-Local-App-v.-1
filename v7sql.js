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
   //console.log(dbR)
    deleteDashbaordData();  // delete previous dashboard records
   var NodeDashboardTimeId =  await getDashbaordTimeId();   //get latest inserted DashbaordTimeId
   // console.log(NodeDashboardTimeId);
    for (var ups of dbR) {
        createUPSThread(ups.UPSID,NodeDashboardTimeId);
        // await delayByMS(2000);
      }
      
})()

var PoolingSleep = 1500;
var NextRoundSleep=1000;
//@ups
async function createUPSThread(upsid,NodeDashboardTimeId) {

  var dbS = await getStringDB(upsid);
 // console.log(dbS)
  // createStringThread(dbS.Rows) 
  var firstBatteryId = 1;
    // for (var i = 0; i < stringJSON.length; i++)
    //  {
       
   
        for(var string of dbS)
        {
            console.log("I am sleeping for " + PoolingSleep + "Bank Name is " + string.SlaveID)
             await delayByMS(PoolingSleep);
            console.log("Time to read - Voltage")
            await readModbus(string.IPAddress,  string.COMPort,string.SlaveID, 3, string.NoOfBattery, "",firstBatteryId,string.BatteryStringID,NodeDashboardTimeId,string.UPSID,"Volt")
            // console.log("I am sleeping for " + string.PoolingSleep + "Bank Name is " + string.SlaveID)
            await delayByMS(PoolingSleep);
            console.log("Time to read - IR")
             await readModbus(string.IPAddress,  string.COMPort,string.SlaveID, 306, string.NoOfBattery, "",firstBatteryId,string.BatteryStringID,NodeDashboardTimeId,string.UPSID,"IR")
            // console.log("I am sleeping for " + string.PoolingSleep + "Bank Name is " + string.SlaveID)
             await delayByMS(PoolingSleep);
             console.log("Time to read - Temp")
            await readModbus(string.IPAddress,  string.COMPort,string.SlaveID, 909, string.NoOfBattery, "",firstBatteryId,string.BatteryStringID,NodeDashboardTimeId,string.UPSID,"Temp")
            //console.log("I am sleeping for " + PoolingSleep + "Bank Name is " + string.SlaveID)
              await delayByMS(PoolingSleep);
             console.log("Time to read - ATSVSC")
              await readModbus(string.IPAddress,  string.COMPort,string.SlaveID, 1816, 5, "",firstBatteryId,string.BatteryStringID,NodeDashboardTimeId,string.UPSID,"ATSVSC")

            console.log("Next ROUND - Another bank wil sleep for " + NextRoundSleep)
             await delayByMS(NextRoundSleep);
            
           // firstBatteryId += string.NoOfBattery;
        
        //await delayByMS(ups.SleepMSPooling);
    }
  
}
async function createStringThread(stringJSON) {

  var firstBatteryId = 1;
    // for (var i = 0; i < stringJSON.length; i++)
    //  {
        for(var string of stringJSON)
        {
            console.log("I am sleeping for " + PoolingSleep + "Bank Name is " + string.SlaveID)
            await delayByMS(PoolingSleep);
            console.log("Time to read - Voltage")
            await readModbus(string.IPAddress,  string.COMPort,string.SlaveID, 3, string.NoOfBattery, "",firstBatteryId,string.BatteryStringID,"Volt")
            console.log("I am sleeping for " + string.PoolingSleep + "Bank Name is " + string.SlaveID)
            await delayByMS(PoolingSleep);
            console.log("Time to read - Temperature")
            await readModbus(string.IPAddress,  string.COMPort,string.SlaveID, 306, string.NoOfBattery, "",firstBatteryId,string.BatteryStringID,"IR")
            console.log("I am sleeping for " + string.PoolingSleep + "Bank Name is " + string.SlaveID)
            await delayByMS(PoolingSleep);
            console.log("Time to read - Temperature")
            await readModbus(string.IPAddress,  string.COMPort,string.SlaveID, 909, string.NoOfBattery, "",firstBatteryId,string.BatteryStringID,"Temp")

            
            console.log("I am sleeping for " + PoolingSleep + "Bank Name is " + string.SlaveID)
            await delayByMS(PoolingSleep);
            console.log("Time to read - Temperature")
            await readModbus(string.IPAddress,  string.COMPort,string.SlaveID, 1816, 5, "",firstBatteryId,string.BatteryStringID,"ATSVSC")

            console.log("Next ROUND - Another bank wil sleep for " + NextRoundSleep)
            await delayByMS(NextRoundSleep);
            
            firstBatteryId += string.NoOfBattery;
        
        //await delayByMS(ups.SleepMSPooling);
    }
}
async function createDischargeThread(UPSID)
{
  console.log("Start Discharge-SV : " +strVoltage + "-SC : " + strCurrent  );
  var lastDischargeRecordTimeId =  await insertDichargeRecord(UPSID);
  console.log("lastTimeId : " + lastDischargeRecordTimeId );

  var dbS = await getStringDB(UPSID);
   
    var firstBatteryId=1;
    for(var string of dbS)
        {
          console.log("I am sleeping for " + PoolingSleep + "Bank Name is " + string.SlaveID)
          await delayByMS(PoolingSleep);
          console.log("Time to read - DischargeVoltage")
          await readModbus(string.IPAddress,  string.COMPort,string.SlaveID, 3, string.NoOfBattery, "",firstBatteryId,string.BatteryStringID,lastDischargeRecordTimeId,string.UPSID,"DischargeVolt")
          // console.log("I am sleeping for " + string.PoolingSleep + "Bank Name is " + string.SlaveID)
          await delayByMS(PoolingSleep);
          console.log("Time to read - DischargeSV/SC")
            await readModbus(string.IPAddress,  string.COMPort,string.SlaveID, 1816, string.NoOfBattery, "",firstBatteryId,string.BatteryStringID,lastDischargeRecordTimeId,string.UPSID,"DischargeSVSC")
          // console.log("I am sleeping for " + string.PoolingSleep + "Bank Name is " + string.SlaveID)
            await delayByMS(PoolingSleep);
          
        }
 
}
//@modbus
async function readModbus(ipModbusServer, portModbusServer, bankDeviceId,
    registerStartInteger, registerNumberReadInteger, DisplayName,firstBatteryId,StringID,NodeDashboardTimeId,UPSID,Type) {

    const socket = new net.Socket()
    const client = new modbus.client.TCP(socket, bankDeviceId, 15000);
    socket.on('error', console.error)
    socket.connect({ 'host': ipModbusServer, 'port': portModbusServer })
    socket.on('connect', function () {
        client.readHoldingRegisters(registerStartInteger, registerNumberReadInteger)
            .then(function (resp) {
                console.log(resp.response._body.valuesAsArray)
                socket.end()
               // voltageSaveDB(resp.response._body.valuesAsArray, DisplayName);
               
               if (Type == "Volt")
               {
                 voltageSaveDBSQL(resp.response._body.valuesAsArray, firstBatteryId,StringID,NodeDashboardTimeId);
               }
               else if(Type == "IR")
                {
                  IRSaveDBSQL(resp.response._body.valuesAsArray,firstBatteryId,StringID,NodeDashboardTimeId);
                } 
               else if(Type == "Temp")
               {
                TempSaveDBSQL(resp.response._body.valuesAsArray, firstBatteryId,StringID,NodeDashboardTimeId);
               } 
               else if(Type == "ATSVSC")
               {
                 strVoltage=resp.response._body.valuesAsArray[0]/10 ;
                 dashboardAt=resp.response._body.valuesAsArray[4]/10 ;
                 strCurrent=conversionForCurrent(resp.response._body.valuesAsArray[1]) /10;
                 StrVoltageSaveDBSQL(StringID,strVoltage,NodeDashboardTimeId);
                 ATSaveDBSQL(StringID,dashboardAt,NodeDashboardTimeId);
                 StrCurrentSaveDBSQL(StringID,strCurrent,NodeDashboardTimeId);
                  
                 //*********************************************Check Dicharge********************************* 
                  console.log("Checking discharge : " + " UPSID : "+UPSID + "-discharge Status : "+ checkDischarge(strVoltage,strCurrent,registerNumberReadInteger));
                  if (checkDischarge(strVoltage,strCurrent,registerNumberReadInteger))
                  { 
                    createDischargeThread(UPSID);
                  }
                   //********************************************************************************************
               }  
               else if(Type == "DischargeVolt")
               {
                insertDischargeVoltage(resp.response._body.valuesAsArray,firstBatteryId,NodeDashboardTimeId,StringID);
               }
               else if(Type == "DischargeSVSC")
               {
                disstrVoltage=resp.response._body.valuesAsArray[0]/10 ;
                 disstrCurrent=conversionForCurrent(resp.response._body.valuesAsArray[1]) /10;

                insertInDischargeStrVoltage(disstrVoltage, NodeDashboardTimeId,StringID);
                insertInDischargeStrCurrent(disstrCurrent, NodeDashboardTimeId,StringID);
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
async function voltageSaveDBSQL(value,firstBatteryId,StringId,NodeDashboardTimeId)
{
    for (i=0, j=firstBatteryId; i<value.length; i++, j++) {
     
      let batteryIdinsert=j;
      let Value=value[i];
      var myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");
       var raw = JSON.stringify({"BatteryId": batteryIdinsert,"Value":Value/1000,"StringId":StringId,"NodeDashboardTimeId":NodeDashboardTimeId });
       var requestOptions = { method: 'POST',headers: myHeaders, body: raw, redirect: 'follow'};

     fetch("http://localhost:1212/insertInDashboardVoltage", requestOptions).then(response => response.text())
       .then(result => console.log(result))
       .catch(error => console.log('error', error));
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
      //           var raw = JSON.stringify({"BatteryId": batteryIdinsert,"Value":Value/1000,"StringId":StringId });
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
function IRSaveDBSQL(value,firstBatteryId,StringId,NodeDashboardTimeId)
{
    for (i=0, j=firstBatteryId; i<value.length; i++, j++) {
        //console.log("1 row inserted")
      //  console.log("batteryid" + j);
      let batteryIdinsert=j;
      let Value=value[i];
      
      var myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");
       var raw = JSON.stringify({"BatteryId": batteryIdinsert,"Value":Value/1000,"StringId":StringId,"NodeDashboardTimeId":NodeDashboardTimeId  });
       var requestOptions = { method: 'POST',headers: myHeaders, body: raw, redirect: 'follow'};

     fetch("http://localhost:1212/insertInDashboardIR", requestOptions).then(response => response.text())
       .then(result => console.log(result))
       .catch(error => console.log('error', error));
        // //*********************************Add in DB*****************************************
        // var myHeaders = new Headers();
        // myHeaders.append("Content-Type", "application/json");

        // var raw = JSON.stringify({
        //     "BatteryId": batteryIdinsert       
        // });

        // var requestOptions = {method: 'POST',headers: myHeaders,body: raw,redirect: 'follow'};

        // fetch("http://localhost:1212/checkDashboardIRByBatteryID", requestOptions)
        //   .then(response => response.text())
        //   .then(result =>{
        //    // console.log(result)
        //     var tempJSON = JSON.parse(result);
        //     //console.log(tempJSON.recordset) ;          
        //     var count=tempJSON.recordset[0].Count;        
                     
        //     if (count == 0)
        //     {
        //        //console.log("count : " + count + "--batteryidinsert : " + batteryIdinsert+ "--Value : "+Value)
        //         //console.log("checkquery :" + batteryIdinsert);
        //         //*********************************Add in DB*****************************************
        //       var myHeaders = new Headers();
        //       myHeaders.append("Content-Type", "application/json");

        //       var raw = JSON.stringify({
        //           "BatteryId": batteryIdinsert,
        //         "Value":Value/1000 // parseInt(value[i])/1000
        //       });

        //       var requestOptions = {method: 'POST',headers: myHeaders,body: raw,redirect: 'follow'};

        //       fetch("http://localhost:1212/insertInDashboardIR", requestOptions)
        //         .then(response => response.text())
        //         .then(result => console.log(result))
        //         .catch(error => console.log('error', error));
          
        //     }
        //     else
        //     {
        //       //console.log("count : " + count + "--batteryidinsert : " + batteryIdinsert+ "--Value : "+Value)
        //       //*********************************Update in DB*****************************************
        //     var myHeaders = new Headers();
        //     myHeaders.append("Content-Type", "application/json");

        //     var raw = JSON.stringify({
                
        //       "Value":Value/1000 ,// parseInt(value[i])/1000
        //       "BatteryId": batteryIdinsert
        //     });

        //     var requestOptions = {method: 'PUT',headers: myHeaders,body: raw,redirect: 'follow'};

        //     fetch("http://localhost:1212/updateDashboardIRByBatteryID", requestOptions)
        //       .then(response => response.text())
        //       .then(result => console.log(result))
        //       .catch(error => console.log('error', error));        
        //   }      
        //  })
        //   .catch(error => console.log('error', error));
        // //********************************************************************************************        
  }
}
function TempSaveDBSQL(value,firstBatteryId,StringId,NodeDashboardTimeId)
{
    for (i=0, j=firstBatteryId; i<value.length; i++, j++) {
        //console.log("1 row inserted")
      //  console.log("batteryid" + j);
      let batteryIdinsert=j;
      let Value=value[i];
      var myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");
       var raw = JSON.stringify({"BatteryId": batteryIdinsert,"Value":Value/10,"StringId":StringId ,"NodeDashboardTimeId":NodeDashboardTimeId });
       var requestOptions = { method: 'POST',headers: myHeaders, body: raw, redirect: 'follow'};

     fetch("http://localhost:1212/insertInDashboardTemp", requestOptions).then(response => response.text())
       .then(result => console.log(result))
       .catch(error => console.log('error', error));
        // //*********************************Add in DB*****************************************
        // var myHeaders = new Headers();
        // myHeaders.append("Content-Type", "application/json");

        // var raw = JSON.stringify({"BatteryId": batteryIdinsert});

        // var requestOptions = {method: 'POST',headers: myHeaders,body: raw,redirect: 'follow'};

        // fetch("http://localhost:1212/checkDashboardTempByBatteryID", requestOptions)
        //   .then(response => response.text())
        //   .then(result =>{
        //    // console.log(result)
        //     var tempJSON = JSON.parse(result);
        //     //console.log(tempJSON.recordset) ;          
        //     var count=tempJSON.recordset[0].Count;        
                     
        //     if (count == 0)
        //     {
        //       // console.log("count : " + count + "--batteryidinsert : " + batteryIdinsert+ "--Value : "+Value)
        //         //console.log("checkquery :" + batteryIdinsert);
        //         //*********************************Add in DB*****************************************
        //       var myHeaders = new Headers();
        //       myHeaders.append("Content-Type", "application/json");

        //       var raw = JSON.stringify({
        //           "BatteryId": batteryIdinsert,
        //         "Value":Value/10 // parseInt(value[i])/1000
        //       });

        //       var requestOptions = {method: 'POST',headers: myHeaders,body: raw,redirect: 'follow'};

        //       fetch("http://localhost:1212/insertInDashboardTemp", requestOptions)
        //         .then(response => response.text())
        //         .then(result => console.log(result))
        //         .catch(error => console.log('error', error));
          
        //     }
        //     else
        //     {
        //       //console.log("count : " + count + "--batteryidinsert : " + batteryIdinsert+ "--Value : "+Value)
        //       //*********************************Update in DB*****************************************
        //     var myHeaders = new Headers();
        //     myHeaders.append("Content-Type", "application/json");

        //     var raw = JSON.stringify({
                
        //       "Value":Value/10 ,// parseInt(value[i])/1000
        //       "BatteryId": batteryIdinsert
        //     });

        //     var requestOptions = {method: 'PUT',headers: myHeaders,body: raw,redirect: 'follow'};

        //     fetch("http://localhost:1212/updateDashboardTempByBatteryID", requestOptions)
        //       .then(response => response.text())
        //       .then(result => console.log(result))
        //       .catch(error => console.log('error', error));        
        //   }
      
        //   })
        //   .catch(error => console.log('error', error));
        // //********************************************************************************************
        
  }
}
async function  StrVoltageSaveDBSQL(BatteryStringID,value,NodeDashboardTimeId)
{
  try {
    //*********************************Add StrVolt in DB*****************************************
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    var raw = JSON.stringify({"BatteryStringID": BatteryStringID,"Value": value,"NodeDashboardTimeId":NodeDashboardTimeId });
    var requestOptions = {method: 'POST',headers: myHeaders,body: raw,redirect: 'follow'};
    fetch("http://localhost:1212/insertInStringVoltage", requestOptions)
    .then(response => response.text())
    .then(result => console.log(result))
    .catch(error => console.log('error', error));
    //************************************************************************************** 
    //  var myHeaders = new Headers();
    // myHeaders.append("Content-Type", "application/json");
    // var raw = JSON.stringify({
    //    "BatteryStringID": BatteryStringID 
    // });
    // var requestOptions = {method: 'POST',headers: myHeaders,body: raw,redirect: 'follow'};
    // var resultDB = await fetch("http://localhost:1212/checkStringVoltageByBatteryStringID", requestOptions);
    // var tempJSON = await resultDB.json();
    // var upsStringInfo = tempJSON.recordset;
    // // console.log(upsStringInfo[0].Count);
    // var rowCount=upsStringInfo[0].Count;
    // if (rowCount == 0)
    // {
    //   //*********************************Add StrVolt in DB*****************************************
    //     var myHeaders = new Headers();
    //     myHeaders.append("Content-Type", "application/json");
    //     var raw = JSON.stringify({
    //     "BatteryStringID": BatteryStringID,
    //     "Value": value
    //     });
    //     var requestOptions = {method: 'POST',headers: myHeaders,body: raw,redirect: 'follow'};
    //     fetch("http://localhost:1212/insertInStringVoltage", requestOptions)
    //     .then(response => response.text())
    //     .then(result => console.log(result))
    //     .catch(error => console.log('error', error));
    //     //************************************************************************************** 
    // }
    // else
    // {
    //   //*********************************Update StrVolt in DB*****************************************
    //     var myHeaders = new Headers();
    //     myHeaders.append("Content-Type", "application/json");
    //     var raw = JSON.stringify({
    //        "Value": value,
    //        "BatteryStringID": BatteryStringID
    //     });
    //     var requestOptions = {method: 'PUT',headers: myHeaders,body: raw,redirect: 'follow'};
    //     fetch("http://localhost:1212/updateInStringVoltage", requestOptions)
    //     .then(response => response.text())
    //     .then(result => console.log(result))
    //     .catch(error => console.log('error', error));
    //     //************************************************************************************** 
    // }    

  } catch (err) {
    console.log(err);
  } 
   
}
async function  ATSaveDBSQL(BatteryStringID,value,NodeDashboardTimeId)
{
  try {
    //*********************************Add StrVolt in DB*****************************************
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    var raw = JSON.stringify({"BatteryStringID": BatteryStringID,"Value": value,"NodeDashboardTimeId":NodeDashboardTimeId });
    var requestOptions = {method: 'POST',headers: myHeaders,body: raw,redirect: 'follow'};
    fetch("http://localhost:1212/insertInDAshboardAT", requestOptions)
    .then(response => response.text())
    .then(result => console.log(result))
    .catch(error => console.log('error', error));
    //************************************************************************************** 
  //   var myHeaders = new Headers();
  //  myHeaders.append("Content-Type", "application/json");
  //  var raw = JSON.stringify({
  //     "BatteryStringID": BatteryStringID 
  //  });
  //  var requestOptions = {method: 'POST',headers: myHeaders,body: raw,redirect: 'follow'};
  //  var resultDB = await fetch("http://localhost:1212/checkDashboardAtByBatteryStringID", requestOptions);
  //  var tempJSON = await resultDB.json();
  //  var upsStringInfo = tempJSON.recordset;
  //  // console.log(upsStringInfo[0].Count);
  //  var rowCount=upsStringInfo[0].Count;
  //  if (rowCount == 0)
  //  {
  //    //*********************************Add StrVolt in DB*****************************************
  //      var myHeaders = new Headers();
  //      myHeaders.append("Content-Type", "application/json");
  //      var raw = JSON.stringify({
  //      "BatteryStringID": BatteryStringID,
  //      "Value": value
  //      });
  //      var requestOptions = {method: 'POST',headers: myHeaders,body: raw,redirect: 'follow'};
  //      fetch("http://localhost:1212/insertInDAshboardAT", requestOptions)
  //      .then(response => response.text())
  //      .then(result => console.log(result))
  //      .catch(error => console.log('error', error));
  //      //************************************************************************************** 
  //  }
  //  else
  //  {
  //    //*********************************Update StrVolt in DB*****************************************
  //      var myHeaders = new Headers();
  //      myHeaders.append("Content-Type", "application/json");
  //      var raw = JSON.stringify({
  //         "Value": value,
  //         "BatteryStringID": BatteryStringID
  //      });
  //      var requestOptions = {method: 'PUT',headers: myHeaders,body: raw,redirect: 'follow'};
  //      fetch("http://localhost:1212/updateInDashboardAT", requestOptions)
  //      .then(response => response.text())
  //      .then(result => console.log(result))
  //      .catch(error => console.log('error', error));
  //      //************************************************************************************** 
  //  }    

 } catch (err) {
   console.log(err);
 } 
}
async function  StrCurrentSaveDBSQL(BatteryStringID,value,NodeDashboardTimeId)
{
  try {
    //*********************************Add StrVolt in DB*****************************************
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    var raw = JSON.stringify({"BatteryStringID": BatteryStringID,"Value": value,"NodeDashboardTimeId":NodeDashboardTimeId });
    var requestOptions = {method: 'POST',headers: myHeaders,body: raw,redirect: 'follow'};
    fetch("http://localhost:1212/insertInStringCurrent", requestOptions)
    .then(response => response.text())
    .then(result => console.log(result))
    .catch(error => console.log('error', error));
    //************************************************************************************** 
  //   var myHeaders = new Headers();
  //  myHeaders.append("Content-Type", "application/json");
  //  var raw = JSON.stringify({
  //     "BatteryStringID": BatteryStringID 
  //  });
  //  var requestOptions = {method: 'POST',headers: myHeaders,body: raw,redirect: 'follow'};
  //  var resultDB = await fetch("http://localhost:1212/checkStrCurrentByBatteryStringID", requestOptions);
  //  var tempJSON = await resultDB.json();
  //  var upsStringInfo = tempJSON.recordset;
  //  // console.log(upsStringInfo[0].Count);
  //  var rowCount=upsStringInfo[0].Count;
  //  if (rowCount == 0)
  //  {
  //    //*********************************Add StrVolt in DB*****************************************
  //      var myHeaders = new Headers();
  //      myHeaders.append("Content-Type", "application/json");
  //      var raw = JSON.stringify({
  //      "BatteryStringID": BatteryStringID,
  //      "Value": value
  //      });
  //      var requestOptions = {method: 'POST',headers: myHeaders,body: raw,redirect: 'follow'};
  //      fetch("http://localhost:1212/insertInStringCurrent", requestOptions)
  //      .then(response => response.text())
  //      .then(result => console.log(result))
  //      .catch(error => console.log('error', error));
  //      //************************************************************************************** 
  //  }
  //  else
  //  {
  //    //*********************************Update StrVolt in DB*****************************************
  //      var myHeaders = new Headers();
  //      myHeaders.append("Content-Type", "application/json");
  //      var raw = JSON.stringify({
  //         "Value": value,
  //         "BatteryStringID": BatteryStringID
  //      });
  //      var requestOptions = {method: 'PUT',headers: myHeaders,body: raw,redirect: 'follow'};
  //      fetch("http://localhost:1212/updateInStringCurrent", requestOptions)
  //      .then(response => response.text())
  //      .then(result => console.log(result))
  //      .catch(error => console.log('error', error));
  //      //************************************************************************************** 
  //  }    

 } catch (err) {
   console.log(err);
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
async function getDashbaordTimeId()
 {
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  var raw = JSON.stringify({
  "DashboardTime": new Date() 
  });
  var requestOptions = {method: 'POST',headers: myHeaders,body: raw,redirect: 'follow'};
  var resultDB = await fetch("http://localhost:1212/insertInDashboardTime", requestOptions)
    // console.log(resultDB);
   var tempJSON = await resultDB.json();
   var StringInfo = tempJSON.recordset;
   NodeDashboardTimeId= StringInfo[0].NodeDashboardTimeId;

 return NodeDashboardTimeId;
}
async function deleteDashbaordData()
 {  
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");  
  var requestOptions = {method: 'DELETE',headers: myHeaders,redirect: 'follow'};
  fetch("http://localhost:1212/deleteDashboardData", requestOptions)
  .then(response => response.text())
  .then(result => console.log(result))
  .catch(error => console.log('error', error));
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
function checkDischarge(strVoltage,strCurrent,NoOfBattery)
{ 
    let m_discharge =false;
    if (strVoltage != 0  && strCurrent != 0)  
    {
        
        // dischargeOn = (strVoltage <= (NoOfBattery * 12.72)) && (strCurrent <= -5);
        dischargeOn =   (strVoltage >50) && (strCurrent>1);// (strVoltage <= (NoOfBattery * 12.72)) && (strCurrent <= -5);   //(strVoltage >50) && (strCurrent>1);
        dischargeOff  = (strVoltage >= (NoOfBattery * 12.72)) && (strCurrent >= -5);
        if (dischargeOn)
        {
            console.log("Discharge Started !!");
            m_discharge=true;
        }
        if (dischargeOff && m_discharge)
        {
            console.log("Discharge Stop !!");
            m_discharge=false;
        }
        
    }
     return m_discharge;
}
async function insertDichargeRecord(UPSID)
{
      var lastDischargeRecordTimeId;
      var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        var raw = JSON.stringify({
            "UPSID": UPSID,"startdischarge": new Date()});
        var requestOptions = {method: 'POST',headers: myHeaders,body: raw,redirect: 'follow'};

        var resultDB = await  fetch("http://localhost:1212/insertIndichargerecord", requestOptions)
        var tempJSON = await resultDB.json();
        var dbInfo = tempJSON.recordset;
        var lastDischargerecordId = dbInfo[0].NodeDischargeRecordId;
        
     //*************************************************************************** */
        var rawTime = JSON.stringify({
          "NodeDischargeRecordId": lastDischargerecordId,
          "DischargeRecordTime": new Date()
        });

        var requestOptions = {method: 'POST',headers: myHeaders,body: rawTime,redirect: 'follow'};

      var resultTimeDB =await  fetch("http://localhost:1212/insertIndischargerecordTime", requestOptions)
      var tempTimeJSON = await resultTimeDB.json();
      var dbTimeInfo = tempTimeJSON.recordset;
      var lastDischargeRecordTimeId = dbTimeInfo[0].NodeDischargeRecordTimeId;
        
      return lastDischargeRecordTimeId;
}
function insertDischargeVoltage(value,firstBatteryId,TimeId,stringId)
{
    for (i=0, j=firstBatteryId; i<value.length; i++, j++) {
        //console.log("1 row inserted")

        //*********************************Add in DB*****************************************
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        var raw = JSON.stringify({
            "No": j,
          "Value": parseInt(value[i])/1000,
          "TimeId" :TimeId,
          "StringId":stringId
        });

        var requestOptions = {
          method: 'POST',
          headers: myHeaders,
          body: raw,
          redirect: 'follow'
        };

        fetch("http://localhost:1212/insertInDischargeVoltage", requestOptions)
          .then(response => response.text())
          .then(result => console.log(result))
          .catch(error => console.log('error', error));
        //********************************************************************************************
        
      }
}
function insertInDischargeStrVoltage(value, TimeId,stringId)
{
  
        //*********************************Add in DB*****************************************
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        var raw = JSON.stringify({
            
          "Value": value,
         
          "StringId":stringId,
          "NodeDischargeRecordTimeId":TimeId
        });

        var requestOptions = {
          method: 'POST',
          headers: myHeaders,
          body: raw,
          redirect: 'follow'
        };

        fetch("http://localhost:1212/insertInDischargeStrVoltage", requestOptions)
          .then(response => response.text())
          .then(result => console.log(result))
          .catch(error => console.log('error', error));
        //********************************************************************************************
     
}
function insertInDischargeStrCurrent(value, TimeId,stringId)
{
  
        //*********************************Add in DB*****************************************
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        var raw = JSON.stringify({
            
          "Value":value,
           
          "StringId":stringId,
          "NodeDischargeRecordTimeId":TimeId
        });

        var requestOptions = {
          method: 'POST',
          headers: myHeaders,
          body: raw,
          redirect: 'follow'
        };

        fetch("http://localhost:1212/insertInDischargeStrCurrent", requestOptions)
          .then(response => response.text())
          .then(result => console.log(result))
          .catch(error => console.log('error', error));
        //********************************************************************************************
     
}