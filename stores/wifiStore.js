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

  constructor() {
    makeObservable(this, {
      accessPoints: observable,
      addAccessPoint: action,
      getAccessPoints: action,
      emptyAccessPoints: action,
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
}

const wifiStore = new WifiStore();
export default wifiStore;
