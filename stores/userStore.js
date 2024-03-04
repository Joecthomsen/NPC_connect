import { makeObservable, observable, action, set } from "mobx";

class UserStore {
  firstName = "";
  lastName = "";
  email = "";
  password = "";
  confirmPassword = "";
  accessToken = "";
  refreshToken = "";
  signInEmail = "";
  signInPassword = "";
  name = "";

  constructor() {
    makeObservable(this, {
      email: observable,
      setEmail: action,
      firstName: observable,
      setFirstName: action,
      lastName: observable,
      setLastName: action,
      password: observable,
      setPassword: action,
      confirmPassword: observable,
      setConfirmPassword: action,
      accessToken: observable,
      setAccessToken: action,
      refreshToken: observable,
      setRefreshToken: action,
      name: observable,
      setName: action,
    });
  }

  setEmail(email) {
    this.email = email;
  }
  setFirstName(firstName) {
    this.firstName = firstName;
  }
  setLastName(lastName) {
    this.lastName = lastName;
  }
  setPassword(password) {
    this.password = password;
  }
  setConfirmPassword(confirmPassword) {
    this.confirmPassword = confirmPassword;
  }
  setAccessToken(accessToken) {
    this.accessToken = accessToken;
  }
  setRefreshToken(refreshToken) {
    this.refreshToken = refreshToken;
  }
  setName(name) {
    this.name = name;
  }
}

const userStore = new UserStore();
export default userStore;
