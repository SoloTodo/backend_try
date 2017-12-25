import React, {Component} from 'react'
import {FormattedMessage} from "react-intl";
import {connect} from "react-redux";
import {addApiResourceStateToPropsUtils} from "solotodo-react-utils";
import ApiForm from "../../api_forms/ApiForm";
import ApiFormChoiceField from "../../api_forms/ApiFormChoiceField";
import ApiFormSubmitButton from "../../api_forms/ApiFormSubmitButton";

class ReportCurrentPrices extends Component {
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
                endpoints={['reports/current_prices']}
                fields={['category', 'stores', 'countries', 'store_types', 'currency']}
                onResultsChange={this.setDownloadLink}
                onFormValueChange={this.handleFormValueChange}
                setFieldChangeHandler={this.setApiFormFieldChangeHandler}
                updateOnLoad={false}>
              <div className="card-block">
                <div className="row api-form-filters">
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

export default connect(
    addApiResourceStateToPropsUtils()
)(ReportCurrentPrices);
