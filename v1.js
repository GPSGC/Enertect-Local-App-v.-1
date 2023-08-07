const modbus = require('jsmodbus')
const net = require('net');

async function modbusReadGet(ipModbusServer, portModbusServer, bankDeviceId, registerStartInteger, registerNumberReadInteger, displayName) {

    const socket = new net.Socket()
    const client = new modbus.client.TCP(socket, bankDeviceId, 15000);
    socket.on('error', console.error)
    socket.connect({ 'host': ipModbusServer, 'port': portModbusServer })
    socket.on('connect', function () {
        client.readHoldingRegisters(registerStartInteger, registerNumberReadInteger)
            .then(function (resp) {
                console.log(displayName);
                console.log(resp.response._body.valuesAsArray);
                socket.end()

            }).catch(function (err) {
                console.log(err);
                socket.end()
            })
    })
}

(async () => {

    
    modbusReadGet('192.168.0.101', '4002', 17, 03, 35, "Battery Voltage -17")
    modbusReadGet('192.168.0.101', '4002', 18, 03, 35, "Battery Voltage -18")  
    modbusReadGet('192.168.0.101', '4002', 19, 03, 35, "Battery Voltage -19")  
    modbusReadGet('192.168.0.101', '4002', 20, 03, 35, "Battery Voltage -20")      
    
    modbusReadGet('192.168.0.101', '4002', 33, 03, 35, "Battery Voltage -33")
    modbusReadGet('192.168.0.101', '4002', 34, 03, 35, "Battery Voltage -34")  
    modbusReadGet('192.168.0.101', '4002', 35, 03, 35, "Battery Voltage -35")  
    modbusReadGet('192.168.0.101', '4002', 36, 03, 35, "Battery Voltage -36") 
    
    modbusReadGet('192.168.0.101', '4002', 49, 03, 35, "Battery Voltage -49")
    modbusReadGet('192.168.0.101', '4002', 50, 03, 35, "Battery Voltage -50")  
    modbusReadGet('192.168.0.101', '4002', 51, 03, 35, "Battery Voltage -51")  
    modbusReadGet('192.168.0.101', '4002', 52, 03, 35, "Battery Voltage -52")  
    
    modbusReadGet('192.168.0.101', '4002', 65, 03, 35, "Battery Voltage -65")
    modbusReadGet('192.168.0.101', '4002', 66, 03, 35, "Battery Voltage -66")  
    modbusReadGet('192.168.0.101', '4002', 67, 03, 35, "Battery Voltage -67")  
    modbusReadGet('192.168.0.101', '4002', 68, 03, 35, "Battery Voltage -68")  

    modbusReadGet('192.168.0.201', '4002', 81, 03, 35, "Battery Voltage -81")
    modbusReadGet('192.168.0.201', '4002', 82, 03, 35, "Battery Voltage -82")  
    modbusReadGet('192.168.0.201', '4002', 83, 03, 35, "Battery Voltage -83")  
    modbusReadGet('192.168.0.201', '4002', 84, 03, 35, "Battery Voltage -84")      
    
    modbusReadGet('192.168.0.201', '4002', 97, 03, 35, "Battery Voltage -97")
    modbusReadGet('192.168.0.201', '4002', 98, 03, 35, "Battery Voltage -98")  
    modbusReadGet('192.168.0.201', '4002', 99, 03, 35, "Battery Voltage -99")  
    modbusReadGet('192.168.0.201', '4002', 100, 03, 35, "Battery Voltage -100") 
    
    modbusReadGet('192.168.0.201', '4002', 113, 03, 35, "Battery Voltage -113")
    modbusReadGet('192.168.0.201', '4002', 114, 03, 35, "Battery Voltage -114")  
    modbusReadGet('192.168.0.201', '4002', 115, 03, 35, "Battery Voltage -115")  
    modbusReadGet('192.168.0.201', '4002', 116, 03, 35, "Battery Voltage -116")  
    
    modbusReadGet('192.168.0.201', '4002', 129, 03, 35, "Battery Voltage -129")
    modbusReadGet('192.168.0.201', '4002', 130, 03, 35, "Battery Voltage -130")  
    modbusReadGet('192.168.0.201', '4002', 131, 03, 35, "Battery Voltage -131")  
    modbusReadGet('192.168.0.201', '4002', 132, 03, 35, "Battery Voltage -132")  
})()
