const modbus = require('jsmodbus')
const net = require('net');
const moduleSql= require('./NodeModbusSQL.js');
var EventLogger = require('node-windows').EventLogger;
 var log = new EventLogger('NodeModbusApp');       
 
   // log.warn('Watch out!');
   // log.error('Something went wrong.')
   var strVoltage,dashboardAt,strCurrent;
async function modbusReadGet(ipModbusServer, portModbusServer, bankDeviceId, registerStartInteger, registerNumberReadInteger,firstBatteryId, displayName,StringId,Type) {

    const socket = new net.Socket()
    const client = new modbus.client.TCP(socket, bankDeviceId, 15000);
    socket.on('error', console.error)
    socket.connect({ 'host': ipModbusServer, 'port': portModbusServer })
    socket.on('connect', function () {
        client.readHoldingRegisters(registerStartInteger, registerNumberReadInteger)
            .then(function (resp) {
                console.log(displayName);
                console.log(resp.response._body.valuesAsArray);
                log.info('Dashboard Recording Started..');
                if (Type == "Volt")
                {
                  insertDashboardVoltage(resp.response._body.valuesAsArray,firstBatteryId)
                }
                else if(Type == "IR")
                {
                  insertDashboardIR(resp.response._body.valuesAsArray,firstBatteryId)
                }  
                else if(Type == "Temp")
                {
                  insertDashboardTemp(resp.response._body.valuesAsArray,firstBatteryId)
                }  
                else if(Type == "ATSVSC")
                {
                  strVoltage=resp.response._body.valuesAsArray[0]/10 ;
                  dashboardAt=resp.response._body.valuesAsArray[4]/10 ;
                  strCurrent=conversionForCurrent(resp.response._body.valuesAsArray[1]) /10;
                  
                }              
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
                  "BatteryId": batteryIdinsert,
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
function insertDashboardIR(value,firstBatteryId)
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

        fetch("http://localhost:1212/checkDashboardIRByBatteryID", requestOptions)
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
                  "BatteryId": batteryIdinsert,
                "Value":Value/1000 // parseInt(value[i])/1000
              });

              var requestOptions = {
                method: 'POST',
                headers: myHeaders,
                body: raw,
                redirect: 'follow'
              };

              fetch("http://localhost:1212/insertInDashboardIR", requestOptions)
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

            fetch("http://localhost:1212/updateDashboardIRByBatteryID", requestOptions)
              .then(response => response.text())
              .then(result => console.log(result))
              .catch(error => console.log('error', error));
        
          }
      
          })
          .catch(error => console.log('error', error));
        //********************************************************************************************
        
  }
}
function insertDashboardTemp(value,firstBatteryId)
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

        fetch("http://localhost:1212/checkDashboardTempByBatteryID", requestOptions)
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
                  "BatteryId": batteryIdinsert,
                "Value":Value/1000 // parseInt(value[i])/1000
              });

              var requestOptions = {
                method: 'POST',
                headers: myHeaders,
                body: raw,
                redirect: 'follow'
              };

              fetch("http://localhost:1212/insertInDashboardTemp", requestOptions)
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
                
              "Value":Value/10 ,// parseInt(value[i])/1000
              "BatteryId": batteryIdinsert
            });

            var requestOptions = {
              method: 'PUT',
              headers: myHeaders,
              body: raw,
              redirect: 'follow'
            };

            fetch("http://localhost:1212/updateDashboardTempByBatteryID", requestOptions)
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
  log.info('NodeModbusApp Started');
   
   //*****************Loop UPS*************************/
   var upsStringInfo = await getDB();
   console.log(upsStringInfo);
    var firstBatteryId = 9;
 
  // for (var i = 0; i < upsStringInfo.length; i++) {
  //   var IPAddress = upsStringInfo[i].IPAddress;
  //   var COMPort = upsStringInfo[i].COMPort;
  //   var SlaveID = upsStringInfo[i].SlaveID;
  //   var NoOfBattery = upsStringInfo[i].NoOfBattery;
  //   var StringId = upsStringInfo[i].BatteryStringID;
  //   var UPSID = upsStringInfo[i].UPSID;
  //   console.log(IPAddress + "-" + COMPort + "-" + SlaveID);

  //   modbusReadGet(IPAddress, COMPort, SlaveID, 3, NoOfBattery,firstBatteryId, "Battery Voltage-"+SlaveID,StringId,"Volt")
  //   console.log("1 hello");
  //   modbusReadGet(IPAddress, COMPort, SlaveID, 306, NoOfBattery,firstBatteryId, "Battery IR-"+SlaveID,StringId,"IR")
  //   console.log("2 hello");
  //   modbusReadGet(IPAddress, COMPort, SlaveID, 909, NoOfBattery,firstBatteryId, "Battery Temp-"+SlaveID,StringId,"Temp")
  //   console.log("3 hello");
    
    
   
  //   //modbusReadGet(IPAddress, COMPort, SlaveID, 1816, 5,firstBatteryId, "Battery ATSVSC-"+SlaveID,StringId,"ATSVSC")
  //   firstBatteryId += NoOfBattery;
  // }
  console.log("Hello World");     
})()


async function getDB() {
  try {
    var requestOptions = {
      method: 'GET',
      redirect: 'follow'
    };
    var resultDB = await fetch("http://localhost:1212/getUPSStringData", { method: 'GET', redirect: 'follow' });
    var tempJSON = JSON.parse(resultDB);
    var upsStringInfo = tempJSON.recordset;
    console.log(upsStringInfo);

    return upsStringInfo;

  } catch (err) {
    console.log(err);
  } 

}
