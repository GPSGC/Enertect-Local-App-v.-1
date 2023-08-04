
//**********************************SQL Connection******************************************//
var express = require('express');
var app = express();
var sql = require("mssql");
const port = 1234
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
var server = app.listen(1234, function () {
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
        var sqlquery = `INSERT INTO NodeDashboardVoltage (BatteryId,DashboardVoltage) VALUES ('${req.body.No}','${req.body.Value}')`;
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
app.post('/insertInStringVoltage', jsonParser, function (req, res) {
    sql.connect(config, function (err) {
        if (err) throw err;
       // console.log("Connected!");
        var sqlquery = `INSERT INTO NodeStringVoltage (BatteryConfigID,StringVoltage) VALUES ('${req.body.No}','${req.body.Value}')`;
        var request = new sql.Request();

        request.query(sqlquery, function (err, result) {
            if (!err)
                res.send(result);
            else
                res.send(err);
        });
    });

});
app.post('/insertInAT', jsonParser, function (req, res) {
    sql.connect(config, function (err) {
        if (err) throw err;
       // console.log("Connected!");
        var sqlquery = `INSERT INTO NodeDashBoardAT (BatteryConfigID,AT1) VALUES ('${req.body.No}','${req.body.Value}')`;
        var request = new sql.Request();

        request.query(sqlquery, function (err, result) {
            if (!err)
                res.send(result);
            else
                res.send(err);
        });
    });

});
app.post('/insertInStringCurrent', jsonParser, function (req, res) {
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