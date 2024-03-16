import { makeObservable, observable, action } from "mobx";

class WifiStore {
  accessPoints = [];
  popID = "";
  ap_name = "";
  source_ap_name = "";
  source_ap_password = "";
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
      ap_name: observable,
      setAp_name: action,
      getAp_name: action,
      source_ap_name: observable,
      setSource_ap_name: action,
      getSource_ap_name: action,
      source_ap_password: observable,
      setSource_ap_password: action,
      getSource_ap_password: action,
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

  setAp_name(ap_name) {
    this.ap_name = ap_name;
  }

  getAp_name() {
    return this.ap_name;
  }

  setSource_ap_name(source_ap_name) {
    this.source_ap_name = source_ap_name;
  }

  getSource_ap_name() {
    return this.source_ap_name;
  }

  setSource_ap_password(source_ap_password) {
    this.source_ap_password = source_ap_password;
  }
  getSource_ap_password() {
    return this.source_ap_password;
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
