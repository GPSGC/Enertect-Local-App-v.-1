var express = require('express');
var app = express();
var sql = require("mssql");
const port = 1000
var bodyParser = require('body-parser')
var jsonParser = bodyParser.json()
app.use(express.static("public"));
const multer = require("multer");
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
};
app.get('/', function (req, res) {
  // connect to your database
  //  sql.connect(config, function (err) {

  //      if (err) console.log(err);
  //      res.redirect('Sizing.html');
  // res.send("Hello World");
  //  });
});
var server = app.listen(1000, function () {
  console.log(`Server is running ${port}`);
});

app.get('/getexpense', function (req, res) {
  // connect to your database
  sql.connect(config, function (err) {

    if (err) console.log(err);

    // create Request object
    var request = new sql.Request();

    // query to the database and get the records
    request.query(`SELECT     Expense.ExpenseId,   Expense.ReferenceSubType, Expense.ReferenceNo, Expense.Subtotal, Expense.TaxAmount, Expense.TotalAmount, Expense.DueDate, Expense.VendorInvoiceNumber, Expense.VendorInvoiceDate, Expense.USDExRate, Expense.USDTotal, 
       Expense.BaseCurrencyExRate, Expense.BaseCurrencyTotal, Companies.CompanyName, ExpenseServiceType.ExpenseServiceName, Currency.ShortName, Expense.PaymentApproval, Expense.ApprovedBy, Expense.ApprovalRemarks, 
       BusinessUnit.BusinessUnitName, Expense.SystemDate
FROM        Expense INNER JOIN
       Companies ON Expense.CompanyID = Companies.CompanyID INNER JOIN
       ExpenseServiceType ON Expense.ExpenseServiceTypeId = ExpenseServiceType.ExpenseServiceTypeId INNER JOIN
       Organizations ON Expense.OrgID = Organizations.OrgID INNER JOIN
       Currency ON Expense.MatchingCurrencyId = Currency.CurrencyID LEFT OUTER JOIN
       BusinessUnit ON Expense.BusinessUnitID = BusinessUnit.BusinessUnitID
WHERE     (Expense.OrgID = 2) AND (YEAR(Expense.VendorInvoiceDate) = 2023 or YEAR(Expense.VendorInvoiceDate) = 2024 ) 
ORDER BY Expense.ExpenseId DESC`, function (err, recordset) {

      if (err) console.log(err)

      // send records as a response
      res.send(recordset);

    });
  });
});
app.get('/getexpenseDU', function (req, res) {
  // connect to your database
  sql.connect(config, function (err) {

    if (err) console.log(err);

    // create Request object
    var request = new sql.Request();

    // query to the database and get the records
    request.query(`SELECT     Expense.ExpenseId,   Expense.ReferenceSubType, Expense.ReferenceNo, Expense.Subtotal, Expense.TaxAmount, Expense.TotalAmount, Expense.DueDate, Expense.VendorInvoiceNumber, Expense.VendorInvoiceDate, Expense.USDExRate, Expense.USDTotal, 
       Expense.BaseCurrencyExRate, Expense.BaseCurrencyTotal, Companies.CompanyName, ExpenseServiceType.ExpenseServiceName, Currency.ShortName, Expense.PaymentApproval, Expense.ApprovedBy, Expense.ApprovalRemarks, 
       BusinessUnit.BusinessUnitName, Expense.SystemDate
FROM        Expense INNER JOIN
       Companies ON Expense.CompanyID = Companies.CompanyID INNER JOIN
       ExpenseServiceType ON Expense.ExpenseServiceTypeId = ExpenseServiceType.ExpenseServiceTypeId INNER JOIN
       Organizations ON Expense.OrgID = Organizations.OrgID INNER JOIN
       Currency ON Expense.MatchingCurrencyId = Currency.CurrencyID LEFT OUTER JOIN
       BusinessUnit ON Expense.BusinessUnitID = BusinessUnit.BusinessUnitID
WHERE     (Expense.OrgID = 4) AND (YEAR(Expense.VendorInvoiceDate) = 2023 or YEAR(Expense.VendorInvoiceDate) = 2024 ) 
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
WHERE    Outward.OrgID = 2 AND((YEAR(Outward.DocumentDate) = 2023) OR
       (YEAR(Outward.DocumentDate) = 2024))`, function (err, recordset) {

      if (err) console.log(err)

      // send records as a response
      res.send(recordset);

    });
  });
});
app.get('/getsalesDU', function (req, res) {
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
WHERE    Outward.OrgID = 4 AND((YEAR(Outward.DocumentDate) = 2023) OR
       (YEAR(Outward.DocumentDate) = 2024))`, function (err, recordset) {

      if (err) console.log(err)

      // send records as a response
      res.send(recordset);

    });
  });
});
app.get('/getexpensewithratio', function (req, res) {
  // connect to your database
  sql.connect(config, function (err) {

    if (err) console.log(err);

    // create Request object
    var request = new sql.Request();

    // query to the database and get the records
    request.query(`SELECT     Expense.ExpenseId, Expense.ReferenceSubType, Expense.ReferenceNo, Expense.Subtotal, 
       Expense.TaxAmount, Expense.TotalAmount, Expense.DueDate, Expense.VendorInvoiceNumber, Expense.VendorInvoiceDate,
        Expense.USDExRate, Expense.USDTotal, Expense.BaseCurrencyExRate, Expense.BaseCurrencyTotal, Companies.CompanyName,
         ExpenseServiceType.ExpenseServiceName, Currency.ShortName, Expense.PaymentApproval, Expense.ApprovedBy, 
         Expense.ApprovalRemarks,BusinessUnit.BusinessUnitName, Expense.SystemDate,
          CASE WHEN ReferenceSubType = 'Inward' THEN ISNULL(Expense.USDTotal / NULLIF (Inward.POUSDTotal, 0), 0) 
          WHEN ReferenceSubType = 'Outward' THEN ISNULL(Expense.USDTotal / NULLIF (Outward.USDTotal, 0), 0) 
          ELSE 0 END AS ExpenseRatio
       FROM Expense INNER JOIN  Companies ON Expense.CompanyID = Companies.CompanyID INNER JOIN ExpenseServiceType ON Expense.ExpenseServiceTypeId = ExpenseServiceType.ExpenseServiceTypeId INNER JOIN Organizations ON Expense.OrgID = Organizations.OrgID INNER JOIN Currency ON Expense.MatchingCurrencyId = Currency.CurrencyID LEFT OUTER JOIN                  Outward ON Expense.OrgID = Outward.OrgID AND Expense.ReferenceId = Outward.OutwardId LEFT OUTER JOIN  Inward ON Expense.OrgID = Inward.OrgID AND Expense.ReferenceId = Inward.InwardId LEFT OUTER JOIN BusinessUnit ON Expense.BusinessUnitID = BusinessUnit.BusinessUnitID
       WHERE (Expense.OrgID = 2) AND (YEAR(Expense.VendorInvoiceDate) = 2023 OR  YEAR(Expense.VendorInvoiceDate) = 2024)ORDER BY Expense.ExpenseId DESC`, function (err, recordset) {

      if (err) console.log(err)

      // send records as a response
      res.send(recordset);

    });
  });
});
app.get('/getexpensewithratioDU', function (req, res) {
  // connect to your database
  sql.connect(config, function (err) {

    if (err) console.log(err);

    // create Request object
    var request = new sql.Request();

    // query to the database and get the records
    request.query(`SELECT     Expense.ExpenseId, Expense.ReferenceSubType, Expense.ReferenceNo, Expense.Subtotal, 
       Expense.TaxAmount, Expense.TotalAmount, Expense.DueDate, Expense.VendorInvoiceNumber, Expense.VendorInvoiceDate,
        Expense.USDExRate, Expense.USDTotal, Expense.BaseCurrencyExRate, Expense.BaseCurrencyTotal, Companies.CompanyName,
         ExpenseServiceType.ExpenseServiceName, Currency.ShortName, Expense.PaymentApproval, Expense.ApprovedBy, 
         Expense.ApprovalRemarks,BusinessUnit.BusinessUnitName, Expense.SystemDate,
          CASE WHEN ReferenceSubType = 'Inward' THEN ISNULL(Expense.USDTotal / NULLIF (Inward.POUSDTotal, 0), 0) 
          WHEN ReferenceSubType = 'Outward' THEN ISNULL(Expense.USDTotal / NULLIF (Outward.USDTotal, 0), 0) 
          ELSE 0 END AS ExpenseRatio
       FROM Expense INNER JOIN  Companies ON Expense.CompanyID = Companies.CompanyID INNER JOIN ExpenseServiceType ON Expense.ExpenseServiceTypeId = ExpenseServiceType.ExpenseServiceTypeId INNER JOIN Organizations ON Expense.OrgID = Organizations.OrgID INNER JOIN Currency ON Expense.MatchingCurrencyId = Currency.CurrencyID LEFT OUTER JOIN                  Outward ON Expense.OrgID = Outward.OrgID AND Expense.ReferenceId = Outward.OutwardId LEFT OUTER JOIN  Inward ON Expense.OrgID = Inward.OrgID AND Expense.ReferenceId = Inward.InwardId LEFT OUTER JOIN BusinessUnit ON Expense.BusinessUnitID = BusinessUnit.BusinessUnitID
       WHERE (Expense.OrgID = 4) AND (YEAR(Expense.VendorInvoiceDate) = 2023 OR  YEAR(Expense.VendorInvoiceDate) = 2024)ORDER BY Expense.ExpenseId DESC`, function (err, recordset) {

      if (err) console.log(err)

      // send records as a response
      res.send(recordset);

    });
  });
});

app.post('/getPaymentData',jsonParser, function (req, res) {
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
         BUPayment.BUPaymentDetailsId, BUPayment.OrgID, Expense.VendorInvoiceNumber,BUPayment.Status,Expense.VendorInvoiceDate
FROM            BUPayment LEFT OUTER JOIN
      Expense ON BUPayment.ReferenceId = Expense.ExpenseId
WHERE        (BUPayment.OrgID = 2) AND (YEAR(BUPayment.SystemDate) = 2023 OR YEAR(BUPayment.SystemDate) = 2024) AND (MONTH(Expense.VendorInvoiceDate) = '${req.body.Month}')`, function (err, recordset) {

      if (err) console.log(err)

      // send records as a response
      res.send(recordset);

    });
  });
});
app.get('/getPaymentDetailsData',jsonParser, function (req, res) {
  // connect to your database
  sql.connect(config, function (err) {

    if (err) console.log(err);

    // create Request object
    var request = new sql.Request();

    // query to the database and get the records
    request.query(`SELECT DISTINCT BUPaymentDetails.PaymentReferenceNo,
     BUPaymentDetails.BUPaymentDetailsID, BUPaymentDetails.PaymentDone, 
     BUPaymentDetails.PaymentMode, BUPaymentDetails.ReferenceNo, BUPaymentDetails.DocumentNo,
      BUPaymentDetails.PaymentDate, BUPaymentDetails.PaidAmount, BUPaymentDetails.PaymentRemarks, 
      BUPaymentDetails.Bank, BUPayment.PayToName, BUPayment.Currency 
      FROM BUPaymentDetails INNER JOIN BUPayment ON BUPaymentDetails.BUPaymentDetailsID = BUPayment.BUPaymentDetailsId WHERE (BUPayment.OrgID = 2) ORDER BY BUPaymentDetails.PaymentDate DESC` , function (err, recordset) {

      if (err) console.log(err)

      // send records as a response
      res.send(recordset);

    });
  });
});

