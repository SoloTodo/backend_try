export const TokenAuth = {
  authenticationToken: false,

  authenticate(email, password, cb) {
    this.isAuthenticated = true;
    setTimeout(cb, 100) // fake async
  },

  signout(cb) {
    this.isAuthenticated = false;
    setTimeout(cb, 100)
  }
};
