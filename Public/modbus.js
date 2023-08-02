
const modbus = require('jsmodbus')
const net = require('net')

async function run1(i) {
    console.log("Hello11");
    const socket = new net.Socket()
    const options = {
        'host': '10.97.101.202',
        'port': '502'
    }
    const client = new modbus.client.TCP(socket, 17, 15000);
    socket.on('error', console.error)
    socket.connect(options)
    socket.on('connect', function () {
        client.readHoldingRegisters(0, 40)
            .then(function (resp) {
                console.log("Thread" + i);

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


    run1("v");

})()