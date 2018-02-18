import React, { Component } from 'react';
import {connect} from "react-redux";
import {
  formatCurrency,
} from "../../react-utils/utils";
import {
  apiResourceStateToPropsUtils,
} from "../../react-utils/ApiResource";
import {
  ApiForm,
  ApiFormDateRangeField
} from "../../react-utils/api_forms";
import {FormattedMessage} from "react-intl";
import {settings} from "../../settings";
import Loading from "../../components/Loading";
import moment from "moment";


class UserDetailStaffSummary extends Component {
  constructor(props) {
    super(props);

    this.state = {
      formValues: {},
      apiFormFieldChangeHandler: undefined,
      staffSummary: undefined
    }
  }

  setApiFormFieldChangeHandler = apiFormFieldChangeHandler => {
    this.setState({
      apiFormFieldChangeHandler
    })
  };

  handleFormValueChange = formValues => {
    this.setState({formValues})
  };

  setStaffSummary = json => {
    this.setState({
      staffSummary: json ? json.payload : null
    })
  };

  render() {
    const staffSummary = this.state.staffSummary;

    const user = this.props.apiResourceObject;
    const endpoint = `${settings.apiResourceEndpoints.users}${user.id}/staff_summary/`;

    const clpCurrency = this.props.ApiResourceObject(this.props.clpCurrency);

    const formatClpCurrency = value => formatCurrency(value, clpCurrency, null, '.', ',');

    const dateRangeInitialMax = moment().startOf('day');
    const dateRangeInitialMin = dateRangeInitialMax.clone().subtract(30, 'days');

    return (
        <div className="animated fadeIn">
          <ApiForm
              endpoints={[endpoint]}
              fields={['timestamp']}
              onResultsChange={this.setStaffSummary}
              onFormValueChange={this.handleFormValueChange}
              setFieldChangeHandler={this.setApiFormFieldChangeHandler}
              updateOnLoad={true}
          >
          </ApiForm>

          <div className="row">
            <div className="col-12">
              <div className="card">
                <div className="card-header">
                  <i className="glyphicons glyphicons-search">&nbsp;</i>
                  <FormattedMessage id="filters" defaultMessage="Filters"/>
                </div>
                <div className="card-block">

                  <div className="row api-form-filters">
                    <div className="col-12 col-sm-6">
                      <label id="timestamp_label" htmlFor="timestamp">
                        <FormattedMessage id="date_range_from_to" defaultMessage="Date range (from / to)" />
                      </label>
                      <ApiFormDateRangeField
                          name="timestamp"
                          id="timestamp"
                          initial={[dateRangeInitialMin, dateRangeInitialMax]}
                          value={this.state.formValues.timestamp}
                          onChange={this.state.apiFormFieldChangeHandler}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12">
              <div className="card">
                <div className="card-header">
                  <FormattedMessage id="staff_summary" defaultMessage="Staff summary"/>
                </div>
                <div className="card-block">
                  {staffSummary ?
                      <table className="table">
                        <thead>
                        <tr>
                          <th>
                            <FormattedMessage id="item" defaultMessage="Item"/>
                          </th>
                          <th>
                            <FormattedMessage id="count"
                                              defaultMessage="Count"/>
                          </th>
                          <th>
                            <FormattedMessage id="individual_amount"
                                              defaultMessage="Individual amount"/>
                          </th>
                          <th>
                            <FormattedMessage id="total_amount"
                                              defaultMessage="Total amount"/>
                          </th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                          <td>
                            <FormattedMessage id="associated_entities"
                                              defaultMessage="Associated entities"/>
                          </td>
                          <td>
                            {staffSummary.entities.count}
                          </td>
                          <td>
                            {formatClpCurrency(staffSummary.entities.individual_amount)}
                          </td>
                          <td>
                            {formatClpCurrency(staffSummary.entities.total_amount)}
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <FormattedMessage id="associated_wtb_entities"
                                              defaultMessage="Associated WTB entities"/>
                          </td>
                          <td>
                            {staffSummary.wtb_entities.count}
                          </td>
                          <td>
                            {formatClpCurrency(staffSummary.wtb_entities.individual_amount)}
                          </td>
                          <td>
                            {formatClpCurrency(staffSummary.wtb_entities.total_amount)}
                          </td>
                        </tr>
                        <tr>
                          <td colSpan={4}>
                            <strong><FormattedMessage id="created_products"
                                                      defaultMessage="Created products"/></strong>
                          </td>
                        </tr>
                        {staffSummary.products.map(productEntry => (
                            <tr key={productEntry.tier}>
                              <td>
                                {productEntry.tier}
                              </td>
                              <td>
                                {productEntry.count}
                              </td>
                              <td>
                                {formatClpCurrency(productEntry.individual_amount)}
                              </td>
                              <td>
                                {formatClpCurrency(productEntry.total_amount)}
                              </td>
                            </tr>
                        ))}
                        <tr>
                          <td>
                            <strong>
                              <FormattedMessage id="total"
                                                defaultMessage="Total"/>
                            </strong>
                          </td>
                          <td colSpan={2}>&nbsp;</td>
                          <td>
                            <strong>{formatClpCurrency(staffSummary.total_amount)}</strong>
                          </td>
                        </tr>
                        </tbody>
                      </table>
                      : <Loading />}
                </div>
              </div>
            </div>
          </div>
        </div>)
  }
}

function mapStateToProps(state) {
  const {ApiResourceObject} = apiResourceStateToPropsUtils(state);

  return {
    ApiResourceObject,
    clpCurrency: state.apiResourceObjects[settings.clpCurrencyUrl]
  }
}

export default connect(mapStateToProps)(UserDetailStaffSummary);
