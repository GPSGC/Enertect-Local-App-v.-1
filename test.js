
const modbus = require('jsmodbus')
const net = require('net')
let sockets = []; 
async function run1(i,host,port ) {
    console.log(`Hello modbus : ${i}`);
     const socket = new net.Socket()
    const options = {
        'host': host,
        'port': port
    }
      
    let client = new modbus.client.TCP(socket,17, 15000);
    const clientArray = [17 ];
        for (j = 0; j < clientArray.length; j++) {
             console.log(clientArray[j]);
             
            
             runrun( client,j);
        }
    socket.on('error', console.error)
    socket.connect(options)
    socket.on('connect', function () {
        console.log("Connected");
        const clientArray = [17 ];
        for (j = 0; j < clientArray.length; j++) {
             console.log(clientArray[j]);
             
            
             runrun( client,j);
        }
        socket.end();
    })
    // const clientArray = [17, 18];
    // for (j = 0; j < clientArray.length; j++) {
    //     console.log(clientArray[j]);
        
    //     runClient(socket,options,clientArray[j]);
        
    // }
    // runClient( socket,options,17);
    // await sleep(5000);
    //  runClient( socket,options,18);
      
}

async function runrun( c,i) {
    try {
 
      var ress = await c.readHoldingRegisters(0, 20)
      console.log(`This is ${i}`);
      console.log(ress.response._body.valuesAsArray);
      console.log("end en d");
    } catch (err) { console.log(err) }
  }
  
async function runClient( socket,options,slaveId) {
    
    const client = new modbus.client.TCP(socket, slaveId,  5000);
    socket.on('error', console.error)
    socket.connect(options)
    socket.on('connect', function () {
        client.readHoldingRegisters(0, 24)
            .then(function (resp) {
                console.log("Thread runnning for : " + slaveId);

                console.log(resp.response._body.valuesAsArray)
             
               // socket.end()
            }).catch(function () {
                console.error(require('util').inspect(arguments, {
                    depth: null
                }))
                socket.end()
            })
    })
}
function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }
//@main
(async () => {
 
    run1("v","192.168.0.106","4002");

})()

 