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

    
    modbusReadGet('192.168.0.101', '502', 17, 3, 35, "Battery Voltage -17")
    modbusReadGet('192.168.0.101', '502', 18, 3, 35, "Battery Voltage -18")  
    modbusReadGet('192.168.0.101', '502', 19, 3, 35, "Battery Voltage -19")  
    modbusReadGet('192.168.0.101', '502', 20, 3, 35, "Battery Voltage -20")      
    
    modbusReadGet('192.168.0.101', '502', 33, 3, 35, "Battery Voltage -33")
    modbusReadGet('192.168.0.101', '502', 34, 3, 35, "Battery Voltage -34")  
    modbusReadGet('192.168.0.101', '502', 35, 3, 35, "Battery Voltage -35")  
    modbusReadGet('192.168.0.101', '502', 36, 3, 35, "Battery Voltage -36") 
    
    modbusReadGet('192.168.0.101', '502', 49, 3, 35, "Battery Voltage -49")
    modbusReadGet('192.168.0.101', '502', 50, 3, 35, "Battery Voltage -50")  
    modbusReadGet('192.168.0.101', '502', 51, 3, 35, "Battery Voltage -51")  
    modbusReadGet('192.168.0.101', '502', 52, 3, 35, "Battery Voltage -52")  
    
    modbusReadGet('192.168.0.101', '502', 65, 3, 35, "Battery Voltage -65")
    modbusReadGet('192.168.0.101', '502', 66, 3, 35, "Battery Voltage -66")  
    modbusReadGet('192.168.0.101', '502', 67, 3, 35, "Battery Voltage -67")  
    modbusReadGet('192.168.0.101', '502', 68, 3, 35, "Battery Voltage -68")  

    // modbusReadGet('192.168.0.201', '502', 81, 3, 35, "Battery Voltage -81")
    // modbusReadGet('192.168.0.201', '502', 82, 3, 35, "Battery Voltage -82")  
    // modbusReadGet('192.168.0.201', '502', 83, 3, 35, "Battery Voltage -83")  
    // modbusReadGet('192.168.0.201', '502', 84, 3, 35, "Battery Voltage -84")      
    
    // modbusReadGet('192.168.0.201', '502', 97, 3, 35, "Battery Voltage -97")
    // modbusReadGet('192.168.0.201', '502', 98, 3, 35, "Battery Voltage -98")  
    // modbusReadGet('192.168.0.201', '502', 99, 3, 35, "Battery Voltage -99")  
    // modbusReadGet('192.168.0.201', '502', 100, 3, 35, "Battery Voltage -100") 
    
    // modbusReadGet('192.168.0.201', '502', 113, 3, 35, "Battery Voltage -113")
    // modbusReadGet('192.168.0.201', '502', 114, 3, 35, "Battery Voltage -114")  
    // modbusReadGet('192.168.0.201', '502', 115, 3, 35, "Battery Voltage -115")  
    // modbusReadGet('192.168.0.201', '502', 116, 3, 35, "Battery Voltage -116")  
    
    // modbusReadGet('192.168.0.201', '502', 129, 3, 35, "Battery Voltage -129")
    // modbusReadGet('192.168.0.201', '502', 130, 3, 35, "Battery Voltage -130")  
    // modbusReadGet('192.168.0.201', '502', 131, 3, 35, "Battery Voltage -131")  
    // modbusReadGet('192.168.0.201', '502', 132, 3, 35, "Battery Voltage -132")  

    modbusReadGet('192.168.0.101', '502', 17, 909, 35, "Battery Temp -17")
    modbusReadGet('192.168.0.101', '502', 18, 909, 35, "Battery Temp -18")  
    modbusReadGet('192.168.0.101', '502', 19, 909, 35, "Battery Temp -19")  
    modbusReadGet('192.168.0.101', '502', 20, 909, 35, "Battery Temp -20")      
    
    modbusReadGet('192.168.0.101', '502', 33, 909, 35, "Battery Temp -33")
    modbusReadGet('192.168.0.101', '502', 34, 909, 35, "Battery Temp -34")  
    modbusReadGet('192.168.0.101', '502', 35, 909, 35, "Battery Temp -35")  
    modbusReadGet('192.168.0.101', '502', 36, 909, 35, "Battery Temp -36") 
    
    modbusReadGet('192.168.0.101', '502', 49, 909, 35, "Battery Temp -49")
    modbusReadGet('192.168.0.101', '502', 50, 909, 35, "Battery Temp -50")  
    modbusReadGet('192.168.0.101', '502', 51, 909, 35, "Battery Temp -51")  
    modbusReadGet('192.168.0.101', '502', 52, 909, 35, "Battery Temp -52")  
    
    modbusReadGet('192.168.0.101', '502', 65, 909, 35, "Battery Temp -65")
    modbusReadGet('192.168.0.101', '502', 66, 909, 35, "Battery Temp -66")  
    modbusReadGet('192.168.0.101', '502', 67, 909, 35, "Battery Temp -67")  
    modbusReadGet('192.168.0.101', '502', 68, 909, 35, "Battery Temp -68") 
})()
