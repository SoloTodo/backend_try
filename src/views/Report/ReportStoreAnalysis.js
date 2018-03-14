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

class ReportStoreAnalysis extends Component {
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
    const priceTypeChoices = [
      {
        id: 'offer_price',
        name: <FormattedMessage id="offer_price" defaultMessage="Offer price"/>
      },
      {
        id: 'normal_price',
        name: <FormattedMessage id="normal_price" defaultMessage="Normal price"/>
      }
    ];

    return <div className="animated fadeIn d-flex flex-column">
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <i className="glyphicons glyphicons-search">&nbsp;</i>
              <FormattedMessage id="filters" defaultMessage={`Filters`} />
            </div>
            <ApiForm
                endpoints={['reports/store_analysis/']}
                fields={['store', 'competing_stores', 'categories', 'price_type', 'submit']}
                onResultsChange={this.setDownloadLink}
                onFormValueChange={this.handleFormValueChange}
                setFieldChangeHandler={this.setApiFormFieldChangeHandler}
                requiresSubmit={true}
            >
              <div className="card-block">
                <div className="row api-form-filters">
                  <div className="col-12 col-sm-6 col-md-6 col-lg-6 col-xl-6">
                    <label>
                      <FormattedMessage id="store" defaultMessage="Store" />
                    </label>
                    <ApiFormChoiceField
                        name="store"
                        required={true}
                        choices={this.props.stores}
                        searchable={true}
                        placeholder={<FormattedMessage id="all_feminine" defaultMessage="All" />}
                        onChange={this.state.apiFormFieldChangeHandler}
                    />
                  </div>

                  <div className="col-12 col-sm-6 col-md-6 col-lg-6 col-xl-6">
                    <label>
                      <FormattedMessage id="competing_stores" defaultMessage="Competing stores" />
                    </label>
                    <ApiFormChoiceField
                        name="competing_stores"
                        choices={this.props.stores}
                        searchable={true}
                        placeholder={<FormattedMessage id="all_feminine" defaultMessage="All" />}
                        onChange={this.state.apiFormFieldChangeHandler}
                    />
                  </div>

                  <div className="col-12 col-sm-6 col-md-6 col-lg-6 col-xl-6">
                    <label>
                      <FormattedMessage id="categories" defaultMessage='Categories' />
                    </label>
                    <ApiFormChoiceField
                        name="categories"
                        choices={this.props.categories}
                        multiple={true}
                        placeholder={<FormattedMessage id="all_feminine" defaultMessage="All" />}
                        searchable={true}
                        onChange={this.state.apiFormFieldChangeHandler}
                    />
                  </div>

                  <div className="col-12 col-sm-6 col-md-6 col-lg-6 col-xl-6">
                    <label>
                      <FormattedMessage id="price_type" defaultMessage="Price type" />
                    </label>
                    <ApiFormChoiceField
                        name="price_type"
                        choices={priceTypeChoices}
                        onChange={this.state.apiFormFieldChangeHandler}
                        required={true}
                    />
                  </div>

                  <div className="col-12 col-sm-7 col-md-6 col-lg-12 col-xl-12 float-right">
                    <label htmlFor="submit">&nbsp;</label>

                    <ApiFormSubmitButton
                        label={<FormattedMessage id="generate" defaultMessage="Generate" />}
                        loadingLabel={<FormattedMessage id="generating" defaultMessage="Generating" />}
                        onChange={this.state.apiFormFieldChangeHandler}
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
    stores: filterApiResourceObjectsByType(state.apiResourceObjects, 'stores'),
    categories: filterApiResourceObjectsByType(state.apiResourceObjects, 'categories'),
    currencies: filterApiResourceObjectsByType(state.apiResourceObjects, 'currencies'),
    store_types: filterApiResourceObjectsByType(state.apiResourceObjects, 'store_types'),
    countries: filterApiResourceObjectsByType(state.apiResourceObjects, 'countries'),
  }
}

export default connect(mapStateToProps)(ReportStoreAnalysis);
