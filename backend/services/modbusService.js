/**
 * Modbus RTU/TCP Connection Service
 * Wrapper untuk modbus-serial library
 */

class ModbusConnectionService {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.connectionConfig = null;
    this.modbusSerial = null;
    
    // Try to import modbus-serial
    try {
      this.modbusSerial = require('modbus-serial');
      console.log('✅ Modbus-serial library loaded');
    } catch (error) {
      console.warn('⚠️  modbus-serial not installed. Run: npm install modbus-serial');
    }
  }

  /**
   * Connect via TCP
   */
  async connectTCP(host, port = 502, timeout = 5000) {
    if (!this.modbusSerial) {
      throw new Error('Modbus-serial library not installed');
    }

    try {
      console.log(`🔌 Connecting to Modbus TCP: ${host}:${port}`);

      this.client = new this.modbusSerial.client.TCP(undefined, { socket: undefined });
      
      await new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          reject(new Error('Connection timeout'));
        }, timeout);

        this.client.connectTCP(host, { port }, () => {
          clearTimeout(timer);
          console.log(`✅ Connected to Modbus TCP ${host}:${port}`);
          this.isConnected = true;
          this.connectionConfig = { type: 'tcp', host, port };
          resolve();
        });

        this.client.on('error', (error) => {
          clearTimeout(timer);
          this.isConnected = false;
          reject(error);
        });
      });

      return true;
    } catch (error) {
      console.error('❌ TCP Connection failed:', error.message);
      this.isConnected = false;
      throw error;
    }
  }

  /**
   * Connect via Serial RTU
   */
  async connectRTU(port, options = {}) {
    if (!this.modbusSerial) {
      throw new Error('Modbus-serial library not installed');
    }

    try {
      const defaultOptions = {
        baudRate: 9600,
        dataBits: 8,
        stopBits: 1,
        parity: 'none',
        ...options
      };

      console.log(`🔌 Connecting to Modbus RTU: ${port}`);
      console.log(`   Options:`, defaultOptions);

      this.client = new this.modbusSerial();
      
      await new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          reject(new Error('Connection timeout'));
        }, 5000);

        this.client.connectRTUBuffered(port, defaultOptions, () => {
          clearTimeout(timer);
          console.log(`✅ Connected to Modbus RTU ${port}`);
          this.isConnected = true;
          this.connectionConfig = { type: 'rtu', port, ...defaultOptions };
          resolve();
        });

        this.client.on('error', (error) => {
          clearTimeout(timer);
          this.isConnected = false;
          reject(error);
        });
      });

      return true;
    } catch (error) {
      console.error('❌ RTU Connection failed:', error.message);
      this.isConnected = false;
      throw error;
    }
  }

  /**
   * Read holding registers
   */
  async readHoldingRegisters(unitId, address, quantity) {
    if (!this.isConnected || !this.client) {
      throw new Error('Not connected to Modbus');
    }

    try {
      // Set unit id (slave id)
      this.client.setID(unitId);

      // Read holding registers (function code 03)
      const data = await new Promise((resolve, reject) => {
        this.client.readHoldingRegisters(address, quantity, (error, data) => {
          if (error) reject(error);
          else resolve(data);
        });
      });

      console.log(`✅ Read ${quantity} registers from address ${address}: ${JSON.stringify(data)}`);
      return data.data || data;
    } catch (error) {
      console.error('❌ Read registers failed:', error.message);
      throw error;
    }
  }

  /**
   * Read input registers
   */
  async readInputRegisters(unitId, address, quantity) {
    if (!this.isConnected || !this.client) {
      throw new Error('Not connected to Modbus');
    }

    try {
      this.client.setID(unitId);

      const data = await new Promise((resolve, reject) => {
        // Function code 04
        this.client.readInputRegisters(address, quantity, (error, data) => {
          if (error) reject(error);
          else resolve(data);
        });
      });

      return data.data || data;
    } catch (error) {
      console.error('❌ Read input registers failed:', error.message);
      throw error;
    }
  }

  /**
   * Read coils
   */
  async readCoils(unitId, address, quantity) {
    if (!this.isConnected || !this.client) {
      throw new Error('Not connected to Modbus');
    }

    try {
      this.client.setID(unitId);

      const data = await new Promise((resolve, reject) => {
        // Function code 01
        this.client.readCoils(address, quantity, (error, data) => {
          if (error) reject(error);
          else resolve(data);
        });
      });

      return data.data || data;
    } catch (error) {
      console.error('❌ Read coils failed:', error.message);
      throw error;
    }
  }

  /**
   * Write single register
   */
  async writeSingleRegister(unitId, address, value) {
    if (!this.isConnected || !this.client) {
      throw new Error('Not connected to Modbus');
    }

    try {
      this.client.setID(unitId);

      await new Promise((resolve, reject) => {
        // Function code 06
        this.client.writeRegister(address, value, (error) => {
          if (error) reject(error);
          else resolve();
        });
      });

      console.log(`✅ Wrote value ${value} to register ${address}`);
      return true;
    } catch (error) {
      console.error('❌ Write register failed:', error.message);
      throw error;
    }
  }

  /**
   * Write multiple registers
   */
  async writeMultipleRegisters(unitId, address, values) {
    if (!this.isConnected || !this.client) {
      throw new Error('Not connected to Modbus');
    }

    try {
      this.client.setID(unitId);

      await new Promise((resolve, reject) => {
        // Function code 16
        this.client.writeRegisters(address, values, (error) => {
          if (error) reject(error);
          else resolve();
        });
      });

      console.log(`✅ Wrote ${values.length} registers starting at address ${address}`);
      return true;
    } catch (error) {
      console.error('❌ Write multiple registers failed:', error.message);
      throw error;
    }
  }

  /**
   * Write single coil
   */
  async writeSingleCoil(unitId, address, value) {
    if (!this.isConnected || !this.client) {
      throw new Error('Not connected to Modbus');
    }

    try {
      this.client.setID(unitId);

      await new Promise((resolve, reject) => {
        // Function code 05
        this.client.writeCoil(address, value, (error) => {
          if (error) reject(error);
          else resolve();
        });
      });

      console.log(`✅ Wrote coil ${value} to address ${address}`);
      return true;
    } catch (error) {
      console.error('❌ Write coil failed:', error.message);
      throw error;
    }
  }

  /**
   * Write multiple coils
   */
  async writeMultipleCoils(unitId, address, values) {
    if (!this.isConnected || !this.client) {
      throw new Error('Not connected to Modbus');
    }

    try {
      this.client.setID(unitId);

      await new Promise((resolve, reject) => {
        // Function code 15
        this.client.writeCoils(address, values, (error) => {
          if (error) reject(error);
          else resolve();
        });
      });

      console.log(`✅ Wrote ${values.length} coils starting at address ${address}`);
      return true;
    } catch (error) {
      console.error('❌ Write multiple coils failed:', error.message);
      throw error;
    }
  }

  /**
   * Convert float value to modbus registers
   */
  static floatToRegisters(value) {
    // IEEE 754 float to modbus registers
    const buffer = Buffer.allocUnsafe(4);
    buffer.writeFloatBE(value, 0);
    return [buffer.readUInt16BE(0), buffer.readUInt16BE(2)];
  }

  /**
   * Convert modbus registers to float
   */
  static registersToFloat(registers) {
    const buffer = Buffer.allocUnsafe(4);
    buffer.writeUInt16BE(registers[0], 0);
    buffer.writeUInt16BE(registers[1], 2);
    return buffer.readFloatBE(0);
  }

  /**
   * Disconnect
   */
  async disconnect() {
    if (this.client) {
      this.client.close();
      this.isConnected = false;
      console.log('✅ Modbus disconnected');
    }
  }

  /**
   * Get connection status
   */
  getStatus() {
    return {
      isConnected: this.isConnected,
      config: this.connectionConfig,
      type: this.connectionConfig?.type || 'unknown'
    };
  }
}

export default ModbusConnectionService;
