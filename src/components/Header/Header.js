import React, { Component } from 'react';
import { Dropdown, DropdownMenu, DropdownItem } from 'reactstrap';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import {settings} from "../../settings";

class Header extends Component {
  constructor(props) {
    super(props);

    this.toggle = this.toggle.bind(this);
    this.state = {
      dropdownOpen: false
    };
  }

  toggle() {
    this.setState({
      dropdownOpen: !this.state.dropdownOpen
    });
  }

  sidebarToggle(e) {
    e.preventDefault();
    document.body.classList.toggle('sidebar-hidden');
  }

  sidebarMinimize(e) {
    e.preventDefault();
    document.body.classList.toggle('sidebar-minimized');
  }

  mobileSidebarToggle(e) {
    e.preventDefault();
    document.body.classList.toggle('sidebar-mobile-show');
  }

  asideToggle(e) {
    e.preventDefault();
    document.body.classList.toggle('aside-menu-hidden');
  }

  handleSignOut = (event) => {
    event.preventDefault();
    this.props.signOut();
  };

  render() {
    const user = this.props.user;

    return (
        <header className="app-header navbar">
          <button className="navbar-toggler mobile-sidebar-toggler d-lg-none" onClick={this.mobileSidebarToggle} type="button">&#9776;</button>
          <a className="navbar-brand" href="">&nbsp;</a>
          <ul className="nav navbar-nav d-md-down-none mr-auto">
            <li className="nav-item">
              <button className="nav-link navbar-toggler sidebar-toggler" type="button" onClick={this.sidebarToggle}>&#9776;</button>
            </li>
          </ul>
          <ul className="nav navbar-nav ml-auto">
            <li className="nav-item dropdown">
              <Dropdown isOpen={this.state.dropdownOpen} toggle={this.toggle}>
                <a onClick={this.toggle} className="nav-link nav-pill avatar" data-toggle="dropdown"  role="button" aria-haspopup="true" aria-expanded={this.state.dropdownOpen} id="account-nav-link">
                  <img src={'img/avatars/default.png'} className="img-avatar" alt={ user.email }/>
                </a>

                <DropdownMenu className="dropdown-menu-right">
                  <DropdownItem header className="text-center"><strong>{ user.email }</strong></DropdownItem>
                  <DropdownItem onClick={this.handleSignOut}><i className="fa fa-lock"/> <FormattedMessage id="header_signout_title" defaultMessage={`Logout`} /></DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </li>
          </ul>
        </header>
    )
  }
}

let mapStateToProps = (state) => {
  return {
    user: state.apiResources[settings.ownUserUrl] || {}
  };
};

let mapDispatchToProps = (dispatch) => {
  return {
    signOut: () => {
      dispatch({
        type: 'setAuthToken',
        authToken: null
      })
    }
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(Header);
