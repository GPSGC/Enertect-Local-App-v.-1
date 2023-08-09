const modbus = require('jsmodbus')
const net = require('net')
const moduleSql= require('./modbusSQLServer.js');
var strVoltage,at,strCurrent;
let dischargeOn,dischargeOff;
async function readModbus(host, port, slaveId, endRegisterCount,firstBatteryId,startRegister,Type) {
    // console.log(`Hello modbus : ${i}`);
    const socket = new net.Socket()
    const options = {'host': host,'port': port}
    const client = new modbus.client.TCP(socket, slaveId, 15000);
    socket.on('error', console.error)
    socket.connect(options)
    socket.on('connect', function () {
        client.readHoldingRegisters(startRegister, endRegisterCount)
            .then(function (resp) {
                
               // console.log(host + "-" + port + "-" + slaveId)
                console.log(resp.response._body.valuesAsArray)
                if(Type == "Voltage")
                {
                  console.log(Type +" Thread for : " + slaveId);
                  insertVoltage(resp.response._body.valuesAsArray,firstBatteryId)
                }
                else if (Type =="IR")
                {
                  console.log(Type +" Thread for : " + slaveId);
                  insertIR(resp.response._body.valuesAsArray,firstBatteryId)
                }
                else if (Type =="Temp")
                {
                  console.log(Type +" Thread for : " + slaveId);
                  insertTemperature(resp.response._body.valuesAsArray,firstBatteryId);
                }
               socket.end()
            }).catch(function () {
                console.error(require('util').inspect(arguments, {
                    depth: null
                }))
                socket.end()
            })
    })

} 
async function getStringVoltageandATandCurrent(StringId, host, port, slaveId,NoOfBattery,firstBatteryId,UPSID) {
    // console.log(`Hello modbus : ${i}`);
    const socket = new net.Socket()
    const options = {'host': host,'port': port}
    const client = new modbus.client.TCP(socket, slaveId, 15000);
    socket.on('error', console.error)
    socket.connect(options)
    socket.on('connect', function () {
        client.readHoldingRegisters(1816, 5)
            .then(function (resp) {
                console.log("StringVoltage Thread : " + slaveId);
                //console.log(host + "-" + port + "-" + slaveId)
                console.log(resp.response._body.valuesAsArray)
                  strVoltage=resp.response._body.valuesAsArray[0]/10 ;
                  at=resp.response._body.valuesAsArray[4]/10 ;
                  strCurrent=conversionForCurrent(resp.response._body.valuesAsArray[1]) /10;
               // console.log(strVoltage +" - " +at + " - " + strCurrent);
                
                      insertStrVoltage(StringId,strVoltage);
                      insertAT(StringId,at);
                      insertStrCurrent(StringId,strCurrent);
                   //*********************************************Check Dicharge********************************* 
                    if (checkDischarge(strVoltage,strCurrent,NoOfBattery))
                   {
                    console.log("Start Discharge-SV : " +strVoltage + "-SC : " + strCurrent + "-Cell: " +NoOfBattery );
                    insertDichargeRecord(host, port, slaveId, NoOfBattery,firstBatteryId,StringId,UPSID);
                   }
                    //********************************************************************************************
                socket.end()
            }).catch(function () {
                console.error(require('util').inspect(arguments, {
                    depth: null
                }))
                socket.end()
            })
    })

}
async function getDischargeVolatge(host, port, slaveId, endRegisterCount,firstBatteryId,TimeId,stringId) {
    // console.log(`Hello modbus : ${i}`);
    const socket = new net.Socket()
    const options = {'host': host,'port': port}
    const client = new modbus.client.TCP(socket, slaveId, 15000);
    socket.on('error', console.error)
    socket.connect(options)
    socket.on('connect', function () {
        client.readHoldingRegisters(3, endRegisterCount)
            .then(function (resp) {
                console.log("Voltage Thread for : " + slaveId);
               // console.log(host + "-" + port + "-" + slaveId)
                console.log(resp.response._body.valuesAsArray)
                insertDischargeVoltage(resp.response._body.valuesAsArray,firstBatteryId,TimeId,stringId)
               socket.end()
            }).catch(function () {
                console.error(require('util').inspect(arguments, {
                    depth: null
                }))
                socket.end()
            })
    })

}
async function getDischargeStringVoltageandATandCurrent(host, port, slaveId,TimeId,stringId) {
    // console.log(`Hello modbus : ${i}`);
    const socket = new net.Socket()
    const options = {'host': host,'port': port}
    const client = new modbus.client.TCP(socket, slaveId, 15000);
    socket.on('error', console.error)
    socket.connect(options)
    socket.on('connect', function () {
        client.readHoldingRegisters(1816, 5)
            .then(function (resp) {
                console.log("StringVoltage Thread : " + slaveId);
                //console.log(host + "-" + port + "-" + slaveId)
                console.log(resp.response._body.valuesAsArray)
                  DischargestrVoltage=resp.response._body.valuesAsArray[0]/10 ;
                  //at=resp.response._body.valuesAsArray[4]/10 ;
                  DischargestrCurrent=conversionForCurrent(resp.response._body.valuesAsArray[1]) /10;
               // console.log(strVoltage +" - " +at + " - " + strCurrent);
                 
                      insertInDischargeStrVoltage(DischargestrVoltage, TimeId,stringId);
                      insertInDischargeStrCurrent(DischargestrCurrent, TimeId,stringId);
                socket.end()
            }).catch(function () {
                console.error(require('util').inspect(arguments, {
                    depth: null
                }))
                socket.end()
            })
    })

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
function insertStrVoltage(BatteryConfigID,value)
{
    //*********************************Add StrVolt in DB*****************************************
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    var raw = JSON.stringify({
        "No": BatteryConfigID,
    "Value": value
    });
    var requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow'
    };
    fetch("http://localhost:1234/insertInStringVoltage", requestOptions)
    .then(response => response.text())
    .then(result => console.log(result))
    .catch(error => console.log('error', error));
    //************************************************************************************** 
}
function insertAT(BatteryConfigID,value)
{
    //*********************************Add AT in DB*****************************************
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    var raw = JSON.stringify({
        "No": BatteryConfigID,
    "Value": value
    });
    var requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow'
    };
    fetch("http://localhost:1234/insertInAT", requestOptions)
    .then(response => response.text())
    .then(result => console.log(result))
    .catch(error => console.log('error', error));
    //********************************************************************************************
}
function insertStrCurrent(BatteryConfigID,value)
{
    //*********************************Add StringCurrent in DB*****************************************
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    var raw = JSON.stringify({
        "No": BatteryConfigID,
    "Value": value
    });
    var requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow'
    };
    fetch("http://localhost:1234/insertInStringCurrent", requestOptions)
    .then(response => response.text())
    .then(result => console.log(result))
    .catch(error => console.log('error', error));
    //********************************************************************************************
}
function insertVoltage(value,firstBatteryId)
{
    for (i=0, j=firstBatteryId; i<value.length; i++, j++)
     {
        //*********************************Add in DB*****************************************
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        var raw = JSON.stringify({
            "No": j,
          "Value": parseInt(value[i])/1000
        });

        var requestOptions = {
          method: 'POST',
          headers: myHeaders,
          body: raw,
          redirect: 'follow'
        };

        fetch("http://localhost:1234/insertInTable", requestOptions)
          .then(response => response.text())
          .then(result => console.log(result))
          .catch(error => console.log('error', error));
        //********************************************************************************************
        
      }
}
function insertIR(value,firstBatteryId)
{
    for (i=0, j=firstBatteryId; i<value.length; i++, j++) {
        //console.log("1 row inserted")

        //*********************************Add in DB*****************************************
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        var raw = JSON.stringify({
            "No": j,
          "Value": parseInt(value[i])/1000
        });

        var requestOptions = {
          method: 'POST',
          headers: myHeaders,
          body: raw,
          redirect: 'follow'
        };

        fetch("http://localhost:1234/insertInIR", requestOptions)
          .then(response => response.text())
          .then(result => console.log(result))
          .catch(error => console.log('error', error));
        //********************************************************************************************
        
      }
}
function insertTemperature(value,firstBatteryId)
{
    for (i=0, j=firstBatteryId; i<value.length; i++, j++) {
        //console.log("1 row inserted")

        //*********************************Add in DB*****************************************
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        var raw = JSON.stringify({
            "No": j,
          "Value": parseInt(value[i])/10
        });

        var requestOptions = {
          method: 'POST',
          headers: myHeaders,
          body: raw,
          redirect: 'follow'
        };

        fetch("http://localhost:1234/insertInTemp", requestOptions)
          .then(response => response.text())
          .then(result => console.log(result))
          .catch(error => console.log('error', error));
        //********************************************************************************************
        
      }
}
function checkDischarge(strVoltage,strCurrent,NoOfBattery)
{ 
    let m_discharge =false;
    if (strVoltage != 0  && strCurrent != 0)  
    {
        
        // dischargeOn = (strVoltage <= (NoOfBattery * 12.72)) && (strCurrent <= -5);
        dischargeOn =    (strVoltage <= (NoOfBattery * 12.72)) && (strCurrent <= -5);   //(strVoltage >50) && (strCurrent>1);
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
function insertDichargeRecord(host, port, slaveId, endRegisterCount,firstBatteryId,stringId,UPSID)
{
    
        //*********************************Add in DB*****************************************
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        var raw = JSON.stringify({
            "UPSID": UPSID,
          "startdischarge": new Date()
        });

        var requestOptions = {
          method: 'POST',
          headers: myHeaders,
          body: raw,
          redirect: 'follow'
        };

        fetch("http://localhost:1234/insertIndichargerecord", requestOptions)
          .then(response => response.text())
          .then(result => {
            var tempJSON = JSON.parse(result);
            //console.log(tempJSON);
            lastDischargerecordId = tempJSON.recordset[0].NodeDischargeRecordId;
             console.log(lastDischargerecordId );
              //*****************************************Insert Record Detail*****************************************************
              var myHeaders = new Headers();
              myHeaders.append("Content-Type", "application/json");
              var raw = JSON.stringify({
                "NodeDischargeRecordId": lastDischargerecordId,
                "DischargeRecordTime": new Date()
              });

              var requestOptions = {
                method: 'POST',
                headers: myHeaders,
                body: raw,
                redirect: 'follow'
              };

              fetch("http://localhost:1234/insertIndischargerecordTime", requestOptions)
                .then(response => response.text())
                .then(result => {
                  var tempJSON = JSON.parse(result);
                  //console.log(tempJSON);
                  lastTimeId = tempJSON.recordset[0].NodeDischargeRecordTimeId;
                  //************************************************** Insert Voltage/Temp/SC/ST**************************************/
               
               getDischargeVolatge(host, port, slaveId, endRegisterCount,firstBatteryId,lastTimeId,stringId);
               getDischargeStringVoltageandATandCurrent(host, port, slaveId,lastTimeId,stringId);
                })
                .catch(error => console.log('error', error));
             
          }
            )
          .catch(error => console.log('error', error));
      
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

        fetch("http://localhost:1234/insertInDischargeVoltage", requestOptions)
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

        fetch("http://localhost:1234/insertInDischargeStrVoltage", requestOptions)
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

        fetch("http://localhost:1234/insertInDischargeStrCurrent", requestOptions)
          .then(response => response.text())
          .then(result => console.log(result))
          .catch(error => console.log('error', error));
        //********************************************************************************************
     
}
//@main
(async () => {

    const upsArray = [];
    //*****************Get UPS*************************/
    var requestOptions = {
        method: 'GET',
        redirect: 'follow'
    };

    fetch("http://localhost:1234/getUPSStringData", requestOptions)
        .then(response => response.text())
        .then(result => {
            //console.log(result))
            var tempJSON = JSON.parse(result);
            var upsStringInfo = tempJSON.recordset;
            //console.log(upsInfo);
            var firstBatteryId=1;

            for (var i = 0; i < upsStringInfo.length; i++) {
                var IPAddress = upsStringInfo[i].IPAddress;
                var COMPort = upsStringInfo[i].COMPort;
                var SlaveID = upsStringInfo[i].SlaveID;
                var NoOfBattery = upsStringInfo[i].NoOfBattery;
                var StringId = upsStringInfo[i].BatteryConfigID;
                var UPSID= upsStringInfo[i].UPSID;
                 console.log(IPAddress + "-"+ COMPort + "-" + SlaveID);
                  
                 readModbus(IPAddress, COMPort, SlaveID, NoOfBattery,firstBatteryId,3,"Voltage");
                 readModbus(IPAddress, COMPort, SlaveID, NoOfBattery,firstBatteryId,306,"IR");
                 readModbus(IPAddress, COMPort, SlaveID, NoOfBattery,firstBatteryId,909,"Temp");
                  //  getIR(IPAddress, COMPort, SlaveID, NoOfBattery,firstBatteryId);
                  //  gettemperature(IPAddress, COMPort, SlaveID, NoOfBattery,firstBatteryId);
                  //  getStringVoltageandATandCurrent(StringId, IPAddress, COMPort, SlaveID, NoOfBattery,firstBatteryId,UPSID);
                  //conversionForCurrent(32769);
                   
                //console.log("FirstBatteryID:" + firstBatteryId+ "-" + SlaveID)
                firstBatteryId +=NoOfBattery;
            }

        })
        .catch(error => console.log('error', error));

    // const clientArray = [17, 18];
    // for (j = 0; j < clientArray.length; j++) {
    //     console.log(clientArray[j]);

    // }

})()
