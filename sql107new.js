var express = require('express');
var app = express();
var sql = require("mssql");
const port=1000
var bodyParser = require('body-parser')
var jsonParser = bodyParser.json()
app.use(express.static("public"));
// config for your database
var config = {  
    // user: 'sa1',  
    // password: 'sa1',  
    // server: "localhost",  
    // database: "profile" ,
    user: "nodeIndus2020",
    password: "nodeIndus2020",
    database: "Indus2020",
    server: '114.79.133.107',
    parseJSON: true,
    options: {
        encrypt: false, // for azure
        trustServerCertificate: false // change to true for local dev / self-signed certs
      }
    }  ;
    app.get('/', function (req, res) {
        // connect to your database
       sql.connect(config, function (err) {
       
           if (err) console.log(err);
          // res.redirect('Sizing.html');
            //res.send("Hello World");
       });
   });
// app.get('/', function (req, res) {
//      // connect to your database
//      //res.send("Hello World");
//     sql.connect(config, function (err) {
    
//         if (err) console.log(err);

//         // create Request object
//         var request = new sql.Request();
           
//         // query to the database and get the records
//         request.query('select * from tblProfile', function (err, recordset) {
            
//             if (err) console.log(err)

//             // send records as a response
//             res.send(recordset);
            
//         });
//     });
// });

var server = app.listen(1000, function () {
    console.log('Server is running..');
});
app.post('/posttry', function (req, res) {
    // connect to your database
   sql.connect(config, function (err) {
   
       if (err) console.log(err);

       // create Request object
       var request = new sql.Request();
          
       // query to the database and get the records
       request.query('INSERT INTO tblProfile SET ?', function (err, recordset) {
           
           if (err) console.log(err)

           // send records as a response
           res.send(recordset);
           
       });
   });
});

app.post('/staticInsert',function(req,res){
    sql.connect(config, function (err) {
        if (err) throw err;
        console.log("Connected!");
        //Insert a record in the table:
        var sqlquery = "INSERT INTO tblProfile (name, lastname,email,password) VALUES ('1', 'na','na','na')";
       
        var request = new sql.Request();
        
        request.query(sqlquery,  function(err, result)  {
	 
         //  request.query(sqlquery, function (err, result) {
        //   if (err) throw err;
        //   console.log("1 record inserted");
        if(!err)   
        res.send(result);  
        else  
        res.send(err);  
        });
      });
});
app.post('/dynamicInsert',jsonParser,function(req,res){
    sql.connect(config, function (err) {
        if (err) throw err;
        console.log("Connected!");
        //Insert a record in the "customers" table:
        var sqlquery=`INSERT INTO tblProfile (name, lastname,email,password) VALUES ('${req.body.name}', '${req.body.lastname}','${req.body.email}','${req.body.password}')`;
        var request = new sql.Request();
        
           request.query(sqlquery, function (err, result) {
        //   if (err) throw err;
        //   console.log("1 record inserted");
        if(!err)   
        res.send(result);  
        else  
        res.send(err);  
        });
      });
    
});

