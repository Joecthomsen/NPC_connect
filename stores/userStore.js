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
      getAccessToken: action,

      refreshToken: observable,
      setRefreshToken: action,
      getRefreshToken: action,
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
  getAccessToken() {
    return this.accessToken;
  }
  setRefreshToken(refreshToken) {
    this.refreshToken = refreshToken;
  }
  getRefreshToken() {
    return this.refreshToken;
  }
  setName(name) {
    // Split the full name into first name and last name
    const [firstName, ...lastNameArray] = name.split(" ");
    const lastName = lastNameArray.join(" "); // Re-join the remaining parts of the name as last name
    this.setFirstName(firstName);
    this.setLastName(lastName);
    this.name = name;
  }
}

const userStore = new UserStore();
export default userStore;
