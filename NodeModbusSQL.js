
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
app.get('/getUPSStringDataOld',jsonParser, function (req, res) {
    // connect to your database
    sql.connect(config, function (err) {

        if (err) console.log(err);

        // create Request object
        var request = new sql.Request();

        // query to the database and get the records
        request.query(`SELECT BatteryStringInfo.BatteryStringID, BatteryStringInfo.UPSID, BatteryStringInfo.NoOfBattery, BatteryStringInfo.ControlModuleStringID, BatteryStringInfo.StringName, UPSInfo.UPSName, UPSInfo.IPAddress, UPSInfo.COMPort, 
        UPSInfo.ControlModuleID * 16 + BatteryStringInfo.ControlModuleStringID AS SlaveID
 FROM            BatteryStringInfo INNER JOIN
        UPSInfo ON BatteryStringInfo.UPSID = UPSInfo.UPSID  `, function (err, recordset) {

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
        var sqlquery = `INSERT INTO NodeDashboardVoltage (BatteryId,DashboardVoltage,StringId,NodeDashboardTimeId) VALUES ('${req.body.BatteryId}','${req.body.Value}','${req.body.StringId}','${req.body.NodeDashboardTimeId}')`;
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
        var sqlquery = `INSERT INTO NodeDashboardIR (BatteryId,DashboardIR,StringId,NodeDashboardTimeId) VALUES ('${req.body.BatteryId}','${req.body.Value}','${req.body.StringId}','${req.body.NodeDashboardTimeId}')`;
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
        var sqlquery = `INSERT INTO NodeDashboardTemp (BatteryId,DashboardTemp,StringId,NodeDashboardTimeId) VALUES ('${req.body.BatteryId}','${req.body.Value}','${req.body.StringId}','${req.body.NodeDashboardTimeId}')`;
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
        var sqlquery = `INSERT INTO NodeStringVoltage (BatteryStringID,StringVoltage,NodeDashboardTimeId) VALUES ('${req.body.BatteryStringID}','${req.body.Value}','${req.body.NodeDashboardTimeId}')`;
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
        var sqlquery = `INSERT INTO NodeDashBoardAT (BatteryStringID,AT1,NodeDashboardTimeId) VALUES ('${req.body.BatteryStringID}','${req.body.Value}','${req.body.NodeDashboardTimeId}')`;
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
        var sqlquery = `INSERT INTO NodeStringCurrent (BatteryStringID,StringCurrent,NodeDashboardTimeId) VALUES ('${req.body.BatteryStringID}','${req.body.Value}','${req.body.NodeDashboardTimeId}')`;
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
app.post('/insertInDashboardTime', jsonParser, function (req, res) {
    sql.connect(config, function (err) {
        if (err) throw err;
       // console.log("Connected!");
        var sqlquery = `INSERT INTO NodeDashboardTime (DashboardTime) OUTPUT Inserted.NodeDashboardTimeId  VALUES ( '${req.body.DashboardTime}')`;
        var request = new sql.Request();

        request.query(sqlquery, function (err, result) {
            if (!err)
                res.send(result);
            else
                res.send(err);
        });
    });

});

app.delete('/deleteDashboardData', jsonParser, function (req, res) {
    sql.connect(config, function (err) {
        if (err) throw err;
       // console.log("Connected!");
        var sqlquery = ` Delete from NodeDashboardVoltage where NodeDashboardTimeId < (select max(NodeDashboardTimeId) from NodeDashboardTime)  
        Delete from NodeDashboardIR where NodeDashboardTimeId < (select max(NodeDashboardTimeId) from NodeDashboardTime)  
        Delete from NodeDashboardTemp where NodeDashboardTimeId < (select max(NodeDashboardTimeId) from NodeDashboardTime)  
        Delete from NodeDashBoardAT where NodeDashboardTimeId < (select max(NodeDashboardTimeId) from NodeDashboardTime)  
        Delete from NodeStringVoltage where NodeDashboardTimeId < (select max(NodeDashboardTimeId) from NodeDashboardTime) 
        Delete from NodeStringCurrent where NodeDashboardTimeId < (select max(NodeDashboardTimeId) from NodeDashboardTime) 
        Delete from NodeDashboardVoltage where NodeDashboardTimeId < (select max(NodeDashboardTimeId) from NodeDashboardTime)  
        Delete from NodeDashboardTime where NodeDashboardTimeId < (select max(NodeDashboardTimeId) from NodeDashboardTime)`;
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
        var sqlquery = `INSERT INTO NodeDischargeRecord (UPSID,StartDischarge,Status) OUTPUT Inserted.NodeDischargeRecordId  VALUES ('${req.body.UPSID}','${req.body.startdischarge}','${req.body.Status}')`;
        var request = new sql.Request();

        request.query(sqlquery, function (err, result) {
            if (!err)
                res.send(result);
            else
                res.send(err);
        });
    });

});
app.post('/insertIndischargerecordTime', jsonParser, function (req, res) {
    sql.connect(config, function (err) {
        if (err) throw err;
       // console.log("Connected!");
        var sqlquery = `INSERT INTO NodeDischargeRecordTime (NodeDischargeRecordId,DischargeRecordTime) OUTPUT Inserted.NodeDischargeRecordTimeId VALUES ('${req.body.NodeDischargeRecordId}','${req.body.DischargeRecordTime}')`;
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
        var sqlquery = `INSERT INTO NodeDischargeVoltage (BatteryID,DischargeVoltage,NodeDischargeRecordTimeId,StringId) VALUES ('${req.body.No}','${req.body.Value}','${req.body.TimeId}','${req.body.StringId}')`;
        var request = new sql.Request();

        request.query(sqlquery, function (err, result) {
            if (!err)
                res.send(result);
            else
                res.send(err);
        });
    });

});
app.post('/insertInDischargeStrVoltage', jsonParser, function (req, res) {
    sql.connect(config, function (err) {
        if (err) throw err;
       // console.log("Connected!");
        var sqlquery = `INSERT INTO NodeDischargeStringVoltage (StringId,DischargeStringVoltage,NodeDischargeRecordTimeId) VALUES ('${req.body.StringId}','${req.body.Value}','${req.body.NodeDischargeRecordTimeId}')`;
        var request = new sql.Request();

        request.query(sqlquery, function (err, result) {
            if (!err)
                res.send(result);
            else
                res.send(err);
        });
    });

});
app.post('/insertInDischargeStrCurrent', jsonParser, function (req, res) {
    sql.connect(config, function (err) {
        if (err) throw err;
       // console.log("Connected!");
        var sqlquery = `INSERT INTO NodeDischargeStringCurrent (StringId,DischargeCurrent,NodeDischargeRecordTimeId) VALUES ('${req.body.StringId}','${req.body.Value}','${req.body.NodeDischargeRecordTimeId}')`;
        var request = new sql.Request();

        request.query(sqlquery, function (err, result) {
            if (!err)
                res.send(result);
            else
                res.send(err);
        });
    });

});
app.post('/CheckREcordByUPSIDAndEndDisharge', jsonParser, function (req, res) {
    sql.connect(config, function (err) {
        if (err) throw err;
       // console.log("Connected!");
        var sqlquery = `SELECT COUNT(*) AS Expr1 FROM  LoadTestInformation WHERE (UPSID = '${req.body.UPSID}') AND (EndDischarge IS NULL) `;
        var request = new sql.Request();
        request.query(sqlquery, function (err, result) {
            if (!err)
                res.send(result);
            else
                res.send(err);
        });
    });

});
app.post('/ReturnLoadTestInfoIDByUPSID', jsonParser, function (req, res) {
    sql.connect(config, function (err) {
        if (err) throw err;
       // console.log("Connected!");
        var sqlquery = `SELECT LoadTestInfoID FROM LoadTestInformation WHERE (UPSID = '${req.body.UPSID}') AND (EndDischarge IS NULL) ORDER BY LoadTestInfoID DESC`;
        var request = new sql.Request();
        request.query(sqlquery, function (err, result) {
            if (!err)
                res.send(result);
            else
                res.send(err);
        });
    });

});
app.put('/UpdateStopDischargeByUPSID', jsonParser, function (req, res) {
    sql.connect(config, function (err) {
        if (err) throw err;
       // console.log("Connected!");
        var sqlquery = `UPDATE  NodeDischargeRecord SET EndDischarge = '${req.body.EndDischarge}',DischargeStatus= '${req.body.DischargeStatus}' WHERE (UPSID = '${req.body.UPSID}') AND (EndDischarge IS NULL) `;
        var request = new sql.Request();
        request.query(sqlquery, function (err, result) {
            if (!err)
                res.send(result);
            else
                res.send(err);
        });
    });

});
app.post('/CheckInfoByUPSIDAndENDDisharge', jsonParser, function (req, res) {
    sql.connect(config, function (err) {
        if (err) throw err;
       // console.log("Connected!");
        var sqlquery = `SELECT  COUNT(*) AS count FROM NodeDischargeRecord WHERE (UPSID = '${req.body.UPSID}') AND (EndDischarge IS NULL) `;
        var request = new sql.Request();
        request.query(sqlquery, function (err, result) {
            if (!err)
                res.send(result);
            else
                res.send(err);
        });
    });

});
app.post('/returnNodeDischargeRecordIdByUPSID', jsonParser, function (req, res) {
    sql.connect(config, function (err) {
        if (err) throw err;
       // console.log("Connected!");
        var sqlquery = `SELECT NodeDischargeRecordId FROM NodeDischargeRecord WHERE (UPSID = '${req.body.UPSID}') AND (EndDischarge IS NULL)
        ORDER BY NodeDischargeRecordId DESC`;
        var request = new sql.Request();
        request.query(sqlquery, function (err, result) {
            if (!err)
                res.send(result);
            else
                res.send(err);
        });
    });

});
app.post('/insertInHistoryTime', jsonParser, function (req, res) {
    sql.connect(config, function (err) {
        if (err) throw err;
       // console.log("Connected!");
        var sqlquery = `INSERT INTO NodeHistoryTime (HistoryTime) OUTPUT Inserted.NodeHistoryTimeId  VALUES ( '${req.body.HistoryTime}')`;
        var request = new sql.Request();

        request.query(sqlquery, function (err, result) {
            if (!err)
                res.send(result);
            else
                res.send(err);
        });
    });

});
app.post('/insertInHistoryVoltage', jsonParser, function (req, res) {
    sql.connect(config, function (err) {
        if (err) throw err;
       // console.log("Connected!");
        var sqlquery = `INSERT INTO NodeHistoryVoltage (BatteryId,NodeHistoryTimeId,VoltageHistory,StringId) VALUES ('${req.body.BatteryId}','${req.body.NodeHistoryTimeId}','${req.body.Value}','${req.body.StringId}')`;
        var request = new sql.Request();

        request.query(sqlquery, function (err, result) {
            if (!err)
                res.send(result);
            else
                res.send(err);
        });
    });

});
app.post('/insertInHistoryIR', jsonParser, function (req, res) {
    sql.connect(config, function (err) {
        if (err) throw err;
       // console.log("Connected!");
        var sqlquery = `INSERT INTO NodeHistoryIR (BatteryId,NodeHistoryTimeId,HistoryIR,StringId) VALUES ('${req.body.BatteryId}','${req.body.NodeHistoryTimeId}','${req.body.Value}','${req.body.StringId}')`;
        var request = new sql.Request();

        request.query(sqlquery, function (err, result) {
            if (!err)
                res.send(result);
            else
                res.send(err);
        });
    });

});
app.post('/insertInHistoryTemp', jsonParser, function (req, res) {
    sql.connect(config, function (err) {
        if (err) throw err;
       // console.log("Connected!");
        var sqlquery = `INSERT INTO NodeHistoryTemp (BatteryId,NodeHistoryTimeId,BTHistory,StringId) VALUES ('${req.body.BatteryId}','${req.body.NodeHistoryTimeId}','${req.body.Value}','${req.body.StringId}')`;
        var request = new sql.Request();

        request.query(sqlquery, function (err, result) {
            if (!err)
                res.send(result);
            else
                res.send(err);
        });
    });

});
app.post('/returnHistoryCountByDate', jsonParser, function (req, res) {
    sql.connect(config, function (err) {
        if (err) throw err;
       // console.log("Connected!");
        var sqlquery = `SELECT  COUNT(*) AS count FROM NodeHistoryTime where (CAST(HistoryTime AS date)  = '${req.body.HistoryTime}') `;
        var request = new sql.Request();
        request.query(sqlquery, function (err, result) {
            if (!err)
                res.send(result);
            else
                res.send(err);
        });
    });

});
app.get('/getStrCurrentRecordsForMaxDashboardTimeID',jsonParser, function (req, res) {
     sql.connect(config, function (err) {

        if (err) console.log(err);
    var request = new sql.Request();
    request.query(`SELECT NodeStringCurrent.NodeStringCurrentId, NodeStringCurrent.BatteryStringID, NodeStringCurrent.StringCurrent, NodeStringCurrent.NodeDashboardTimeId, NodeStringVoltage.StringVoltage, BatteryStringInfo.NoOfBattery, 
    NodeStringVoltage.NodeDashboardTimeId AS Expr1
FROM     NodeStringCurrent INNER JOIN
    BatteryStringInfo ON NodeStringCurrent.BatteryStringID = BatteryStringInfo.BatteryStringID INNER JOIN
    NodeStringVoltage ON BatteryStringInfo.BatteryStringID = NodeStringVoltage.BatteryStringID
WHERE  (NodeStringCurrent.NodeDashboardTimeId =
        (SELECT MAX(NodeDashboardTimeId) AS Expr1
         FROM      NodeStringCurrent AS NodeStringCurrent_1))`, function (err, recordset) {
        if (err) console.log(err)
         res.send(recordset); 
        });
    });
});
app.post('/ReturnDischargeStatusByUPSID', jsonParser, function (req, res) {
    sql.connect(config, function (err) {
        if (err) throw err;
       // console.log("Connected!");
        var sqlquery = `SELECT DischargeStatus FROM NodeDischargeRecord WHERE (UPSID = '${req.body.UPSID}') AND (EndDischarge IS NULL) ORDER BY NodeDischargeRecordId DESC`;
        var request = new sql.Request();
        request.query(sqlquery, function (err, result) {
            if (!err)
                res.send(result);
            else
                res.send(err);
        });
    });

});