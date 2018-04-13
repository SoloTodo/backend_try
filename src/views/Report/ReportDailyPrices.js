import React, {Component} from 'react'
import {FormattedMessage} from "react-intl";
import {connect} from "react-redux";
import {
  ApiForm,
  ApiFormChoiceField,
  ApiFormSubmitButton
} from "../../react-utils/api_forms";
import {
  filterApiResourceObjectsByType,
} from "../../react-utils/ApiResource";
import ApiFormTextField from "../../react-utils/api_forms/ApiFormTextField";
import ApiFormDateRangeField from "../../react-utils/api_forms/ApiFormDateRangeField";
import moment from "moment/moment";
import {booleanChoices} from "../../utils";

class ReportDailyPrices extends Component {
  constructor(props) {
    super(props);

    this.state = {
      formValues: {},
      apiFormFieldChangeHandler: undefined,
      downloadLink: undefined
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

  setDownloadLink = json => {
    if (json) {
      window.location = json.payload.url;
      this.setState({
        downloadLink: undefined
      })
    } else {
      this.setState({
        downloadLink: null
      })
    }
  };

  render() {
    const today = moment().startOf('day');
    const todayMinus7Days = moment().startOf('day').subtract(7, 'days');

    return <div className="animated fadeIn d-flex flex-column">
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <i className="glyphicons glyphicons-search">&nbsp;</i>
              <FormattedMessage id="filters" defaultMessage={`Filters`} />
            </div>
            <ApiForm
                endpoints={['reports/daily_prices/']}
                fields={['timestamp', 'category', 'stores', 'countries', 'store_types', 'currency', 'brand', 'exclude_unavailable', 'filename', 'submit']}
                onResultsChange={this.setDownloadLink}
                onFormValueChange={this.handleFormValueChange}
                setFieldChangeHandler={this.setApiFormFieldChangeHandler}
                requiresSubmit={true}
            >
              <div className="card-block">
                <div className="row api-form-filters">
                  <div className="col-12 col-sm-6 col-md-6 col-lg-6 col-xl-6">
                    <label>
                      <FormattedMessage id="date_range_from_to" defaultMessage="Date range (from / to)" />
                    </label>
                    <ApiFormDateRangeField
                        name="timestamp"
                        id="timestamp"
                        label={<FormattedMessage id="date_range_from_to" defaultMessage='Date range (from / to)' />}
                        initial={[todayMinus7Days, today]}
                        value={this.state.formValues.timestamp}
                        onChange={this.state.apiFormFieldChangeHandler}
                    />
                  </div>

                  <div className="col-12 col-sm-6 col-md-6 col-lg-6 col-xl-6">
                    <label>
                      <FormattedMessage id="category" defaultMessage="Category" />
                    </label>
                    <ApiFormChoiceField
                        name="category"
                        required={true}
                        choices={this.props.categories}
                        placeholder={<FormattedMessage id="all_feminine" defaultMessage="All" />}
                        onChange={this.state.apiFormFieldChangeHandler}
                        value={this.state.formValues.category}
                    />
                  </div>

                  <div className="col-12 col-sm-6 col-md-6 col-lg-6 col-xl-6">
                    <label>
                      <FormattedMessage id="currency" defaultMessage="Currency" />
                    </label>
                    <ApiFormChoiceField
                        name="currency"
                        choices={this.props.currencies}
                        placeholder={<FormattedMessage id="dont_convert" defaultMessage="Don't convert" />}
                        onChange={this.state.apiFormFieldChangeHandler}
                        value={this.state.formValues.currency}
                    />
                  </div>

                  <div className="col-12 col-sm-6 col-md-6 col-lg-6 col-xl-6">
                    <label>
                      <FormattedMessage id="stores" defaultMessage='Stores' />
                    </label>
                    <ApiFormChoiceField
                        name="stores"
                        choices={this.props.stores}
                        multiple={true}
                        placeholder={<FormattedMessage id="all_feminine" defaultMessage="All" />}
                        searchable={true}
                        onChange={this.state.apiFormFieldChangeHandler}
                        value={this.state.formValues.stores}
                    />
                  </div>

                  <div className="col-12 col-sm-6 col-md-6 col-lg-6 col-xl-6">
                    <label>
                      <FormattedMessage id="countries" defaultMessage="Countries" />
                    </label>
                    <ApiFormChoiceField
                        name="countries"
                        choices={this.props.countries}
                        multiple={true}
                        placeholder={<FormattedMessage id="all_masculine" defaultMessage="All" />}
                        onChange={this.state.apiFormFieldChangeHandler}
                        value={this.state.formValues.countries}
                    />
                  </div>

                  <div className="col-12 col-sm-6 col-md-6 col-lg-6 col-xl-6">
                    <label>
                      <FormattedMessage id="store_types" defaultMessage="Store types" />
                    </label>
                    <ApiFormChoiceField
                        name="store_types"
                        choices={this.props.store_types}
                        multiple={true}
                        placeholder={<FormattedMessage id="all_masculine" defaultMessage="All" />}
                        onChange={this.state.apiFormFieldChangeHandler}
                        value={this.state.formValues.store_types}
                    />
                  </div>

                  <div className="col-12 col-sm-6 col-md-6 col-lg-6 col-xl-6">
                    <label>
                      <FormattedMessage id="brand" defaultMessage="Marca" />
                    </label>
                    <ApiFormTextField
                        name="brand"
                        placeholder={<FormattedMessage id="optional" defaultMessage="Opcional" />}
                        onChange={this.state.apiFormFieldChangeHandler}
                        debounceTimeout={1}
                    />
                  </div>

                  <div className="col-12 col-sm-6 col-md-6 col-lg-6 col-xl-6">
                    <label>
                      <FormattedMessage id="exclude_unavailable_question" defaultMessage="Exclude unavailable?" />
                    </label>
                    <ApiFormChoiceField
                        name="exclude_unavailable"
                        choices={booleanChoices}
                        required={true}
                        onChange={this.state.apiFormFieldChangeHandler}
                    />
                  </div>

                  <div className="col-12 col-sm-6 col-md-6 col-lg-6 col-xl-6">
                    <label>
                      <FormattedMessage id="filename_optional" defaultMessage="Filename (optional)" />
                    </label>
                    <ApiFormTextField
                        name="filename"
                        placeholder={<FormattedMessage id="optional" defaultMessage="Opcional" />}
                        onChange={this.state.apiFormFieldChangeHandler}
                        debounceTimeout={1}
                    />
                  </div>

                  <div className="col-12 col-sm-7 col-md-6 col-lg-12 col-xl-12 float-right">
                    <label htmlFor="submit">&nbsp;</label>

                    <ApiFormSubmitButton
                        value={this.state.formValues.submit}
                        label={<FormattedMessage id="generate" defaultMessage="Generate" />}
                        loadingLabel={<FormattedMessage id="generating" defaultMessage="Generating" />}
                        onChange={this.state.apiFormFieldChangeHandler}
                        loading={this.state.downloadLink === null}
                    />
                  </div>
                </div>
              </div>
            </ApiForm>
          </div>
        </div>
      </div>

    </div>
  }
}

function mapStateToProps(state) {
  return {
    stores: filterApiResourceObjectsByType(state.apiResourceObjects, 'stores').filter(store => store.permissions.includes('view_store_reports')),
    categories: filterApiResourceObjectsByType(state.apiResourceObjects, 'categories').filter(category => category.permissions.includes('view_category_reports')),
    currencies: filterApiResourceObjectsByType(state.apiResourceObjects, 'currencies'),
    store_types: filterApiResourceObjectsByType(state.apiResourceObjects, 'store_types'),
    countries: filterApiResourceObjectsByType(state.apiResourceObjects, 'countries'),
  }
}

export default connect(mapStateToProps)(ReportDailyPrices);
