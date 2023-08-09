const modbus = require('jsmodbus')
const net = require('net');
const moduleSql= require('./NodeModbusSQL.js');
async function modbusReadGet(ipModbusServer, portModbusServer, bankDeviceId, registerStartInteger, registerNumberReadInteger,firstBatteryId, displayName) {

    const socket = new net.Socket()
    const client = new modbus.client.TCP(socket, bankDeviceId, 15000);
    socket.on('error', console.error)
    socket.connect({ 'host': ipModbusServer, 'port': portModbusServer })
    socket.on('connect', function () {
        client.readHoldingRegisters(registerStartInteger, registerNumberReadInteger)
            .then(function (resp) {
                console.log(displayName);
                console.log(resp.response._body.valuesAsArray);
                insertDashboardVoltage(resp.response._body.valuesAsArray,firstBatteryId)
                socket.end()

            }).catch(function (err) {
                console.log(err);
                socket.end()
            })
    })
}
function insertDashboardVoltage(value,firstBatteryId)
{
    for (i=0, j=firstBatteryId; i<value.length; i++, j++) {
        //console.log("1 row inserted")
      //  console.log("batteryid" + j);
      let batteryIdinsert=j;
      let Value=value[i];
       
        //*********************************Add in DB*****************************************
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        var raw = JSON.stringify({
            "BatteryId": batteryIdinsert       
        });

        var requestOptions = {
          method: 'POST',
          headers: myHeaders,
          body: raw,
          redirect: 'follow'
        };

        fetch("http://localhost:1212/checkDashboardVoltageByBatteryID", requestOptions)
          .then(response => response.text())
          .then(result =>{
           // console.log(result)
            var tempJSON = JSON.parse(result);
            //console.log(tempJSON.recordset) ;          
            var count=tempJSON.recordset[0].Count;        
                     
            if (count == 0)
            {
               console.log("count : " + count + "--batteryidinsert : " + batteryIdinsert+ "--Value : "+Value)
                //console.log("checkquery :" + batteryIdinsert);
                //*********************************Add in DB*****************************************
              var myHeaders = new Headers();
              myHeaders.append("Content-Type", "application/json");

              var raw = JSON.stringify({
                  "No": batteryIdinsert,
                "Value":Value/1000 // parseInt(value[i])/1000
              });

              var requestOptions = {
                method: 'POST',
                headers: myHeaders,
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
              console.log("count : " + count + "--batteryidinsert : " + batteryIdinsert+ "--Value : "+Value)
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
function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}

//Main
(async () => {
 
   //function execute(){
   //*****************Get UPS*************************/
   var requestOptions = {
    method: 'GET',
    redirect: 'follow'
};

fetch("http://localhost:1212/getUPSStringData", requestOptions)
    .then(response => response.text())
    .then(result => {
        //console.log(result))
        var tempJSON = JSON.parse(result);
        var upsStringInfo = tempJSON.recordset;
      //  console.log(upsStringInfo);
        var firstBatteryId=9;

        for (var i = 0; i < upsStringInfo.length; i++) {
            var IPAddress = upsStringInfo[i].IPAddress;
            var COMPort = upsStringInfo[i].COMPort;
            var SlaveID = upsStringInfo[i].SlaveID;
            var NoOfBattery = upsStringInfo[i].NoOfBattery;
            var StringId = upsStringInfo[i].BatteryStringID;
            var UPSID= upsStringInfo[i].UPSID;
             console.log(IPAddress + "-"+ COMPort + "-" + SlaveID);
              
             modbusReadGet(IPAddress, COMPort, SlaveID, 3, NoOfBattery,firstBatteryId, "Battery Voltage-"+SlaveID)
             
             
             firstBatteryId +=NoOfBattery;
        }

    })
    .catch(error => console.log('error', error));
   // await delay(10000); //10 sec 
    
//   }
//   setInterval(execute, 2000);
})()


//////////////////////////////////////////////////////////////////////////////////////
