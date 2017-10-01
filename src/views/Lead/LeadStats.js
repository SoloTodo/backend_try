import React, {Component} from 'react';
import ApiForm from "../../api_forms/ApiForm";
import {settings} from "../../settings";
import {FormattedMessage, injectIntl} from "react-intl";
import {connect} from "react-redux";
import {addApiResourceStateToPropsUtils} from "../../ApiResource";
import ApiFormDateRangeField from "../../api_forms/ApiFormDateRangeField";
import moment from "moment";
import ApiFormChoiceField from "../../api_forms/ApiFormChoiceField";
import ApiFormSubmitButton from "../../api_forms/ApiFormSubmitButton";
import Loading from "../../components/Loading";
import {Link} from "react-router-dom";
import './LeadStats.css'
import LeadStatsPieChart from "./LeadStatsPieChart";
import LeadStatsTimelapse from "./LeadStatsTimelapse";

class LeadStats extends Component {
  constructor(props) {
    super(props);

    this.state = {
      formValues: {},
      apiFormFieldChangeHandler: undefined,
      leadStats: undefined,
      resultsGrouping: undefined
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

  setResults = (bundle) => {
    if (!bundle) {
      this.setState({
        leadStats: null,
        resultsGrouping: null,
      });
      return;
    }

    this.setState({
      leadStats: bundle.payload,
      resultFormValues: bundle.fieldValues
    })
  };

  render() {
    const dateRangeInitialMax = moment().startOf('day');
    const dateRangeInitialMin = moment(dateRangeInitialMax).subtract(30, 'days');

    const groupingChoices = [
      {
        id: 'category',
        name: <FormattedMessage id="category" defaultMessage="Category"/>,
        ordering: 'count'
      },
      {
        id: 'store',
        name: <FormattedMessage id="store" defaultMessage="Store"/>,
        ordering: 'count'
      },
      {
        id: 'date',
        name: <FormattedMessage id="date" defaultMessage="Date"/>,
        ordering: null
      },
    ];

    let resultComponent = null;
    const resultGrouping = this.state.resultFormValues ? this.state.resultFormValues.grouping.id : null;

    switch (resultGrouping) {
      case 'category':
        resultComponent =
            <LeadStatsPieChart
                data={this.state.leadStats}
                label_field='category'
                label={<FormattedMessage id="category" defaultMessage="Category" />}
            />;
        break;
      case 'store':
        resultComponent =
            <LeadStatsPieChart
                data={this.state.leadStats}
                label_field='store'
                label={<FormattedMessage id="store" defaultMessage="Store" />}
            />;
        break;
      case 'date':
        resultComponent =
            <LeadStatsTimelapse
                startDate={this.state.resultFormValues.timestamp && this.state.resultFormValues.timestamp.startDate}
                endDate={this.state.resultFormValues.timestamp && this.state.resultFormValues.timestamp.endDate}
                data={this.state.leadStats}
            />;
        break;
      default:
        resultComponent = <Loading />
    }

    return (
        <div className="animated fadeIn d-flex flex-column">
          <ApiForm
              endpoints={[settings.apiResourceEndpoints.leads + 'grouped/']}
              fields={['grouping', 'stores', 'timestamp', 'categories']}
              onResultsChange={this.setResults}
              onFormValueChange={this.handleFormValueChange}
              setFieldChangeHandler={this.setApiFormFieldChangeHandler}>
            <div className="row">
              <div className="col-12">
                <div className="card">
                  <div className="card-header">
                    <span className="glyphicons glyphicons-filter">&nbsp;</span>
                    <FormattedMessage id="filters" defaultMessage={`Filters`} />
                  </div>
                  <div className="card-block">
                    <div className="row api-form-filters">
                      <div className="col-12 col-sm-6 col-md-6 col-lg-4 col-xl-4">
                        <label htmlFor="stores">
                          <FormattedMessage id="stores" defaultMessage="Stores" />
                        </label>
                        <ApiFormChoiceField
                            name="stores"
                            id="stores"
                            placeholder={<FormattedMessage id="all_feminine" defaultMessage="All" />}
                            choices={this.props.stores}
                            multiple={true}
                            searchable={true}
                            value={this.state.formValues.stores}
                            onChange={this.state.apiFormFieldChangeHandler}
                        />
                      </div>

                      <div className="col-12 col-sm-6 col-md-6 col-lg-4 col-xl-4">
                        <label htmlFor="categories">
                          <FormattedMessage id="categories" defaultMessage="categories" />
                        </label>
                        <ApiFormChoiceField
                            name="categories"
                            id="categories"
                            placeholder={<FormattedMessage id="all_feminine" defaultMessage="All" />}
                            choices={this.props.categories}
                            multiple={true}
                            searchable={true}
                            value={this.state.formValues.categories}
                            onChange={this.state.apiFormFieldChangeHandler}
                        />
                      </div>

                      <div className="col-12 col-sm-6 col-md-6 col-lg-4 col-xl-4">
                        <label htmlFor="grouping">
                          <FormattedMessage id="grouping" defaultMessage="Grouping" />
                        </label>
                        <ApiFormChoiceField
                            name="grouping"
                            id="grouping"
                            required={true}
                            choices={groupingChoices}
                            value={this.state.formValues.grouping}
                            onChange={this.state.apiFormFieldChangeHandler}
                            additionalApiFields={['ordering']}
                        />
                      </div>

                      <div className="col-12 col-sm-12 col-md-12 col-lg-8 col-xl-6">
                        <label htmlFor="timestamp">
                          <FormattedMessage id="date_range_from_to" defaultMessage="Date range (from / to)" />
                        </label>
                        <ApiFormDateRangeField
                            name="timestamp"
                            id="timestamp"
                            label={<FormattedMessage id="date_range_from_to" defaultMessage='Date range (from / to)' />}
                            initial={[dateRangeInitialMin, dateRangeInitialMax]}
                            value={this.state.formValues.timestamp}
                            onChange={this.state.apiFormFieldChangeHandler}
                        />
                      </div>

                      <div className="col-12 col-sm-6 col-md-4 col-lg-3 col-xl-2">
                        <label className="hidden-xs-down">&nbsp;</label>
                        <ApiFormSubmitButton
                            label={<FormattedMessage id="update" defaultMessage='Update' />}
                            loadingLabel={<FormattedMessage id="updating" defaultMessage='Updating'/>}
                            onChange={this.state.apiFormFieldChangeHandler}
                            loading={this.state.timelapseChartData === null}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-12">
                <div className="card">
                  <div className="card-header">
                    <span className="glyphicons glyphicons-signal">&nbsp;</span>
                    <FormattedMessage id="results" defaultMessage='Results'/>
                  </div>
                  <div className="card-block">
                    <div id="lead-stats-result-container">
                      {resultComponent}
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-12">
                <div className="card">
                  <div className="card-header">
                    <span className="glyphicons glyphicons-pictures">&nbsp;</span>
                    <FormattedMessage id="most_visited_entites" defaultMessage='Most visited entities'/>
                  </div>
                  <div className="card-block">
                    {this.state.entityTableData ? <table className="table table-striped">
                      <thead>
                      <tr>
                        <th><FormattedMessage id="entity" defaultMessage="Entity" /></th>
                        <th><FormattedMessage id="count" defaultMessage="Count" /></th>
                      </tr>
                      </thead>
                      <tbody>
                      {this.state.entityTableData.map(datapoint => (
                          <tr key={datapoint.entity.id}>
                            <td><Link to={'/entities/' + datapoint.entity.id}>{datapoint.entity.name}</Link></td>
                            <td>{datapoint.count}</td>
                          </tr>
                      ))}
                      </tbody>
                    </table> : <Loading />}
                  </div>
                </div>
              </div>
            </div>
          </ApiForm>
        </div>
    )
  }
}

export default injectIntl(connect(
    addApiResourceStateToPropsUtils()
)(LeadStats));
