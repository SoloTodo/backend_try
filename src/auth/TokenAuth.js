export const TokenAuth = {
  authenticationToken: null,

  isAuthenticated: () => {
    let token = this.authenticationToken;
    if (!token) {
      token = window.localStorage.getItem('authenticationToken');
      if (token) {
        this.authenticationToken = token;
      }
    }

    return Boolean(token)
  },

  authenticate: (email, password) => {
    let formData = new FormData();

    formData.append('username', email);
    formData.append('password', password);

    return fetch('http://localhost:8000/obtain-auth-token/', {
      method: 'POST',
      body: formData
    })
        .then(response => {
          if (response.ok) {
            return response.json()
          } else {
            return {
              token: null
            }
          }
        })
        .then(json => {
          this.authenticationToken = json.token;
          window.localStorage.setItem('authenticationToken',
              this.authenticationToken)
        })
  },

  signOut: () => {
    this.authenticationToken = null;
    window.localStorage.removeItem('authenticationToken');
  }
};
