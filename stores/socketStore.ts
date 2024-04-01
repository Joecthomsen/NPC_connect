import { makeObservable, observable, action, set } from "mobx";
import TcpSocket from "react-native-tcp-socket";


type SocketType = {
  popID: string;
  client: TcpSocket.Socket;
}


class SocketStore {
  sockets:SocketType[] = [];

  constructor() {
    makeObservable(this, {
      sockets: observable,
      addSocket: action,
      getSockets: action,
      emptySockets: action,
      updateSocket: action,
    });
  }

  addSocket(socket: SocketType) {
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
