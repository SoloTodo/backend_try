import React from 'react'
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

class ReportWtb extends React.Component {
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
    return <div className="animated fadeIn d-flex flex-column">
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <i className="glyphicons glyphicons-search">&nbsp;</i>
              <FormattedMessage id="filters" defaultMessage={`Filters`} />
            </div>
            <ApiForm
                endpoints={['reports/wtb_report/']}
                fields={['wtb_brand', 'category', 'stores', 'countries', 'store_types', 'currency', 'submit']}
                onResultsChange={this.setDownloadLink}
                onFormValueChange={this.handleFormValueChange}
                setFieldChangeHandler={this.setApiFormFieldChangeHandler}
                requiresSubmit={true}
            >
              <div className="card-block">
                <div className="row api-form-filters">
                  <div className="col-12 col-sm-6 col-md-6 col-lg-6 col-xl-6">
                    <label>
                      <FormattedMessage id="brand" defaultMessage="Brand" />
                    </label>
                    <ApiFormChoiceField
                        name="wtb_brand"
                        required={true}
                        choices={this.props.wtb_brands}
                        placeholder={<FormattedMessage id="all_feminine" defaultMessage="All" />}
                        onChange={this.state.apiFormFieldChangeHandler}
                        value={this.state.formValues.wtb_brand}
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
  const stores = filterApiResourceObjectsByType(state.apiResourceObjects, 'stores').filter(store => store.permissions.includes('view_store_reports'));
  const countryList = stores.map(store => store.country);
  const countries = filterApiResourceObjectsByType(state.apiResourceObjects, 'countries').filter(country => countryList.includes(country.url));

  return {
    stores,
    categories: filterApiResourceObjectsByType(state.apiResourceObjects, 'categories').filter(category => category.permissions.includes('view_category_reports')),
    currencies: filterApiResourceObjectsByType(state.apiResourceObjects, 'currencies'),
    store_types: filterApiResourceObjectsByType(state.apiResourceObjects, 'store_types'),
    countries,
    wtb_brands: filterApiResourceObjectsByType(state.apiResourceObjects, 'wtb_brands')
  }
}

export default connect(mapStateToProps)(ReportWtb);
