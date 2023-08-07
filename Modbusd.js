
const modbus = require('jsmodbus')
const net = require('net')
let sockets = [];
let dischargeOn,dischargeOff,m_discharge;
var lastDischargerecordId,lastTimeId;
async function getvolatge(i, host, port, slaveId, endRegisterCount,firstBatteryId) {
    // console.log(`Hello modbus : ${i}`);
    const socket = new net.Socket()
    const options = {
        'host': host,
        'port': port
    }
    const client = new modbus.client.TCP(socket, slaveId, 15000);
    socket.on('error', console.error)
    socket.connect(options)
    socket.on('connect', function () {
        client.readHoldingRegisters(3, endRegisterCount)
            .then(function (resp) {
                console.log("Voltage Thread for : " + slaveId);
               // console.log(host + "-" + port + "-" + slaveId)
                console.log(resp.response._body.valuesAsArray)

                // console.log(resp.response._body.valuesAsArray.length)
                for (i=0, j=firstBatteryId; i<resp.response._body.valuesAsArray.length; i++, j++) {
                    //console.log("1 row inserted")

                    //*********************************Add in DB*****************************************
                    var myHeaders = new Headers();
                    myHeaders.append("Content-Type", "application/json");

                    var raw = JSON.stringify({
                        "No": j,
                      "Value": parseInt(resp.response._body.valuesAsArray[i])/1000
                    });

                    var requestOptions = {
                      method: 'POST',
                      headers: myHeaders,
                      body: raw,
                      redirect: 'follow'
                    };

                    fetch("http://localhost:2000/insertInTable", requestOptions)
                      .then(response => response.text())
                      .then(result => console.log(result))
                      .catch(error => console.log('error', error));
                    //********************************************************************************************
                    
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
async function getDischargevolatge(i, host, port,slaveId,firstBatteryId,lastTimeId) {
    // console.log(`Hello modbus : ${i}`);
    const socket = new net.Socket()
    const options = {
        'host': host,
        'port': port
    }
    const client = new modbus.client.TCP(socket, slaveId, 15000);
    socket.on('error', console.error)
    socket.connect(options)
    socket.on('connect', function () {
        client.readHoldingRegisters(3, endRegisterCount)
            .then(function (resp) {
                console.log("Discharge Voltage Thread for : " + slaveId);            
                console.log(resp.response._body.valuesAsArray)
             // console.log(resp.response._body.valuesAsArray.length)
                for (i=0, j=firstBatteryId; i<resp.response._body.valuesAsArray.length; i++, j++) {
                   
                    var myHeaders = new Headers();
                    myHeaders.append("Content-Type", "application/json");
                    var raw = JSON.stringify({
                        "No": j,
                      "Value": parseInt(resp.response._body.valuesAsArray[i])/1000,
                      "TimeId" : lastTimeId,
                      "slaveId":slaveId,
                    });

                    var requestOptions = {
                      method: 'POST',
                      headers: myHeaders,
                      body: raw,
                      redirect: 'follow'
                    };

                    fetch("http://localhost:2000/insertInDischargeVoltage", requestOptions)
                      .then(response => response.text())
                      .then(result => console.log(result))
                      .catch(error => console.log('error', error));
                  
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
async function gettemperature(i, host, port, slaveId, endRegisterCount,firstBatteryId) {
    // console.log(`Hello modbus : ${i}`);
    const socket = new net.Socket()
    const options = {
        'host': host,
        'port': port
    }
    const client = new modbus.client.TCP(socket, slaveId, 15000);
    socket.on('error', console.error)
    socket.connect(options)
    socket.on('connect', function () {
        client.readHoldingRegisters(910, endRegisterCount)
            .then(function (resp) {
                console.log("Temperature Thread : " + slaveId);
                //console.log(host + "-" + port + "-" + slaveId)
                console.log(resp.response._body.valuesAsArray)

                // console.log(resp.response._body.valuesAsArray.length)
                for (i=0, j=firstBatteryId; i<resp.response._body.valuesAsArray.length; i++, j++) {
                    //console.log("1 row inserted")

                    //*********************************Add in DB*****************************************
                    var myHeaders = new Headers();
                    myHeaders.append("Content-Type", "application/json");

                    var raw = JSON.stringify({
                        "No": j,
                      "Value": parseInt(resp.response._body.valuesAsArray[i])/10
                    });

                    var requestOptions = {
                      method: 'POST',
                      headers: myHeaders,
                      body: raw,
                      redirect: 'follow'
                    };

                    fetch("http://localhost:2000/insertInTemp", requestOptions)
                      .then(response => response.text())
                      .then(result => console.log(result))
                      .catch(error => console.log('error', error));
                    //********************************************************************************************
                    
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
async function getStringVoltageandATandCurrent(i, host, port, slaveId, NoOfBattery,firstBatteryId) {
    // console.log(`Hello modbus : ${i}`);
    const socket = new net.Socket()
    const options = {
        'host': host,
        'port': port
    }
    const client = new modbus.client.TCP(socket, slaveId, 15000);
    socket.on('error', console.error)
    socket.connect(options)
    socket.on('connect', function ()
     {
        client.readHoldingRegisters(1816, 5)
            .then(function (resp) {
                console.log("StringVoltage Thread : " + slaveId);
                //console.log(host + "-" + port + "-" + slaveId)
                console.log(resp.response._body.valuesAsArray)
                var strVoltage=resp.response._body.valuesAsArray[0]/10 ;
                var at=resp.response._body.valuesAsArray[4]/10 ;
                console.log(strVoltage +" - " +at)
                
                    //*********************************Add StrVolt in DB*****************************************
                    var myHeaders = new Headers();
                    myHeaders.append("Content-Type", "application/json");
                   var raw = JSON.stringify({
                        "No": i+1,
                      "Value": resp.response._body.valuesAsArray[0]/10
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
                    
                    //*********************************Add AT in DB*****************************************
                      var myHeaders = new Headers();
                      myHeaders.append("Content-Type", "application/json");
                     var raw = JSON.stringify({
                          "No": i+1,
                        "Value": resp.response._body.valuesAsArray[4]/10
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
                     
                  //*********************************Add StringCurrent in DB*****************************************
                  var strCurrent=conversionForCurrent(resp.response._body.valuesAsArray[1]) /10;
                  var myHeaders = new Headers();
                  myHeaders.append("Content-Type", "application/json");
                 var raw = JSON.stringify({
                      "No": i+1,
                    "Value": strCurrent,
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
                
                  //*********************************************Check Dicharge********************************* 
                   checkDischarge(strVoltage,strVoltage,NoOfBattery);
                  
                   if (checkDischarge)
                   {
                    console.log("Start Discharge");
                   getDischarge(i, host, port, slaveID, NoOfBattery,firstBatteryId);  
                               
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
 function conversionForCurrent(value)
{ 
    console.log(value);
    let binary = value.toString(2).padStart(16, '0');
    console.log(binary);
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
    if (strVoltage != 0  && strCurrent != 0)  
    {
        console.log("Discharge Loop");
        // dischargeOn = (strVoltage <= (NoOfBattery * 12.72)) && (strCurrent <= -5);
        dischargeOn = (strVoltage >50) && (strCurrent> -2);
        dischargeOff = (strVoltage <50) && (strCurrent< -2);
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
async function getDischarge(i, host, port, slaveId, endRegisterCount,firstBatteryId,NoOfBattery) {
    // console.log(`Hello modbus : ${i}`);
    const socket = new net.Socket()
    const options = {'host': host,'port': port}
    const client = new modbus.client.TCP(socket, slaveId, 15000);
    socket.on('error', console.error)
    socket.connect(options)
    socket.on('connect', function ()
     {
        var startdischarge= new Date().toLocaleDateString();
        inserdichargerecord(i, host, port,slaveId,startdischarge,firstBatteryId)
        socket.end()
            .catch(function ()
             {
                console.error(require('util').inspect(arguments, {
                    depth: null
                }))
                socket.end()
            })
            // socket.end()
    })

}
function inserdichargerecord(i, host, port,slaveId,startdischarge,firstBatteryId)
{
    
        //*********************************Add in DB*****************************************
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        var raw = JSON.stringify({
            "StringId": slaveid,
          "StartDischarge": startdischarge,
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
            console.log(tempJSON);
            lastDischargerecordId = tempJSON.recordset[0].NodeDischargeRecordId;
             console.log(lastDischargerecordId );
              //*****************************************Insert Record Detail*****************************************************
              var myHeaders = new Headers();
              myHeaders.append("Content-Type", "application/json");
              var raw = JSON.stringify({
                "NodeDischargeRecordId": lastDischargerecordId,
                "DischargeRecordTime": new Date().toLocaleDateString,
              });

              var requestOptions = {
                method: 'POST',
                headers: myHeaders,
                body: raw,
                redirect: 'follow'
              };

              fetch("https://input.gpsgc.com/insertInDischargeRecordTime", requestOptions)
                .then(response => response.text())
                .then(result => {
                  var tempJSON = JSON.parse(result);
                  console.log(tempJSON);
                  lastTimeId = tempJSON.recordset[0].NodeDischargeRecordTimeId;
                })
                .catch(error => console.log('error', error));
             //************************************************** Insert Voltage/Temp/SC/ST**************************************/
             getDischargevolatge(i, host, port,slaveId,firstBatteryId,lastTimeId);
          }
            )
          .catch(error => console.log('error', error));
      
}
//@main
(async () => {

    const upsArray = [];
    //*****************Get UPS*************************/
    var requestOptions = {
        method: 'GET',
        redirect: 'follow'
    };

    fetch("http://localhost:2000/getUPSStringData", requestOptions)
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
                //console.log(IPAddress + "-"+ COMPort + "-" + SlaveID);
             //  //
                console.log("FirstBatteryID:" + firstBatteryId+ "-" + SlaveID)
                firstBatteryId +=NoOfBattery;
            }

        })
        .catch(error => console.log('error', error));

    // const clientArray = [17, 18];
    // for (j = 0; j < clientArray.length; j++) {
    //     console.log(clientArray[j]);

    // }

})()

//**********************************SQL Connection******************************************//
var express = require('express');
var app = express();
var sql = require("mssql");
const port = 2000
var bodyParser = require('body-parser');
const { Console } = require('console');
var jsonParser = bodyParser.json()
app.use(express.static("public"));
// config for your database
var config = {

    user: "nodeIndus2020",
    password: "nodeIndus2020",
    database: "CommunicatorDB",
    server: '114.79.133.104',
    parseJSON: true,
    options: {
        encrypt: false, // for azure
        trustServerCertificate: false // change to true for local dev / self-signed certs
    }
};
app.get('/', function (req, res) {
    // connect to your database
    sql.connect(config, function (err) {

        if (err) console.log(err);
        //res.send("Hello World");
    });
});
var server = app.listen(2000, function () {
    console.log(`Server is running ${port}`);
});
app.get('/getUPSStringData', function (req, res) {
    // connect to your database
    sql.connect(config, function (err) {

        if (err) console.log(err);

        // create Request object
        var request = new sql.Request();

        // query to the database and get the records
        request.query(`SELECT BatteryInfo1.BatteryConfigID, BatteryInfo1.UPSID, BatteryInfo1.NoOfBattery, BatteryInfo1.ControlModuleStringID, BatteryInfo1.StringName, UPSInformation1.UPSName, UPSInformation1.IPAddress, UPSInformation1.COMPort, 
       BatteryInfo1.UPSID * 16 + BatteryInfo1.ControlModuleStringID AS SlaveID
FROM            BatteryInfo1 INNER JOIN
       UPSInformation1 ON BatteryInfo1.UPSID = UPSInformation1.UPSID`, function (err, recordset) {

            if (err) console.log(err)

            // send records as a response
            res.send(recordset);

        });
    });
});

app.post('/insertInTable', jsonParser, function (req, res) {
    sql.connect(config, function (err) {
        if (err) throw err;
       // console.log("Connected!");
        var sqlquery = `INSERT INTO NodeDashboardVoltage (BatteryId,DashboardVoltage) VALUES ('${req.body.StringId}','${req.body.Value}')`;
        var request = new sql.Request();

        request.query(sqlquery, function (err, result) {
            if (!err)
                res.send(result);
            else
                res.send(err);
        });
    });

});
app.post('/insertInTemp', jsonParser, function (req, res) {
    sql.connect(config, function (err) {
        if (err) throw err;
       // console.log("Connected!");
        var sqlquery = `INSERT INTO NodeDashboardTemp (BatteryId,DashboardTemp) VALUES ('${req.body.No}','${req.body.Value}')`;
        var request = new sql.Request();

        request.query(sqlquery, function (err, result) {
            if (!err)
                res.send(result);
            else
                res.send(err);
        });
    });

});
app.post('/insertInCurrent', jsonParser, function (req, res) {
    sql.connect(config, function (err) {
        if (err) throw err;
       // console.log("Connected!");
        var sqlquery = `INSERT INTO NodeStringCurrent (BatteryConfigId,StringCurrent) VALUES ('${req.body.No}','${req.body.Value}')`;
        var request = new sql.Request();

        request.query(sqlquery, function (err, result) {
            if (!err)
                res.send(result);
            else
                res.send(err);
        });
    });

});
app.post('/insertIndichargerecord', jsonParser, function (req, res) {
    sql.connect(config, function (err) {
        if (err) throw err;
       // console.log("Connected!");
        var sqlquery = `INSERT INTO NodeDischargeRecord (StringId,StartDisharge) VALUES ('${req.body.slaveId}','${req.body.startdischarge}')`;
        var request = new sql.Request();

        request.query(sqlquery, function (err, result) {
            if (!err)
                res.send(result);
            else
                res.send(err);
        });
    });

});
app.post('/insertIndichargerecordTime', jsonParser, function (req, res) {
    sql.connect(config, function (err) {
        if (err) throw err;
       // console.log("Connected!");
        var sqlquery = `INSERT INTO NodeDischargeRecordTime (NodeDischargeRecordId,DischargeRecordTime) VALUES ('${req.body.slaveId}','${req.body.startdischarge}')`;
        var request = new sql.Request();

        request.query(sqlquery, function (err, result) {
            if (!err)
                res.send(result);
            else
                res.send(err);
        });
    });

});
app.post('/insertInDischargeVoltage', jsonParser, function (req, res) {
    sql.connect(config, function (err) {
        if (err) throw err;
       // console.log("Connected!");
        var sqlquery = `INSERT INTO NodeDischargeVoltage (BatteryID,DischargeVoltage,NodeDischargeRecordTimeId,StringId) VALUES ('${req.body.No}','${req.body.Value}','${req.body.TimeId}','${req.body.slaveId}')`;
        var request = new sql.Request();

        request.query(sqlquery, function (err, result) {
            if (!err)
                res.send(result);
            else
                res.send(err);
        });
    });

});
