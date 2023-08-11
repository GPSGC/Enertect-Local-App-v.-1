
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
    // user: "nodeIndus2020",
    // password: "nodeIndus2020",
    // database: "NodeModbus", 
    // server: '114.79.133.104',
    user: "NodeModbus",
    password: "nodemodbus",
    database: "NodeModbus",
    server: 'localhost',
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
app.post('/getUPSStringData',jsonParser, function (req, res) {
    // connect to your database
    sql.connect(config, function (err) {

        if (err) console.log(err);

        // create Request object
        var request = new sql.Request();

        // query to the database and get the records
        request.query(`SELECT BatteryStringInfo.BatteryStringID, BatteryStringInfo.UPSID, BatteryStringInfo.NoOfBattery, BatteryStringInfo.ControlModuleStringID, BatteryStringInfo.StringName, UPSInfo.UPSName, UPSInfo.IPAddress, UPSInfo.COMPort, 
        UPSInfo.ControlModuleID * 16 + BatteryStringInfo.ControlModuleStringID AS SlaveID
 FROM            BatteryStringInfo INNER JOIN
        UPSInfo ON BatteryStringInfo.UPSID = UPSInfo.UPSID WHERE (BatteryStringInfo.UPSID='${req.body.UPSID}')`, function (err, recordset) {

            if (err) console.log(err)

            // send records as a response
            res.send(recordset);

        });
    });
});
app.get('/getUPSData', function (req, res) {
    // connect to your database
    sql.connect(config, function (err) {

        if (err) console.log(err);

        // create Request object
        var request = new sql.Request();

        // query to the database and get the records
        request.query(`SELECT UPSID, UPSName,  UPSModel, ControlModuleID,COMPort, IPAddress,  NoOfBatteryPerString
FROM  UPSInfo`, function (err, recordset) {

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
        var sqlquery = `INSERT INTO NodeDashboardVoltage (BatteryId,DashboardVoltage,StringId) VALUES ('${req.body.BatteryId}','${req.body.Value},'${req.body.StringId}')`;
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
        var sqlquery=` UPDATE NodeDashboardVoltage set DashboardVoltage = '${req.body.Value}' WHERE BatteryId  = '${req.body.BatteryId}'`;
        var request = new sql.Request();        
        request.query(sqlquery, function (err, result) {
            if (!err)
                res.send(result);
            else
                res.send(err);
        });
    });
    
  });

  app.post('/insertInDashboardIR', jsonParser, function (req, res) {
    sql.connect(config, function (err) {
        if (err) throw err;
       // console.log("Connected!");
        var sqlquery = `INSERT INTO NodeDashboardIR (BatteryId,DashboardIR) VALUES ('${req.body.BatteryId}','${req.body.Value}')`;
        var request = new sql.Request();

        request.query(sqlquery, function (err, result) {
            if (!err)
                res.send(result);
            else
                res.send(err);
        });
    });

});
app.post('/checkDashboardIRByBatteryID', jsonParser, function (req, res) {
    sql.connect(config, function (err) {
        if (err) throw err;
       // console.log("Connected!");
        var sqlquery = `SELECT COUNT(*) as Count FROM NodeDashboardIR WHERE BatteryId='${req.body.BatteryId}'`;
        var request = new sql.Request();

        request.query(sqlquery, function (err, result) {
            if (!err)
                res.send(result);
            else
                res.send(err);
        });
    });

});
app.put('/updateDashboardIRByBatteryID',jsonParser,function(req,res){
    sql.connect(config, function (err) {
        if (err) throw err;
        //console.log("Connected!");
        //Insert a record in the "customers" table:
        var sqlquery=` UPDATE NodeDashboardIR set DashboardIR = '${req.body.Value}' WHERE BatteryId  = '${req.body.BatteryId}'`;
        var request = new sql.Request();        
        request.query(sqlquery, function (err, result) {
            if (!err)
                res.send(result);
            else
                res.send(err);
        });
    });
    
  });

  app.post('/insertInDashboardTemp', jsonParser, function (req, res) {
    sql.connect(config, function (err) {
        if (err) throw err;
       // console.log("Connected!");
        var sqlquery = `INSERT INTO NodeDashboardTemp (BatteryId,DashboardTemp) VALUES ('${req.body.BatteryId}','${req.body.Value}')`;
        var request = new sql.Request();

        request.query(sqlquery, function (err, result) {
            if (!err)
                res.send(result);
            else
                res.send(err);
        });
    });

});
app.post('/checkDashboardTempByBatteryID', jsonParser, function (req, res) {
    sql.connect(config, function (err) {
        if (err) throw err;
       // console.log("Connected!");
        var sqlquery = `SELECT COUNT(*) as Count FROM NodeDashboardTemp WHERE BatteryId='${req.body.BatteryId}'`;
        var request = new sql.Request();

        request.query(sqlquery, function (err, result) {
            if (!err)
                res.send(result);
            else
                res.send(err);
        });
    });

});
app.put('/updateDashboardTempByBatteryID',jsonParser,function(req,res){
    sql.connect(config, function (err) {
        if (err) throw err;
        //console.log("Connected!");
        //Insert a record in the "customers" table:
        var sqlquery=` UPDATE NodeDashboardTemp set DashboardTemp = '${req.body.Value}' WHERE BatteryId  = '${req.body.BatteryId}'`;
        var request = new sql.Request();        
        request.query(sqlquery, function (err, result) {
            if (!err)
                res.send(result);
            else
                res.send(err);
        });
    });
    
  });
  app.post('/checkStringVoltageByBatteryStringID', jsonParser, function (req, res) {
    sql.connect(config, function (err) {
        if (err) throw err;
       // console.log("Connected!");
        var sqlquery = `SELECT COUNT(*) as Count from NodeStringVoltage where BatteryStringID='${req.body.BatteryStringID}'`;
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
        var sqlquery = `INSERT INTO NodeStringVoltage (BatteryStringID,StringVoltage) VALUES ('${req.body.BatteryStringID}','${req.body.Value}')`;
        var request = new sql.Request();

        request.query(sqlquery, function (err, result) {
            if (!err)
                res.send(result);
            else
                res.send(err);
        });
    });

});
app.put('/updateInStringVoltage', jsonParser, function (req, res) {
    sql.connect(config, function (err) {
        if (err) throw err;
       // console.log("Connected!");
        var sqlquery = `Update NodeStringVoltage set StringVoltage='${req.body.Value}' where BatteryStringID= '${req.body.BatteryStringID}'`;
        var request = new sql.Request();

        request.query(sqlquery, function (err, result) {
            if (!err)
                res.send(result);
            else
                res.send(err);
        });
    });

});
app.post('/checkDashboardAtByBatteryStringID', jsonParser, function (req, res) {
    sql.connect(config, function (err) {
        if (err) throw err;
       // console.log("Connected!");
        var sqlquery = `SELECT COUNT(*) as Count from NodeDashBoardAT where BatteryStringID='${req.body.BatteryStringID}'`;
        var request = new sql.Request();

        request.query(sqlquery, function (err, result) {
            if (!err)
                res.send(result);
            else
                res.send(err);
        });
    });

});
app.post('/insertInDAshboardAT', jsonParser, function (req, res) {
    sql.connect(config, function (err) {
        if (err) throw err;
       // console.log("Connected!");
        var sqlquery = `INSERT INTO NodeDashBoardAT (BatteryStringID,AT1) VALUES ('${req.body.BatteryStringID}','${req.body.Value}')`;
        var request = new sql.Request();

        request.query(sqlquery, function (err, result) {
            if (!err)
                res.send(result);
            else
                res.send(err);
        });
    });

});
app.put('/updateInDashboardAT', jsonParser, function (req, res) {
    sql.connect(config, function (err) {
        if (err) throw err;
       // console.log("Connected!");
        var sqlquery = `Update NodeDashBoardAT SET AT1='${req.body.Value}' where  BatteryStringID='${req.body.BatteryStringID}'`;
        var request = new sql.Request();

        request.query(sqlquery, function (err, result) {
            if (!err)
                res.send(result);
            else
                res.send(err);
        });
    });

});
app.post('/checkStrCurrentByBatteryStringID', jsonParser, function (req, res) {
    sql.connect(config, function (err) {
        if (err) throw err;
       // console.log("Connected!");
        var sqlquery = `SELECT COUNT(*) as Count from NodeStringCurrent where BatteryStringID='${req.body.BatteryStringID}'`;
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
        var sqlquery = `INSERT INTO NodeStringCurrent (BatteryStringID,StringCurrent) VALUES ('${req.body.BatteryStringID}','${req.body.Value}')`;
        var request = new sql.Request();

        request.query(sqlquery, function (err, result) {
            if (!err)
                res.send(result);
            else
                res.send(err);
        });
    });

});
app.put('/updateInStringCurrent', jsonParser, function (req, res) {
    sql.connect(config, function (err) {
        if (err) throw err;
       // console.log("Connected!");
        var sqlquery = `UPDATE NodeStringCurrent SET StringCurrent='${req.body.Value}' WHERE  BatteryStringID='${req.body.BatteryStringID}'`;
        var request = new sql.Request();

        request.query(sqlquery, function (err, result) {
            if (!err)
                res.send(result);
            else
                res.send(err);
        });
    });

});
app.post('/insertarray', jsonParser, function (req, res) {
    sql.connect(config, function (err) {
        if (err) throw err;
       // console.log("Connected!");
        var sqlquery = `INSERT INTO NodeDashboardVoltageNew (BatteryStringID,DashboardVoltageArray) VALUES ('${req.body.BatteryStringID}','${req.body.Value}')`;
        var request = new sql.Request();

        request.query(sqlquery, function (err, result) {
            if (!err)
                res.send(result);
            else
                res.send(err);
        });
    });

});