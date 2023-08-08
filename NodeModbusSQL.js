
 var express = require('express');
var app = express();
var sql = require("mssql");
const port = 1212
var bodyParser = require('body-parser');
const { Console } = require('console');
var jsonParser = bodyParser.json()
app.use(express.static("public"));
// config for your database
var config = {

    user: "nodeIndus2020",
    password: "nodeIndus2020",
    database: "NodeModbus",
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
var server = app.listen(1212, function () {
    console.log(`Server is running ${port}`);
});
app.get('/getUPSStringData', function (req, res) {
    // connect to your database
    sql.connect(config, function (err) {

        if (err) console.log(err);

        // create Request object
        var request = new sql.Request();

        // query to the database and get the records
        request.query(`SELECT BatteryStringInfo.BatteryStringID, BatteryStringInfo.UPSID, BatteryStringInfo.NoOfBattery, BatteryStringInfo.ControlModuleStringID, BatteryStringInfo.StringName, UPSInfo.UPSName, UPSInfo.IPAddress, UPSInfo.COMPort, 
        BatteryStringInfo.UPSID * 16 + BatteryStringInfo.ControlModuleStringID AS SlaveID
 FROM            BatteryStringInfo INNER JOIN
        UPSInfo ON BatteryStringInfo.UPSID = UPSInfo.UPSID`, function (err, recordset) {

            if (err) console.log(err)

            // send records as a response
            res.send(recordset);

        });
    });
});
app.post('/insertInDashboardVoltage', jsonParser, function (req, res) {
    sql.connect(config, function (err) {
        if (err) throw err;
       // console.log("Connected!");
        var sqlquery = `INSERT INTO NodeDashboardVoltage (BatteryId,DashboardVoltage) VALUES ('${req.body.BatteryId}','${req.body.Value}')`;
        var request = new sql.Request();

        request.query(sqlquery, function (err, result) {
            if (!err)
                res.send(result);
            else
                res.send(err);
        });
    });

});
app.post('/checkDashboardVoltageByBatteryID', jsonParser, function (req, res) {
    sql.connect(config, function (err) {
        if (err) throw err;
       // console.log("Connected!");
        var sqlquery = `SELECT COUNT(*) as Count FROM NodeDashboardVoltage WHERE BatteryId='${req.body.BatteryId}'`;
        var request = new sql.Request();

        request.query(sqlquery, function (err, result) {
            if (!err)
                res.send(result);
            else
                res.send(err);
        });
    });

});
app.put('/updateDashboardVoltageByBatteryID',jsonParser,function(req,res){
    sql.connect(config, function (err) {
        if (err) throw err;
        //console.log("Connected!");
        //Insert a record in the "customers" table:
        var sqlquery=` UPDATE NodeDashboardVoltage set DashboardVoltage = '${req.body.Value}'WHERE BatteryId  = '${req.body.BatteryId}'`;
        var request = new sql.Request();        
        request.query(sqlquery, function (err, result) {
            if (!err)
                res.send(result);
            else
                res.send(err);
        });
    });
    
  });