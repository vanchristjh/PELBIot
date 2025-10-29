/**
 * Serial Port Communication Service
 * Untuk koneksi dengan Arduino, PLC, atau device serial lainnya
 */

class SerialConnectionService {
  constructor() {
    this.port = null;
    this.parser = null;
    this.isConnected = false;
    this.connectionConfig = null;
    this.serialPort = null;

    // Try to import serialport
    try {
      const SerialPort = require('serialport');
      const { ReadlineParser } = require('@serialport/parser-readline');
      this.SerialPort = SerialPort;
      this.ReadlineParser = ReadlineParser;
      console.log('✅ SerialPort library loaded');
    } catch (error) {
      console.warn('⚠️  serialport not installed. Run: npm install serialport');
    }
  }

  /**
   * Connect ke serial port
   */
  async connect(portName, options = {}) {
    if (!this.SerialPort) {
      throw new Error('SerialPort library not installed');
    }

    try {
      const defaultOptions = {
        baudRate: options.baudRate || 9600,
        dataBits: options.dataBits || 8,
        stopBits: options.stopBits || 1,
        parity: options.parity || 'none',
        ...options
      };

      console.log(`🔌 Opening serial port: ${portName}`);
      console.log(`   Options:`, defaultOptions);

      // Create port instance
      this.port = new this.SerialPort.SerialPort({
        path: portName,
        ...defaultOptions,
        autoOpen: false
      });

      // Setup error handler
      this.port.on('error', (error) => {
        console.error('❌ Serial Port Error:', error.message);
        this.isConnected = false;
      });

      // Setup close handler
      this.port.on('close', () => {
        console.log('⚠️  Serial port closed');
        this.isConnected = false;
      });

      // Open port
      await new Promise((resolve, reject) => {
        this.port.open((error) => {
          if (error) {
            this.isConnected = false;
            reject(error);
          } else {
            this.isConnected = true;
            this.connectionConfig = { port: portName, ...defaultOptions };
            console.log(`✅ Serial port opened: ${portName}`);
            resolve();
          }
        });
      });

      // Setup parser untuk line-based protocol
      if (this.ReadlineParser) {
        this.parser = this.port.pipe(
          new this.ReadlineParser({ delimiter: '\n' })
        );

        this.parser.on('data', (line) => {
          this._onDataReceived(line);
        });
      }

      return true;
    } catch (error) {
      console.error('❌ Connection failed:', error.message);
      this.isConnected = false;
      throw error;
    }
  }

  /**
   * Send data ke serial port
   */
  async send(data) {
    if (!this.isConnected || !this.port) {
      throw new Error('Serial port not connected');
    }

    return new Promise((resolve, reject) => {
      const dataToSend = typeof data === 'string' ? data + '\n' : data;

      this.port.write(dataToSend, (error) => {
        if (error) {
          console.error('❌ Write error:', error.message);
          reject(error);
        } else {
          console.log(`✅ Sent: ${data}`);
          resolve();
        }
      });
    });
  }

  /**
   * Send JSON data
   */
  async sendJSON(jsonData) {
    const jsonString = JSON.stringify(jsonData);
    return this.send(jsonString);
  }

  /**
   * Listen untuk incoming data
   */
  onData(callback) {
    this.dataCallback = callback;
  }

  /**
   * Internal handler untuk data received
   */
  _onDataReceived(line) {
    try {
      console.log(`📨 Serial data received: ${line}`);

      // Try parse sebagai JSON
      let data;
      try {
        data = JSON.parse(line);
      } catch {
        // Jika bukan JSON, treat sebagai string
        data = { raw: line };
      }

      // Emit callback
      if (this.dataCallback) {
        this.dataCallback(data);
      }
    } catch (error) {
      console.error('Error processing serial data:', error.message);
    }
  }

  /**
   * List available serial ports
   */
  static async listPorts() {
    try {
      const SerialPort = require('serialport');
      const ports = await SerialPort.SerialPort.list();

      console.log('Available serial ports:');
      ports.forEach(port => {
        console.log(`  - ${port.path} (${port.manufacturer || 'Unknown'})`);
      });

      return ports;
    } catch (error) {
      console.warn('Could not list serial ports:', error.message);
      return [];
    }
  }

  /**
   * Disconnect
   */
  async disconnect() {
    if (this.port && this.isConnected) {
      return new Promise((resolve, reject) => {
        this.port.close((error) => {
          if (error) {
            console.error('Error closing port:', error);
            reject(error);
          } else {
            this.isConnected = false;
            console.log('✅ Serial port disconnected');
            resolve();
          }
        });
      });
    }
  }

  /**
   * Get connection status
   */
  getStatus() {
    return {
      isConnected: this.isConnected,
      config: this.connectionConfig,
      isOpen: this.port?.isOpen || false
    };
  }

  /**
   * Send command dan tunggu response
   */
  async sendCommand(command, timeout = 5000) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error('Command timeout'));
      }, timeout);

      const originalCallback = this.dataCallback;
      
      this.dataCallback = (data) => {
        clearTimeout(timer);
        this.dataCallback = originalCallback;
        resolve(data);
      };

      this.send(command).catch(reject);
    });
  }

  /**
   * Read dari serial port dengan polling
   */
  async readAsync(timeout = 5000) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error('Read timeout'));
      }, timeout);

      const originalCallback = this.dataCallback;
      
      this.dataCallback = (data) => {
        clearTimeout(timer);
        this.dataCallback = originalCallback;
        resolve(data);
      };
    });
  }
}

export default SerialConnectionService;