app.post('/getPaymentDetailsDataNested',jsonParser, function (req, res) {
  // connect to your database
  sql.connect(config, function (err) {

    if (err) console.log(err);

    // create Request object
    var request = new sql.Request();

    // query to the database and get the records
    request.query(`SELECT ReferenceType, TypeOfPayment, PayToName, Amount, Currency, 
    BusinessUnit, PayCategory, PaymentReferenceNo, PaymentMode, ReferenceNo, DocumentNo, BUPaymentDetailsID,
    SystemDate FROM BUPayment WHERE (BUPaymentDetailsID ='${req.body.BUPaymentDetailsID}')`, function (err, recordset) {

      if (err) console.log(err)

      // send records as a response
      res.send(recordset);

    });
  });
});

app.get('/getPayDetailsMaxNo', function (req, res) {

  sql.connect(config, function (err) {
    if (err) console.log(err);

    var request = new sql.Request();
    request.query(`SELECT MAX(RIGHT (ReferenceNo, 4)) AS Expr1 FROM BUPaymentDetails WHERE (YEAR(PaymentDate) = YEAR({ fn CURDATE() }))`, function (err, recordset) {
      if (err) console.log(err);
      res.send(recordset);
    });

  })
});
app.post('/InsertPaymentdetails', jsonParser, function (req, res) {
  sql.connect(config, function (err) {
    if (err) throw err;
    console.log("Connected!");
    //Insert a record in the "customers" table:
    var sqlquery = ` INSERT INTO [dbo].[BUPaymentDetails]
       ([PaymentMode]
       ,[ReferenceNo]
       ,[PaymentDate]
       ,[PaidAmount]
       ,[PaymentRemarks]
       ,[DocumentUpload]
       ,[VendorName]

        ) OUTPUT Inserted.BUPaymentDetailsID
     VALUES
       ('${req.body.PaymentMode}'
       ,'${req.body.ReferenceNo}'
       ,'${req.body.PaymentDate}'
       ,'${req.body.PaidAmount}'
       ,'${req.body.PaymentRemarks}'
       ,'${req.body.DocumentUpload}'
       ,'${req.body.VendorName}'
        )  `;
    var request = new sql.Request();

    request.query(sqlquery, function (err, result) {
      //   if (err) throw err;


      if (!err)
        res.send(result);
      else
        res.send(err);
    });
  });

});
app.put('/UpdateIdInPaymet', jsonParser, function (req, res) {
  sql.connect(config, function (err) {
    if (err) throw err;
    console.log("Connected!");
    //Insert a record in the "customers" table:
    var sqlquery = ` UPDATE [dbo].[BUPayment]
         set BUPaymentDetailsId = '${req.body.BUPaymentDetailsId}', Status = '${req.body.Status}'
         WHERE 
         BUPaymentId  = '${req.body.BUPaymentId}'
          `;
    var request = new sql.Request();

    request.query(sqlquery, function (err, result) {
      //   if (err) throw err;
      if (!err)
        res.send(result);
      else
        res.send(err);
    });
  });

});
app.post('/VendorBankDetails',jsonParser, function (req, res) {
  // connect to your database
  sql.connect(config, function (err) {

    if (err) console.log(err);

    // create Request object
    var request = new sql.Request();

    // query to the database and get the records
    request.query(`SELECT     VendorBankDetails.BankName, VendorBankDetails.BankAddress, VendorBankDetails.AccountNo, VendorBankDetails.SwiftCode, VendorBankDetails.Email, VendorBankDetails.CompanyName, Currency.ShortName AS Currency
    FROM        VendorBankDetails INNER JOIN
                      Currency ON VendorBankDetails.CurrencyID = Currency.CurrencyID
    WHERE      (CompanyName = '${req.body.CompanyName}')`, function (err, recordset) {

      if (err) console.log(err)

      // send records as a response
      res.send(recordset);

    });
  });
});
app.get('/getOrganizationList', function (req, res) {
  // connect to your database
  sql.connect(config, function (err) {

    if (err) console.log(err);

    // create Request object
    var request = new sql.Request();

    // query to the database and get the records
    request.query(`select * from Organizations`, function (err, recordset) {

      if (err) console.log(err)

      // send records as a response
      res.send(recordset);

    });
  });
});
app.post('/getPOByOrgID', jsonParser, function (req, res) {

  sql.connect(config, function (err) {

    if (err) console.log(err);

    // create Request object
    var request = new sql.Request();

    // query to the database and get the records
    request.query(`SELECT *  FROM Inward
  WHERE (OrgID = '${req.body.OrgID}') `, function (err, recordset) {

      if (err) console.log(err)

      // send records as a response
      res.send(recordset);

    });
  });
});

