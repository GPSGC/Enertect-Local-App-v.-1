
const modbus = require('jsmodbus')
const net = require('net')
let sockets = [];
async function run1(i, host, port, slaveId) {
    console.log(`Hello modbus : ${i}`);
    const socket = new net.Socket()
    const options = {
        'host': host,
        'port': port
    }
    const client = new modbus.client.TCP(socket, slaveId, 15000);
    socket.on('error', console.error)
    socket.connect(options)
    socket.on('connect', function () {
        client.readHoldingRegisters(0, 24)
            .then(function (resp) {
                console.log("Thread runnning for : " + slaveId);

                console.log(resp.response._body.valuesAsArray)

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
    const clientArray = [17, 18];
    for (j = 0; j < clientArray.length; j++) {
        console.log(clientArray[j]);
        run1(j, "192.168.0.105", "4002", clientArray[j]);
    }



})()

