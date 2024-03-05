import { makeObservable, observable, action } from "mobx";

class WifiStore {
  accessPoints = [
    {
      ssid: "",
      bssid: "",
      rssi: "",
      authMode: "",
    },
  ];

  constructor() {
    makeObservable(this, {
      accessPoints: observable,
      addAccessPoint: action,
      getAccessPoints: action,
    });
  }
  addAccessPoint(accessPoint) {
    this.accessPoints.push(accessPoint);
  }

  getAccessPoints() {
    return this.accessPoints;
  }
}

const wifiStore = new WifiStore();
export default wifiStore;
