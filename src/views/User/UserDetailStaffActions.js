import React, { Component } from 'react';
import {connect} from "react-redux";
import {
  addApiResourceStateToPropsUtils,
} from "../../react-utils/ApiResource";
import {
  ApiForm,
  ApiFormDateRangeField,
  ApiFormSubmitButton,
} from "../../react-utils/api_forms";
import {FormattedMessage} from "react-intl";
import {settings} from "../../settings";
import moment from "moment";
import {NavLink} from "react-router-dom";


class UserDetailStaffActions extends Component {
  constructor(props) {
    super(props);

    this.state = {
      formValues: {},
      apiFormFieldChangeHandler: undefined,
      staffActions: undefined
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

  setStaffActions = json => {
    this.setState({
      staffActions: json ? json.payload : null
    })
  };

  render() {
    const staffActions = this.state.staffActions;

    const user = this.props.apiResourceObject;
    const endpoint = `${settings.apiResourceEndpoints.users}${user.id}/staff_actions/`;

    const dateRangeInitialMax = moment().startOf('day');
    const dateRangeInitialMin = dateRangeInitialMax.clone().subtract(7, 'days');

    return (
        <div className="animated fadeIn">
          <ApiForm
              endpoints={[endpoint]}
              fields={['timestamp']}
              onResultsChange={this.setStaffActions}
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
                    <div className="col-12 col-sm-6">
                        <label htmlFor="submit">&nbsp;</label>
                        <ApiFormSubmitButton
                            label={<FormattedMessage id="update" defaultMessage='Update' />}
                            loadingLabel={<FormattedMessage id="updating" defaultMessage='Updating'/>}
                            onChange={this.state.apiFormFieldChangeHandler}
                            loading={this.state.staffActions === null}
                        />
                      </div>
                  </div>
                </div>
              </div>
            </div>

            {staffActions &&
              <div className="col-12">
                <div className="card">
                  <div className="card-header">
                    <FormattedMessage id="handled_entities"
                                      defaultMessage="Handled entities"/>
                  </div>
                  <div className="card-block">
                    <table className="table">
                      <thead>
                      <tr>
                        <th><FormattedMessage id="entity" defaultMessage="Entity" /></th>
                        <th><FormattedMessage id="date" defaultMessage="Date" /></th>
                      </tr>
                      </thead>
                      <tbody>
                        {staffActions.entities.map(entry => (
                          <tr key={entry.id}>
                            <td><NavLink to={`/entities/` + entry.entity_id}>{entry.name}</NavLink></td>
                            <td>{moment(entry.date).format('llll')}</td>
                          </tr>
                      ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            }

            {staffActions &&
              <div className="col-12">
                <div className="card">
                  <div className="card-header">
                    <FormattedMessage id="created_products"
                                      defaultMessage="Created products"/>
                  </div>
                  <div className="card-block">
                    <table className="table">
                      <thead>
                      <tr>
                        <th><FormattedMessage id="product" defaultMessage="Product" /></th>
                        <th><FormattedMessage id="date" defaultMessage="Date" /></th>
                      </tr>
                      </thead>
                      <tbody>
                        {staffActions.products.map(entry => (
                          <tr key={entry.id}>
                            <td><NavLink to={`/products/` + entry.id}>{entry.name}</NavLink></td>
                            <td>{moment(entry.date).format('llll')}</td>
                          </tr>
                      ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            }

            {staffActions &&
              <div className="col-12">
                <div className="card">
                  <div className="card-header">
                    <FormattedMessage id="associated_wtb_entities"
                                      defaultMessage="Associated WTB entities"/>
                  </div>
                  <div className="card-block">
                    <table className="table">
                      <thead>
                      <tr>
                        <th><FormattedMessage id="wtb_entity" defaultMessage="WTB Entity" /></th>
                        <th><FormattedMessage id="date" defaultMessage="Date" /></th>
                      </tr>
                      </thead>
                      <tbody>
                        {staffActions.wtb_entities.map(entry => (
                          <tr key={entry.id}>
                            <td><NavLink to={`/wtb/entities/` + entry.id}>{entry.name}</NavLink></td>
                            <td>{moment(entry.date).format('llll')}</td>
                          </tr>
                      ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>)
  }
}

export default connect(addApiResourceStateToPropsUtils())(UserDetailStaffActions);