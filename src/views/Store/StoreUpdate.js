import React, { Component } from 'react';
import ReactPaginate from 'react-paginate';
import {connect} from "react-redux";
import {addApiResourceStateToPropsUtils} from "../../ApiResource";
import {FormattedMessage} from "react-intl";
import {settings} from "../../settings";
import Loading from "../../components/Loading";

class StoreUpdate extends Component {
  render() {
    return <h1>Actualizacion tiendas</h1>
  }
}

export default connect(addApiResourceStateToPropsUtils())(StoreUpdate);