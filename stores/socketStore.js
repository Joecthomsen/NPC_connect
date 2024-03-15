import { makeObservable, observable, action, set } from "mobx";

class SocketStore {
  sockets = [{}];

  constructor() {
    makeObservable(this, {
      sockets: observable,
      addSocket: action,
      getSockets: action,
      emptySockets: action,
      updateSocket: action,
    });
  }

  addSocket(socket) {
    this.sockets.push(socket);
  }
  getSockets() {
    return this.sockets;
  }
  emptySockets() {
    this.sockets = [];
  }
  updateSocket(index, updatedSocket) {
    if (index >= 0 && index < this.sockets.length) {
      this.sockets[index] = updatedSocket;
    } else {
      console.error(`Invalid index ${index} for updating socket.`);
    }
  }
}

const socketStore = new SocketStore();
export default socketStore;
