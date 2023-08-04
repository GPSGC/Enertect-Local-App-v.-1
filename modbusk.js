const modbus = require('jsmodbus')
const net = require('net')
const moduleSql= require('./modbusSQLServer.js');
var strVoltage,at,strCurrent;
let dischargeOn,dischargeOff,m_discharge;
 
async function getDashboard(i, host, port, slaveId, endRegisterCount,firstBatteryId,NoOfBattery) {
    // console.log(`Hello modbus : ${i}`);
    const socket = new net.Socket()
    const options = {'host': host,'port': port}
    const client = new modbus.client.TCP(socket, slaveId, 15000);
    socket.on('error', console.error)
    socket.connect(options)
    socket.on('connect', function () {
        //*****************Read Voltage*****************
        client.readHoldingRegisters(3, endRegisterCount)
        .then(function (resp) {
            console.log("Voltage Thread for : " + slaveId);
           // console.log(host + "-" + port + "-" + slaveId)
            console.log(resp.response._body.valuesAsArray)

            insertVoltage(resp.response._body.valuesAsArray,firstBatteryId)
            socket.end()
        })
          //*****************Read Temperature*****************
        client.readHoldingRegisters(909, endRegisterCount)
            .then(function (resp) {
                console.log("Temperature Thread : " + slaveId);
                //console.log(host + "-" + port + "-" + slaveId)
                console.log(resp.response._body.valuesAsArray)

                insertTemperature(resp.response._body.valuesAsArray,firstBatteryId);
                
                socket.end()
            })
            //*****************Read SV/SV/AT*****************
        // client.readHoldingRegisters(1816, 5)
        //     .then(function (resp) {
        //         console.log("StringVoltage Thread : " + slaveId);
        //         //console.log(host + "-" + port + "-" + slaveId)
        //         console.log(resp.response._body.valuesAsArray)
        //           strVoltage=resp.response._body.valuesAsArray[0]/10 ;
        //           at=resp.response._body.valuesAsArray[4]/10 ;
        //           strCurrent=conversionForCurrent(resp.response._body.valuesAsArray[1]) /10;
        //         // console.log(strVoltage +" - " +at + " - " + strCurrent);
                
        //               insertStrVoltage(i,strVoltage);
        //               insertAT(i,at);
        //               insertStrCurrent(i,strCurrent);
        //            //*********************************************Check Dicharge********************************* 
        //         //    checkDischarge(strVoltage,strVoltage,NoOfBattery);
                  
        //         //    if (checkDischarge)
        //         //    {
        //         //     console.log("Start Discharge");
                    
        //         //    }
        //             //********************************************************************************************
        //          //socket.end()
        //     })
            .catch(function () {
                console.error(require('util').inspect(arguments, {
                    depth: null
                }))
                socket.end()
            })
            // socket.end()
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
function insertStrVoltage(i,value)
{
    //*********************************Add StrVolt in DB*****************************************
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    var raw = JSON.stringify({
        "No": i+1,
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
function insertAT(i,value)
{
    //*********************************Add AT in DB*****************************************
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    var raw = JSON.stringify({
        "No": i+1,
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
function insertStrCurrent(i,value)
{
    //*********************************Add StringCurrent in DB*****************************************
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    var raw = JSON.stringify({
        "No": i+1,
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

        fetch("http://localhost:1234/insertInTable", requestOptions)
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
    if (strVoltage != 0  && strCurrent != 0)  
    {
        console.log("Discharge Loop");
        // dischargeOn = (strVoltage <= (NoOfBattery * 12.72)) && (strCurrent <= -5);
        dischargeOn = (strVoltage >50) && (strCurrent>1);
        dischargeOff = (strVoltage <50) && (strCurrent<1);
        if (dischargeOn)
        {
            m_discharge=true;
        }
        if (dischargeOff && m_discharge)
        {
            m_discharge=false;
        }
        
    }
     return m_discharge;
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
                 console.log(IPAddress + "-"+ COMPort + "-" + SlaveID);
                 //getvolatge(i, IPAddress, COMPort, SlaveID, NoOfBattery,firstBatteryId);
                 // gettemperature(i, IPAddress, COMPort, SlaveID, NoOfBattery,firstBatteryId);
                 //getStringVoltageandATandCurrent(i, IPAddress, COMPort, SlaveID, NoOfBattery);
                  //conversionForCurrent(32769);
                  getDashboard(i, IPAddress, COMPort, SlaveID, NoOfBattery,firstBatteryId,NoOfBattery);
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
