import { makeObservable, observable, action } from "mobx";

class WifiStore {
  accessPoints = [
    {
      ssid: "",
      bssid: "",
      rssi: "",
      authMode: "",
      channel: "",
    },
  ];
  popID = "";

  constructor() {
    makeObservable(this, {
      accessPoints: observable,
      addAccessPoint: action,
      getAccessPoints: action,
      emptyAccessPoints: action,
      popID: observable,
      setPop_id: action,
      getPop_id: action,
    });
  }
  addAccessPoint(accessPoint) {
    this.accessPoints.push(accessPoint);
  }

  getAccessPoints() {
    return this.accessPoints;
  }

  emptyAccessPoints() {
    this.accessPoints = [];
  }

  setPop_id(popID) {
    this.popID = popID;
  }

  getPop_id() {
    return this.popID;
  }
}

const wifiStore = new WifiStore();
export default wifiStore;