app.post('/getProductByPOID', jsonParser, function (req, res) {

  sql.connect(config, function (err) {

    if (err) console.log(err);

    // create Request object
    var request = new sql.Request();

    // query to the database and get the records
    request.query(`SELECT *  FROM InwardItems INNER JOIN Products ON InwardItems.ProductID = Products.ProductID
   WHERE (InwardId = '${req.body.InwardId}') `, function (err, recordset) {

      if (err) console.log(err)

      // send records as a response
      res.send(recordset);

    });
  });
});

app.post('/InsertPOTestReport', jsonParser, function (req, res) {
  sql.connect(config, function (err) {
    if (err) throw err;
    console.log("Connected!");
    //Insert a record in the "customers" table:
    var sqlquery = ` INSERT INTO [dbo]. [POTestReport]
      ([InwardId], [VoltageTestReport],[TestReportPhotos],[DischargeTestReport],[DetailReport],[SystemDate], [Batchcode], [ProductID])  

VALUES        ('${req.body.InwardId}','${req.body.UploadDoc1FileName}','${req.body.UploadDoc2FileName}','${req.body.UploadDoc3FileName}','${req.body.UploadDoc4FileName}','${req.body.SystemDate}','${req.body.BatchCode}','${req.body.ProductID}')`;


    var request = new sql.Request();

    request.query(sqlquery, function (err, result) {
      //   if (err) throw err;
      //   console.log("1 record inserted");
      if (!err)
        res.send(result);

      else
        res.send(err);
    });

  });

});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/Uploads/");
  },
  filename: function (req, file, cb) {
    var filename1 = file.originalname;

    //   var datetime1=new Date().toLocaleString();
    // datetime1=datetime1.replace(" ","").replace("/","_").replace("/","_").replace(":","_");
    //filename1=Date.now()+ '_' +filename1.replace('"', '').replace(' ', '').replace(',', '_').replace('/', '_');
    filename1 = Date.now() + '_' + filename1.replace(/[/\\?%*:,|"<>]/g, '').split(" ").join("_")
    cb(null, filename1);
  },
});
const upload = multer({ storage: storage });
app.use(express.static('public'))
app.post("/stats", upload.single("uploaded_file"), function (req, res) {
  console.log("vinit");
  // req.file is the name of your file in the form above, here 'uploaded_file'
  // req.body will hold the text fields, if there were any
  console.log(req.file, req.body);
  res.send(JSON.stringify(req.file.filename));
});
app.post('/deleteBUPaymentById',jsonParser,function(req,res){
  sql.connect(config, function (err) {
      if (err) throw err;
      console.log("Connected!");
       var sqlquery=  `Delete from BUPayment where BUPaymentId = '${req.body.BUPaymentId}'`;
      var request = new sql.Request();          
      request.query(sqlquery,  function(err, result)  {      
      if(!err)   
      res.send(result);  
      else  
      res.send(err);  
      });
    });
});