app.post('/dynamicInsert107',jsonParser,function(req,res){
    sql.connect(config, function (err) {
        if (err) throw err;
        console.log("Connected!");
        //Insert a record in the table:
       // var sqlquery = "INSERT INTO Test1 (QRCodeId, ScanPalletId,SystemDate) VALUES ('1', 'na','2022-02-25')";
        var sqlquery=`INSERT INTO Test1 (QRCodeId, ScanPalletId,SystemDate) VALUES ('${req.body.QRCodeId}','${req.body.ScanPalletId}','${req.body.SystemDate}')`;
      
        var request = new sql.Request();
        
        request.query(sqlquery,  function(err, result)  {
   
         //  request.query(sqlquery, function (err, result) {
        //   if (err) throw err;
          console.log("1 record inserted");
        if(!err)   
        res.send(result);  
        else  
        res.send(err);  
        });
      });
  });

   
  app.post('/getIndusQRCodeIDByPallet',jsonParser,function(req,res){
    sql.connect(config, function (err) {
        if (err) throw err;
        console.log("Connected!");
         var sqlquery=  `SELECT distinct(QRCodeID) FROM QRDetails WHERE   (QRPalletID = '${req.body.PalletId}') 
              FOR JSON PATH`;
        var request = new sql.Request();
        
        request.query(sqlquery,  function(err, result)  {
    
        if(!err)   
        res.send(result);  
        else  
        res.send(err);  
        });
      });
  });

  app.get('/returnMaxBSCNo',jsonParser,function(req,res){
    sql.connect(config, function (err) {
        if (err) throw err;
        console.log("Connected!");
         var sqlquery=  `SELECT        MAX(RIGHT(BSCNumber, 4)) AS BSCNumber
         FROM            SizingNode
         GROUP BY SizingNodeId
         ORDER BY SizingNodeId DESC
              FOR JSON PATH`;
        var request = new sql.Request();
        
        request.query(sqlquery,  function(err, result)  {
    
        if(!err)   
        res.send(result);  
        else  
        res.send(err);  
        });
      });
  });
  app.post('/insertInSizingNode',jsonParser,function(req,res){
    sql.connect(config, function (err) {
        if (err) throw err;
        console.log("Connected!");
          var sqlquery=`INSERT INTO [dbo].[SizingNode]
        ([BSCNumber]
        ,[ProjectName]
        ,[UPSKVA]
        ,[PF]
        ,[InvEff]
        ,[ECV]
        ,[BackupTime]
        ,[NoOfBattery]
        ,[CellsOrBattery]
        ,[KVAPFValue]
        ,[NoOfBatteryNoOfCellsPerBatteryEffValue]
        ,[WattPerCellRequired]
        ,[NoOfStrings]
        ,[RequiredWattsPerString]
        ,[SystemDate])
  VALUES
        ('${req.body.BSCNumber}' 
        ,'${req.body.ProjectName}' 
        ,'${req.body.UPSKVA}' 
        ,'${req.body.PF}' 
        ,'${req.body.InvEff}' 
        ,'${req.body.ECV}' 
        ,'${req.body.BackupTime}' 
        ,'${req.body.NoOfBattery}' 
        ,'${req.body.CellsOrBattery}' 
        ,'${req.body.KVAPFValue}' 
        ,'${req.body.NoOfBatteryNoOfCellsPerBatteryEffValue}' 
        ,'${req.body.WattPerCellRequired}' 
        ,'${req.body.NoOfStrings}' 
        ,'${req.body.RequiredWattsPerString}' 
        ,'${req.body.SystemDate}' )`;
      
        var request = new sql.Request();
        
        request.query(sqlquery,  function(err, result)  {
   
         //  request.query(sqlquery, function (err, result) {
        //   if (err) throw err;
          console.log("1 record inserted");
        if(!err)   
        res.send(result);  
        else  
        res.send(err);  
        });
      });
  });
  
  app.get('/getSizingData',jsonParser,function(req,res){
    sql.connect(config, function (err) {
        if (err) throw err;
        console.log("Connected!");
         var sqlquery=  `SELECT * from SizingNode 
         ORDER BY SizingNodeId DESC
              FOR JSON PATH`;
        var request = new sql.Request();
        
        request.query(sqlquery,  function(err, result)  {
    
        if(!err)   
        res.send(result);  
        else  
        res.send(err);  
        });
      });
  });
  app.post('/deleteSizingById',jsonParser,function(req,res){
    sql.connect(config, function (err) {
        if (err) throw err;
        console.log("Connected!");
         var sqlquery=  `Delete from SizingNode 
         where SizingNodeId = '${req.body.SizingNodeId}'
              FOR JSON PATH`;
        var request = new sql.Request();
        
        request.query(sqlquery,  function(err, result)  {
    
        if(!err)   
        res.send(result);  
        else  
        res.send(err);  
        });
      });
  });

  app.get('/getexpense', function (req, res) {
    // connect to your database
   sql.connect(config, function (err) {
   
       if (err) console.log(err);
  
       // create Request object
       var request = new sql.Request();
          
       // query to the database and get the records
       request.query(`SELECT  Expense.ExpenseId,   Expense.ReferenceSubType, Expense.ReferenceNo, Expense.Subtotal, Expense.TaxAmount, Expense.TotalAmount, Expense.DueDate, Expense.VendorInvoiceNumber, Expense.VendorInvoiceDate, Expense.USDExRate, Expense.USDTotal, 
       Expense.BaseCurrencyExRate, Expense.BaseCurrencyTotal, Companies.CompanyName, ExpenseServiceType.ExpenseServiceName, Currency.ShortName, Expense.PaymentApproval, Expense.ApprovedBy, Expense.ApprovalRemarks, 
       BusinessUnit.BusinessUnitName, Expense.SystemDate
FROM        Expense INNER JOIN
       Companies ON Expense.CompanyID = Companies.CompanyID INNER JOIN
       ExpenseServiceType ON Expense.ExpenseServiceTypeId = ExpenseServiceType.ExpenseServiceTypeId INNER JOIN
       Organizations ON Expense.OrgID = Organizations.OrgID INNER JOIN
       Currency ON Expense.MatchingCurrencyId = Currency.CurrencyID LEFT OUTER JOIN
       BusinessUnit ON Expense.BusinessUnitID = BusinessUnit.BusinessUnitID
WHERE     (Expense.OrgID = 2) AND (YEAR(Expense.VendorInvoiceDate) = 2022 or YEAR(Expense.VendorInvoiceDate) = 2023 ) 
ORDER BY Expense.ExpenseId DESC`, function (err, recordset) {
           
           if (err) console.log(err)
  
           // send records as a response
           res.send(recordset);
            
       });
   });
  });
  app.get('/getsales', function (req, res) {
    // connect to your database
   sql.connect(config, function (err) {
   
       if (err) console.log(err);
  
       // create Request object
       var request = new sql.Request();
          
       // query to the database and get the records
       request.query(`SELECT     Outward.DocumentType, Outward.DocumentRefNo, Outward.DocumentDate, Outward.SystemDate, Outward.PortOfDischarge, Outward.FinalDestination, Outward.DocumentNo, Outward.CreatedBy, Outward.Total, Outward.USDTotal, Outward.SubTotal, Outward.GSTTotal, 
       Outward.SalesExpRatio, Outward.PortOfLoading, Companies.CompanyName, BusinessUnit.BusinessUnitName, Organizations.DisplayName
FROM        Outward INNER JOIN
       Companies ON Outward.CompanyID = Companies.CompanyID INNER JOIN
       BusinessUnit ON Outward.BusinessUnitID = BusinessUnit.BusinessUnitID INNER JOIN
       Organizations ON Outward.OrgID = Organizations.OrgID AND Companies.OrgID = Organizations.OrgID AND BusinessUnit.OrgID = Organizations.OrgID
WHERE    Outward.OrgID = 2 AND((YEAR(Outward.DocumentDate) = 2022) OR
       (YEAR(Outward.DocumentDate) = 2023))`, function (err, recordset) {
           
           if (err) console.log(err)
  
           // send records as a response
           res.send(recordset);
            
       });
   });
  });
  app.get('/getPaymentData',function (req,res){
       // connect to your database
     sql.connect(config, function (err) {
     
         if (err) console.log(err);
    
         // create Request object
         var request = new sql.Request();
            
         // query to the database and get the records
         request.query(` SELECT  BUPayment.BUPaymentId, BUPayment.ReferenceId, BUPayment.ReferenceType, BUPayment.TypeOfPayment,
          BUPayment.PayToName, BUPayment.Amount, BUPayment.Currency, BUPayment.BusinessUnit,  BUPayment.PayCategory,
           BUPayment.PaymentDone, BUPayment.PaymentReferenceNo, BUPayment.PaymentMode, BUPayment.DocumentUpload, 
           BUPayment.ReferenceNo, BUPayment.DocumentNo, BUPayment.DueDate, BUPayment.PaidTotal, BUPayment.SystemDate,
            BUPayment.BUPaymentDetailsId, BUPayment.OrgID, Expense.VendorInvoiceNumber
FROM            BUPayment LEFT OUTER JOIN
         Expense ON BUPayment.ReferenceId = Expense.ExpenseId
WHERE        (BUPayment.OrgID = 2)`, function (err, recordset) {
             
             if (err) console.log(err)
    
             // send records as a response
             res.send(recordset);
              
         });
     });
    });

    app.get('/getPayDetailsMaxNo', function (req,res){
      sql.connect(config, function(err){
        if (err) console.log(err);

        var request = new sql.Request();
        request.query(`SELECT MAX(RIGHT (ReferenceNo, 4)) AS Expr1 FROM BUPaymentDetails WHERE (YEAR(PaymentDate) = YEAR({ fn CURDATE() }))`,function(err,recordset){
          if (err) console.log(err);
          res.send(recordset);
        });

      })
    });
    app.post('/InsertPaymentdetails',jsonParser,function(req,res){
      sql.connect(config, function (err) {
          if (err) throw err;
          console.log("Connected!");
          //Insert a record in the "customers" table:
          var sqlquery=` INSERT INTO [dbo].[BUPaymentDetails]
          ([PaymentMode]
          ,[ReferenceNo]
          ,[PaymentDate]
           ) OUTPUT Inserted.BUPaymentDetailsID
        VALUES
          ('${req.body.PaymentMode}'
          ,'${req.body.ReferenceNo}'
          ,'${req.body.PaymentDate}'
           
           )  `;
          var request = new sql.Request();
          
             request.query(sqlquery, function (err, result) {
          //   if (err) throw err;
           
          
          if(!err)   
          res.send(result);  
          else  
          res.send(err);  
          });
        });
      
    });
    app.put('/UpdateIdInPaymet',jsonParser,function(req,res){
      sql.connect(config, function (err) {
          if (err) throw err;
          console.log("Connected!");
          //Insert a record in the "customers" table:
          var sqlquery=` UPDATE [dbo].[BUPayment]
            set BUPaymentDetailsId = '${req.body.BUPaymentDetailsId}'
            WHERE 
            BUPaymentId  = '${req.body.BUPaymentId}'
             `;
          var request = new sql.Request();
          
             request.query(sqlquery, function (err, result) {
          //   if (err) throw err;
           if(!err)   
          res.send(result);  
          else  
          res.send(err);  
          });
        });
      
    });
    app.get('/ViewPaymentDetails', function (req,res){
      sql.connect(config, function(err){
        if (err) console.log(err);
   
        var request = new sql.Request();
        var sqlquery=`SELECT DISTINCT   BUPaymentDetails.PaymentReferenceNo, BUPaymentDetails.BUPaymentDetailsID, BUPaymentDetails.PaymentDone, BUPaymentDetails.PaymentMode, BUPaymentDetails.ReferenceNo, 
        BUPaymentDetails.DocumentNo, BUPaymentDetails.PaymentDate, BUPaymentDetails.PaidAmount, BUPaymentDetails.PaymentRemarks, BUPaymentDetails.Bank, BUPayment.PayToName
  FROM            BUPaymentDetails INNER JOIN
        BUPayment ON BUPaymentDetails.BUPaymentDetailsID = BUPayment.BUPaymentDetailsId
  WHERE        (BUPayment.OrgID = 2)`;
        request.query(sqlquery,function(err,recordset){
          if (err) console.log(err);
          res.send(recordset);
        });
   
      })
    });
   
    app.post('/ViewPaymentByPDId',jsonParser, function (req, res) {
       sql.connect(config, function (err) {
     
         if (err) console.log(err);
        var request = new sql.Request();
          request.query(`SELECT  BUPaymentId, BUPaymentDetailsId, ReferenceId, ReferenceType, TypeOfPayment, PayToName,
           Amount, Currency, BusinessUnit, PayCategory, PaymentDone, PaymentReferenceNo, 
          PaymentMode, DocumentUpload, ReferenceNo, DocumentNo, DueDate, PaidTotal, SystemDate, OrgID
  FROM BUPayment WHERE (BUPaymentDetailsId  = '${req.body.BUPaymentDetailsId }')`, function (err, recordset) {
             
             if (err) console.log(err)
              res.send(recordset);
              
         });
     });
    });

