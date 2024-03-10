import { makeObservable, observable, action } from "mobx";

class WifiStore {
  accessPoints = [];
  popID = "";
  loading = false;

  constructor() {
    makeObservable(this, {
      accessPoints: observable,
      addAccessPoint: action,
      getAccessPoints: action,
      emptyAccessPoints: action,
      popID: observable,
      setPop_id: action,
      getPop_id: action,
      loading: observable,
      setLoading: action,
      getLoading: action,
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
  setLoading(loading) {
    this.loading = loading;
  }
  getLoading() {
    return this.loading;
  }
}

const wifiStore = new WifiStore();
export default wifiStore;
