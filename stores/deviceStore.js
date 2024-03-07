import { makeObservable, observable, action, set } from "mobx";

class ControllerStore {
  state = 93; //State of all the devices used for the "spedometer" at Danshboard

  constructor() {
    makeObservable(this, {
      state: observable,
      setState: action,
    });
  }

  setState(state) {
    this.state = state;
  }

  get statusText() {
    const state = this.state;
    if (state >= 100) {
      return "Super good";
    } else if (state >= 95) {
      return "Excellent";
    } else if (state >= 90) {
      return "Very good";
    } else if (state >= 85) {
      return "Good";
    } else if (state >= 80) {
      return "Above average";
    } else if (state >= 75) {
      return "Average";
    } else if (state >= 70) {
      return "Fair";
    } else if (state >= 65) {
      return "Below average";
    } else if (state >= 60) {
      return "Poor";
    } else if (state >= 55) {
      return "Very poor";
    } else {
      return "Terrible";
    }
  }
}
const controllerStore = new ControllerStore();
export default controllerStore;
