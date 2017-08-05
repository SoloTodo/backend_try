import React, { Component } from 'react';
import {connect} from "react-redux";
import {addApiResourceStateToPropsUtils} from "../../ApiResource";
import {FormattedMessage} from "react-intl";
import StoreDetailMenu from "./StoreDetailMenu";
import {Redirect} from "react-router-dom";



class StoreDetailUpdate extends Component {
  constructor(props) {
    super(props);
    this.state = {
      formData: undefined,
      product_type_choices: undefined,
    }
  }

  componentDidMount() {
    const store = this.props.ApiResource(this.props.resourceObject);

    this.props.fetchAuth(`${store.url}scraper/`).then(formData => {
      this.setState({
        formData: {
          ...formData,
          product_types: []
        },
        product_type_choices: formData.product_types,
      })
    })
  }

  handleInputChange = (event) => {
    const target = event.target;

    let value = undefined;

    if (target.type === 'checkbox') {
      value = target.checked
    } else if (event.target.multiple) {
      value = [...event.target.options].filter(o => o.selected).map(o => o.value);
    } else {
      value = target.value
    }

    this.setState({
      formData: {...this.state.formData, [target.name]: value}
    });

  };

  handleFormSubmit = (event) => {
    event.preventDefault();

    this.props.fetchAuth(`${this.props.resourceObject.url}update_prices/`, {
      method: 'POST',
      body: JSON.stringify(this.state.formData)
    }).then(json => console.log(json))


  };

  render() {
    const store = this.props.ApiResource(this.props.resourceObject);
    const formData = this.state.formData;

    if (!formData) {
      return <div />
    }

    if (formData.detail) {
      return (
          <Redirect to={{
            pathname: `/stores/${store.id}/`,
            state: {
              warning: 'no_scraper'
            }
          }} />
      )
    }

    const productTypeChoices = this.state.product_type_choices.map(
        x => this.props.ApiResource(this.props.apiResources[x]));

    return (
        <div className="animated fadeIn">
          {!store.isActive && (
              <div className="alert alert-warning" role="alert">
                <strong><FormattedMessage id="warning_exclamation" defaultMessage={`Warning!`} /></strong> <FormattedMessage id="store_inactive_warning" defaultMessage={`This store is inactive, it has to be set as active to update its prices`} />
              </div>
          )}

          <div className="row">
            <div className="col-sm-6 col-md-8">
              <div className="card">
                <div className="card-header">
                  <strong>
                    <FormattedMessage id="update" defaultMessage={`Update`} />
                  </strong>
                </div>
                <div className="card-block">
                  <div className="row">
                    <div className="col-sm-12">
                      <form onSubmit={this.handleFormSubmit}>
                        <div className="checkbox">
                          <label htmlFor="async">
                            <input
                                name="async"
                                id="async"
                                type="checkbox"
                                checked={formData.async}
                                onChange={this.handleInputChange} /> <FormattedMessage id="use_async_question" defaultMessage={`Use async?`} />
                          </label>
                        </div>
                        <div className="form-group">
                          <label htmlFor="discover_urls_concurrency"><FormattedMessage id="url_discovery_concurrency" defaultMessage={`URL discovery concurrency`} /></label>
                          <input type="number" onChange={this.handleInputChange} value={formData.discover_urls_concurrency} className="form-control" id="discover_urls_concurrency" name="discover_urls_concurrency" step="1" min="1" />
                        </div>
                        <div className="form-group">
                          <label htmlFor="products_for_url_concurrency"><FormattedMessage id="product_scraping_concurrency" defaultMessage={`Product scraping concurrency`} /></label>
                          <input type="number" onChange={this.handleInputChange} value={formData.products_for_url_concurrency} className="form-control" id="products_for_url_concurrency" name="products_for_url_concurrency" step="1" min="1" />
                        </div>
                        <div className="form-group">
                          <label htmlFor="queue"><FormattedMessage id="queue" defaultMessage={`Queue`} /></label>
                          <select className="form-control" id="queue" name="queue"
                                  value={formData.queue} onChange={this.handleInputChange}>
                            <option value='us'>United States</option>
                            <option value='cl'>Chile</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label htmlFor="product_types"><FormattedMessage id="product_types" defaultMessage={`Product types`} /></label>
                          <select className="form-control" id="product_types" name="product_types" multiple="multiple" size="8"
                                  value={formData.product_types} onChange={this.handleInputChange}>
                            {productTypeChoices.map(productType => (
                                <option key={productType.url} value={productType.url}>{productType.name}</option>
                            ))}
                          </select>
                        </div>
                        <div className="form-actions">
                          <button type="submit" className="btn btn-primary" disabled={!store.isActive}><FormattedMessage id="update" defaultMessage={`Update`} /></button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <StoreDetailMenu store={store} />
          </div>
        </div>
    )
  }
}

export default connect(addApiResourceStateToPropsUtils())(StoreDetailUpdate);