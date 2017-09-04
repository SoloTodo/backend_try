import React, { Component } from 'react';
import {connect} from "react-redux";
import {
  addApiResourceDispatchToPropsUtils,
  addApiResourceStateToPropsUtils, filterApiResourcesByType
} from "../../ApiResource";
import {FormattedMessage} from "react-intl";
import StoreDetailMenu from "./StoreDetailMenu";
import {Redirect} from "react-router-dom";
import { toast } from 'react-toastify';
import Loading from "../../components/Loading";



class StoreDetailUpdate extends Component {
  constructor(props) {
    super(props);
    this.state = {
      formData: undefined,
      categoryChoices: undefined,
      updateTaskId: undefined,
      updateLogId: undefined
    }
  }

  componentDidMount() {
    if (!this.props.categories) {
      this.props.fetchApiResource('categories', this.props.dispatch)
    }

    const store = this.props.ApiResource(this.props.resourceObject);

    this.props.fetchAuth(`${store.url}scraper/`).then(formData => {
      this.setState({
        formData: {
          ...formData,
          categories: []
        },
        categoryChoices: formData.categories,
      })
    });
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

    this.props.fetchAuth(`${this.props.resourceObject.url}update_pricing/`, {
      method: 'POST',
      body: JSON.stringify(this.state.formData)
    }).then(json => {
      this.setState({
        updateTaskId: json.task_id,
        updateLogId: json.log_id
      });
    })


  };

  render() {
    const store = this.props.ApiResource(this.props.resourceObject);

    if (this.state.updateTaskId) {
      toast.success(<FormattedMessage
          id="store_update_requested_success"
          defaultMessage="Store update requested successfully." />, {
        autoClose: false
      });

      return (
          <Redirect to={{
            pathname: `/stores/${store.id}/update_logs`,
            state: {
              alert: {
                type: 'success',
                labelId: 'success_exclamation',
                messageId: 'store_update_requested_success'
              }
            }
          }} />
      )
    }

    const formData = this.state.formData;

    if (!formData || !this.props.categories) {
      return <Loading />
    }

    if (formData.detail) {
      return (
          <Redirect to={{
            pathname: `/stores/${store.id}/`,
            state: {
              alert: {
                type: 'warning',
                labelId: 'warning_exclamation',
                messageId: 'store_no_scraper_warning'
              }
            }
          }} />
      )
    }

    const categoryChoices = this.state.categoryChoices.map(
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
                    <div className="col-12">
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
                          <label htmlFor="categories"><FormattedMessage id="categories" defaultMessage={`Categories`} /></label>
                          <select className="form-control" id="categories" name="categories" multiple="multiple" size="8"
                                  value={formData.categories} onChange={this.handleInputChange}>
                            {categoryChoices.map(category => (
                                <option key={category.url} value={category.url}>{category.name}</option>
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

function mapStateToProps(state) {
  let categories = undefined;
  if (state.loadedResources.includes('categories')) {
    categories = filterApiResourcesByType(state.apiResources, 'categories')
  }
  return {
    categories
  }
}

export default connect(
    addApiResourceStateToPropsUtils(mapStateToProps),
    addApiResourceDispatchToPropsUtils())(StoreDetailUpdate);