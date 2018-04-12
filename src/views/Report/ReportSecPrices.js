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


class ReportSecPrices extends Component {
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
                endpoints={['reports/sec_prices/']}
                fields={['category', 'stores', 'submit']}
                onResultsChange={this.setDownloadLink}
                onFormValueChange={this.handleFormValueChange}
                setFieldChangeHandler={this.setApiFormFieldChangeHandler}
                requiresSubmit={true}
            >
              <div className="card-block">
                <div className="row api-form-filters">
                  <div className="col-12 col-sm-6">
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

                  <div className="col-12 col-sm-6">
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

                  <div className="col-12 col-sm-6">
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

export default connect(mapStateToProps)(ReportSecPrices);
