const { resolvePtr } = require('dns');
const modbus = require('jsmodbus')
const net = require('net')
const moduleSql= require('./NodeModbusSQL.js');
var EventLogger = require('node-windows').EventLogger;
 var log = new EventLogger('NodeModbusApp');       
//@main
(async () => {
  
   var dbR = await getDB(); 
  
   deleteDashbaordData();  // delete previous dashboard records
   var NodeDashboardTimeId =  await getDashbaordTimeId();   //get latest inserted DashbaordTimeId
  
    for (var ups of dbR) {
        createUPSThread(ups.UPSID,NodeDashboardTimeId);  }
      
})()

var PoolingSleep = 1500;
var NextRoundSleep=1000;
//@ups
async function createUPSThread(upsid,NodeDashboardTimeId) {

  var dbS = await getStringDB(upsid);
 
  var firstBatteryId = 1;
   
        for(var string of dbS)
        {
            console.log("I am sleeping for " + PoolingSleep + "Bank Name is " + string.SlaveID)
            await delayByMS(PoolingSleep);
         
            await readModbus(string.IPAddress,  string.COMPort,string.SlaveID, 3, string.NoOfBattery, "",firstBatteryId,string.BatteryStringID,NodeDashboardTimeId,string.UPSID,"Volt")
            await delayByMS(PoolingSleep);
          
            await readModbus(string.IPAddress,  string.COMPort,string.SlaveID, 306, string.NoOfBattery, "",firstBatteryId,string.BatteryStringID,NodeDashboardTimeId,string.UPSID,"IR")
            await delayByMS(PoolingSleep);
          
            await readModbus(string.IPAddress,  string.COMPort,string.SlaveID, 909, string.NoOfBattery, "",firstBatteryId,string.BatteryStringID,NodeDashboardTimeId,string.UPSID,"Temp")
            await delayByMS(PoolingSleep);
            
            await readModbus(string.IPAddress,  string.COMPort,string.SlaveID, 1816, 5, "",firstBatteryId,string.BatteryStringID,NodeDashboardTimeId,string.UPSID,"ATSVSC")

            console.log("Next ROUND - Another bank wil sleep for " + NextRoundSleep)
            await delayByMS(NextRoundSleep);
                     
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
        
          await readModbus(string.IPAddress,  string.COMPort,string.SlaveID, 3, string.NoOfBattery, "",firstBatteryId,string.BatteryStringID,lastDischargeRecordTimeId,string.UPSID,"DischargeVolt")
          await delayByMS(PoolingSleep);
         
          await readModbus(string.IPAddress,  string.COMPort,string.SlaveID, 1816, string.NoOfBattery, "",firstBatteryId,string.BatteryStringID,lastDischargeRecordTimeId,string.UPSID,"DischargeSVSC")
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
     
       
  }
}
function IRSaveDBSQL(value,firstBatteryId,StringId,NodeDashboardTimeId)
{
    for (i=0, j=firstBatteryId; i<value.length; i++, j++) {
       
      let batteryIdinsert=j;
      let Value=value[i];
      
      var myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");
       var raw = JSON.stringify({"BatteryId": batteryIdinsert,"Value":Value/1000,"StringId":StringId,"NodeDashboardTimeId":NodeDashboardTimeId  });
       var requestOptions = { method: 'POST',headers: myHeaders, body: raw, redirect: 'follow'};

     fetch("http://localhost:1212/insertInDashboardIR", requestOptions).then(response => response.text())
       .then(result => console.log(result))
       .catch(error => console.log('error', error));
            
  }
}
function TempSaveDBSQL(value,firstBatteryId,StringId,NodeDashboardTimeId)
{
    for (i=0, j=firstBatteryId; i<value.length; i++, j++) {
      
      let batteryIdinsert=j;
      let Value=value[i];
      var myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");
       var raw = JSON.stringify({"BatteryId": batteryIdinsert,"Value":Value/10,"StringId":StringId ,"NodeDashboardTimeId":NodeDashboardTimeId });
       var requestOptions = { method: 'POST',headers: myHeaders, body: raw, redirect: 'follow'};

     fetch("http://localhost:1212/insertInDashboardTemp", requestOptions).then(response => response.text())
       .then(result => console.log(result))
       .catch(error => console.log('error', error));
       
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
    

 } catch (err) {
   console.log(err);
 } 
}
async function getDB() {
  try {
    var resultDB = await fetch("http://localhost:1212/getUPSData", { method: 'GET', redirect: 'follow' });
    var tempJSON = await resultDB.json();
    var upsStringInfo = tempJSON.recordset;
   
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
       
}