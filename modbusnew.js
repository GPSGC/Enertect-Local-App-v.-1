
const modbus = require('jsmodbus')
const net = require('net')
let sockets = [];
async function run1(i, host, port, slaveId, endRegisterCount,firstBatteryId) {
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
        client.readHoldingRegisters(0, endRegisterCount)
            .then(function (resp) {
                console.log("Thread runnning for : " + slaveId);
                console.log(host + "-" + port + "-" + slaveId)
                console.log(resp.response._body.valuesAsArray)

                
                // allValues.push(resp.response._body.valuesAsArray)
                // console.log(resp.response._body.valuesAsArray.length)
                for (i=0, j=firstBatteryId; i<resp.response._body.valuesAsArray.length; i++, j++) {
                    //console.log("1 row inserted")

                    //*********************************Add in DB*****************************************
                    var myHeaders = new Headers();
                    myHeaders.append("Content-Type", "application/json");

                    var raw = JSON.stringify({
                        "No": j,
                      "Value": parseInt(resp.response._body.valuesAsArray[i])
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
                run1(i, IPAddress, COMPort, SlaveID, NoOfBattery,firstBatteryId);
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
var bodyParser = require('body-parser')
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
        console.log("Connected!");
        var sqlquery = `INSERT INTO ModbusRegisterValue (BatteryNo,Value) VALUES ('${req.body.No}','${req.body.Value}')`;
        var request = new sql.Request();

        request.query(sqlquery, function (err, result) {
            if (!err)
                res.send(result);
            else
                res.send(err);
        });
    });

});
