import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { TokenAuth } from './../../../auth/TokenAuth';

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
      emailValid: true,
      passwordValid: true
    }
  }

  handleEmailChange = (event) => {
    this.setState({
      email: event.target.value
    })
  };

  validateEmail = (email) => {
    return Boolean(email.match(/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i))
  };

  validatePassword = (password) => {
    return Boolean(password);
  };

  handlePasswordChange = (event) => {
    this.setState({
      password: event.target.value
    })
  };

  handleEmailBlur = (event) => {
    let emailValid = this.validateEmail(this.state.email);

    this.setState({
      emailValid
    });

    return emailValid;
  };

  handlePasswordBlur = (event) => {
    let passwordValid = this.validatePassword(this.state.password);

    this.setState({
      passwordValid
    });

    return passwordValid;
  };

  formGroupClassName = (validValue, cb) => {
    let result = ['form-group'];
    if (!validValue) {
      result.push('has-danger')
    }
    return result.join(' ')
  };

  handleOnSubmit = (event, cb) => {
    event.preventDefault();

    let emailValid = this.handleEmailBlur();
    let passwordValid = this.handlePasswordBlur();

    if (emailValid && passwordValid) {
      // alert('Mal wn!');
    }
  };

  render() {
    let emailValid = this.state.emailValid;
    let passwordValid = this.state.passwordValid;

    return (
        <div className="app flex-row align-items-center">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-md-8">
                <div className="card-group mb-0">
                  <div className="card p-4">
                    <div className="card-block">
                      <h1>
                        <FormattedMessage id="login" defaultMessage={`Login`} />
                      </h1>
                      <form onSubmit={this.handleOnSubmit}>
                        <p className="text-muted"><FormattedMessage id="sign_in_message" defaultMessage={`Sign In to your account`} /></p>
                        <div className={this.formGroupClassName(emailValid)}>
                          <div className="input-group">
                            <span className="input-group-addon"><i className="icon-user"></i></span>
                            <input type="email" value={this.state.email} onChange={this.handleEmailChange} onBlur={this.handleEmailBlur} className="form-control" placeholder="Email"/>
                          </div>
                          {!emailValid && <div className="form-control-feedback"><FormattedMessage id="login_email_error_message" defaultMessage={`Please enter a valid email`} /></div>}
                        </div>
                        <div className={this.formGroupClassName(passwordValid)}>
                          <div className="input-group">
                            <span className="input-group-addon"><i className="icon-lock"></i></span>
                            <input type="password" value={this.state.password} onChange={this.handlePasswordChange} onBlur={this.handlePasswordBlur} className="form-control" placeholder="Password"/>
                          </div>
                          {!passwordValid && <div className="form-control-feedback"><FormattedMessage id="login_password_error_message" defaultMessage={`Please enter your password`} /></div>}
                        </div>
                        <div className="row">
                          <div className="col-6">
                            <button type="submit" className="btn btn-primary px-4"><FormattedMessage id="login_button" defaultMessage={`Login`} /></button>
                          </div>
                          <div className="col-6 text-right">
                            <button type="button" className="btn btn-link px-0"><FormattedMessage id="forgot_password" defaultMessage={`Forgot password?`} /></button>
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>
                  <div className="card card-inverse card-primary py-5 d-md-down-none" style={{ width: 44 + '%' }}>
                    <div className="card-block text-center">
                      <div>
                        <h2><FormattedMessage id="sign_up_title" defaultMessage={`Sign up`} /></h2>
                        <p><FormattedMessage id="sign_up_message" defaultMessage={`This section is reserved for the staff at SoloTodo`} /></p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
    );
  }
}

export default Login;
