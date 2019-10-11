import React, { Component } from 'react';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import {settings} from "../../settings";

class Header extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dropdownOpen: false
    };
  }

  toggle = () => {
    this.setState({
      dropdownOpen: !this.state.dropdownOpen
    });
  };

  sidebarToggle(e) {
    e.preventDefault();
    document.body.classList.toggle('sidebar-hidden');
  }

  mobileSidebarToggle(e) {
    e.preventDefault();
    document.body.classList.toggle('sidebar-mobile-show');
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
        <a className="navbar-brand" href="/">&nbsp;</a>
        <ul className="nav navbar-nav d-md-down-none mr-auto">
          <li className="nav-item">
            <button className="nav-link navbar-toggler sidebar-toggler" type="button" onClick={this.sidebarToggle}>&#9776;</button>
          </li>
        </ul>
        <ul className="nav navbar-nav ml-auto">
          <li className="nav-item dropdown">
            <Dropdown isOpen={this.state.dropdownOpen} toggle={this.toggle}>
              <DropdownToggle onClick={this.toggle} className="nav-link mr-3" data-toggle="dropdown" role="button" aria-haspopup={true} aria-expanded={this.state.dropdownOpen}>
                {user.first_name} {user.last_name}
              </DropdownToggle>
              <DropdownMenu className="mr-0">
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
    user: state.apiResourceObjects[settings.ownUserUrl] || {}
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
