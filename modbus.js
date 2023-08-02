
const modbus = require('jsmodbus')
const net = require('net')

async function run1(i) {
    console.log("Hello11");
    const allValues = []; 
    const socket = new net.Socket()
    const options = {
        'host': '192.168.0.105',
        'port': '4002'
  }
  
  
    const client = new modbus.client.TCP(socket, i, 15000);
    socket.on('error', console.error)
    socket.connect(options)
    socket.on('connect', function () {
        client.readHoldingRegisters(0, 24)
            .then(function (resp) {
                console.log("Thread" + i);

                console.log(resp.response._body.valuesAsArray)
                
                // // allValues.push(resp.response._body.valuesAsArray)
                // // console.log(resp.response._body.valuesAsArray.length)
                // for (i=0; i<resp.response._body.valuesAsArray.length; i++) {
                //     //console.log("1 row inserted")
                     
                //     //*********************************Add in DB*****************************************
                //     var myHeaders = new Headers();
                //     myHeaders.append("Content-Type", "application/json");
                    
                //     var raw = JSON.stringify({
                //         "No": parseInt(i+1),
                //       "Value": parseInt(resp.response._body.valuesAsArray[i])
                //     });
                    
                //     var requestOptions = {
                //       method: 'POST',
                //       headers: myHeaders,
                //       body: raw,
                //       redirect: 'follow'
                //     };
                    
                //     fetch("http://localhost:2000/insertInTable", requestOptions)
                //       .then(response => response.text())
                //       .then(result => console.log(result))
                //       .catch(error => console.log('error', error));
                //     //********************************************************************************************
                //   }
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


    run1("17");

})()

// var express = require('express');
// var app = express();
// var sql = require("mssql");
// const port=2000
// var bodyParser = require('body-parser')
// var jsonParser = bodyParser.json()
// app.use(express.static("public"));
// // config for your database
// var config = {  
//     // user: 'sa1',  
//     // password: 'sa1',  
//     // server: "114.79.133.18",  
//     // database: "Modbus",
//     // port:4123,
//     user: "nodeIndus2020",
//     password: "nodeIndus2020",
//     database: "GPSIndus2022",
//     server: '114.79.133.104',
//     parseJSON: true,
//     options: {
//         encrypt: false, // for azure
//         trustServerCertificate: false // change to true for local dev / self-signed certs
//       }
//     }  ;
//     app.get('/', function (req, res) {
//         // connect to your database
//        sql.connect(config, function (err) {
       
//            if (err) console.log(err);
         
//             //res.send("Hello World");
//        });
//    });
//    var server = app.listen(2000, function () {
//     console.log(`Server is running ${port}`);
// });

// app.post('/insertInTable',jsonParser,function(req,res){
//     sql.connect(config, function (err) {
//         if (err) throw err;
//         console.log("Connected!");
//          var sqlquery=`INSERT INTO ModbusRegisterValue (BatteryNo,Value) VALUES ('${req.body.No}','${req.body.Value}')`;
//         var request = new sql.Request();
        
//            request.query(sqlquery, function (err, result) {
//           if(!err)   
//         res.send(result);  
//         else  
//         res.send(err);  
//         });
//       });
    
// });
