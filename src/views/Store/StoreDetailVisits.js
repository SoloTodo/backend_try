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
import {fillTimeLapse} from "../../utils";
import StoreDetailVisitsTimelapse from "./StoreDetailVisitsTimelapse";
import StoreDetailVisitsCategoryPieChart from "./StoreDetailVisitsCategoryPieChart";
import Loading from "../../components/Loading";
import {Link} from "react-router-dom";

class StoreDetailVisits extends Component {
  constructor(props) {
    super(props);

    this.state = {
      formValues: {},
      apiFormFieldChangeHandler: undefined,
      timelapseChartData: undefined,
      pieChartData: undefined,
      entityTableData: undefined,
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
        timelapseChartData: null,
        pieChartData: null,
        entityTableData: null
      });
      return;
    }

    if (bundle.index === 0) {
      // Timelapse chart

      const cleanedResults = bundle.payload.map(datapoint => ({
        date: moment(datapoint.date),
        count: datapoint.count
      }));
      const timelapseChartData = fillTimeLapse(
          cleanedResults,
          bundle.fieldValues.timestamp.startDate,
          bundle.fieldValues.timestamp.endDate,
          'date',
          'count',
          0
      );

      this.setState({
        timelapseChartData
      })
    } else if (bundle.index === 1) {
      // Category pie chart

      const pieChartData = bundle.payload.map(datapoint => ({
        category: this.props.ApiResourceObject(datapoint).category,
        count: datapoint.count
      }));

      this.setState({
        pieChartData
      })
    } else if (bundle.index === 2) {
      const entityTableData = [...bundle.payload];
      entityTableData.sort((a, b) => b.count - a.count)

      this.setState({
        entityTableData: entityTableData
      })
    }
  };

  render() {
    const store = this.props.ApiResourceObject(this.props.apiResourceObject);
    const baseEndpoint = `${settings.apiResourceEndpoints.entity_visits}grouped/?stores=${store.id}&grouping=`;

    const dateRangeInitialMax = moment().startOf('day');
    const dateRangeInitialMin = moment(dateRangeInitialMax).subtract(30, 'days');

    return (
        <div className="animated fadeIn d-flex flex-column">
          <ApiForm
              endpoints={[baseEndpoint + 'date', baseEndpoint + 'category', baseEndpoint + 'entity']}
              fields={['timestamp', 'categories']}
              onResultsChange={this.setResults}
              onFormValueChange={this.handleFormValueChange}
              setFieldChangeHandler={this.setApiFormFieldChangeHandler}>
            <div className="row">
              <div className="col-12">
                <div className="card">
                  <div className="card-header">
                    <FormattedMessage id="filters" defaultMessage={`Filters`} />
                  </div>
                  <div className="card-block">
                    <div className="row api-form-filters">
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
                            searchable={false}
                            value={this.state.formValues.categories}
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
                    <span className="glyphicons glyphicons-pictures">&nbsp;</span>
                    <FormattedMessage id="visits_per_day" defaultMessage='Visits per day'/>
                  </div>
                  <div className="card-block">
                    <StoreDetailVisitsTimelapse
                        startDate={this.state.formValues.timestamp && this.state.formValues.timestamp.startDate}
                        endDate={this.state.formValues.timestamp && this.state.formValues.timestamp.endDate}
                        data={this.state.timelapseChartData}
                    />
                  </div>

                </div>
              </div>
              <div className="col-12">
                <div className="card">
                  <div className="card-header">
                    <span className="glyphicons glyphicons-pictures">&nbsp;</span>
                    <FormattedMessage id="visits_per_category" defaultMessage='Visits per category'/>
                  </div>
                  <div className="card-block">
                    <StoreDetailVisitsCategoryPieChart
                        data={this.state.pieChartData}
                    />
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

function mapStateToProps(state) {
  return {

  }
}

export default injectIntl(connect(
    addApiResourceStateToPropsUtils(mapStateToProps)
)(StoreDetailVisits));
