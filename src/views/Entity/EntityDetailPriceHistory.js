import React, { Component } from 'react';
import {connect} from "react-redux";
import {
  addApiResourceDispatchToPropsUtils,
  addApiResourceStateToPropsUtils
} from "../../ApiResource";
import {Line} from 'react-chartjs-2';
import {FormattedMessage} from "react-intl";
import {NavLink} from "react-router-dom";
import ReactMarkdown from 'react-markdown';
import Loading from "../../components/Loading";
import {camelize, formatDateStr} from "../../utils";
import messages from "../../messages";
import './EntityDetailPriceHistory.css'


class EntityDetailPriceHistory extends Component {
  constructor(props) {
    super(props);

    this.state = {
      formData: {
        startDate: '2017-08-01',
        endDate: '2017-08-30',
      }
    }
  }

  handleDateChange = event => {
    const field = camelize((event.target.getAttribute('name')));
    console.log(field);

    this.setState({
      formData: {
        ...this.state.formData,
        [field]: event.target.value
      }
    })
  };

  fetchPriceData = () => {
    const entity = this.props.resourceObject;

    // let targetUrl = `${}`;

    this.props.fetchAuth(``)
  };

  componentDidMount() {
  }

  render() {
    return (
        <div className="animated fadeIn">
          <div className="row">
            <div className="col-12">
              <div className="card">
                <div className="card-header"><strong><FormattedMessage id="chart" defaultMessage={`Chart`} /></strong></div>
                <div className="card-block">
                  <div className="row">
                    <div className="col-12 col-sm-4">
                      <div className="form-group">
                        <label htmlFor="start_date">Start date</label>
                        <input type="date" className="form-control" name="start_date" id="start_date"
                               value={this.state.formData.startDate} onChange={this.handleDateChange} />
                      </div>
                    </div>
                    <div className="col-12 col-sm-4">
                      <div className="form-group">
                        <label htmlFor="start_date">End date</label>
                        <input type="date" className="form-control" name="end_date" id="end_date"
                               value={this.state.formData.endDate} onChange={this.handleDateChange} />
                      </div>
                    </div>
                    <div className="col-12 col-sm-4">
                      <div className="form-group">
                        <label className="hidden-xs-down">&nbsp;</label>
                        <button type="button" id="update-button" className="btn btn-primary">Update</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-12">
              <div className="card">
                <div className="card-header"><strong><FormattedMessage id="chart" defaultMessage={`Chart`} /></strong></div>
                <div className="card-block">
                  {/*<Line />*/}
                </div>
              </div>
            </div>
          </div>
        </div>
    )
  }
}

export default connect(
    addApiResourceStateToPropsUtils(),
    addApiResourceDispatchToPropsUtils())(EntityDetailPriceHistory);