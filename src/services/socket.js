import io from 'socket.io-client';

const socketService = {
  socket: null,

  connect() {
    this.socket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:3001');
    return this.socket;
  },

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  },

  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  },

  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  },

  emit(event, data) {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  },

  isConnected() {
    return this.socket && this.socket.connected;
  }
};

// Auto-connect on import
if (!socketService.socket) {
  socketService.connect();
}

export default socketService;
