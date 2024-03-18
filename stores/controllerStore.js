import { makeObservable, observable, action, set } from "mobx";

class ControllerStore {
  state = 93; //State of all the devices used for the "spedometer" at Danshboard
  selectedController = 0; //Selected controller at Diagnostics
  selectedControlGear = 0;
  addControllerName = ""; //Name of the controller to be added
  controleGears = [];
  controllers = [];

  constructor() {
    makeObservable(this, {
      state: observable,
      setState: action,

      selectedController: observable,
      setSelectedController: action,

      selectedControlGear: observable,
      setSelectedControleGear: action,

      addControllerName: observable,
      setAddControllerName: action,
      getNewControllerName: action,

      controleGears: observable,
      setControleGears: action,
      addControleGear: action,
      getControleGears: action,

      controllers: observable,
      setControllers: action,
      addController: action,
      removeController: action,
      getControllers: action,
      getSelectedController: action,
    });
  }

  setState(state) {
    this.state = state;
  }

  setSelectedController(controller) {
    this.selectedController = controller;
  }

  setSelectedControleGear(gear) {
    this.selectedControlGear = gear;
  }

  setAddControllerName(name) {
    this.addControllerName = name;
  }
  getNewControllerName() {
    return this.addControllerName;
  }
  setControleGears(gears) {
    this.controleGears = gears;
  }
  addControleGear(gear) {
    this.controleGears.push(gear);
  }
  getControleGears() {
    return this.controleGears;
  }
  setControllers(controllers) {
    this.controllers = controllers;
  }
  addController(controller) {
    this.controllers.push(controller);
  }
  removeController(controller) {
    this.controllers.splice(this.controllers.indexOf(controller), 1);
  }
  getControllers() {
    return this.controllers;
  }
  getSelectedController() {
    return this.controllers.at(this.selectedController);
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
