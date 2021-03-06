import React, {Component} from 'react';
import {connect} from "react-redux";
import {FormattedMessage} from "react-intl";
import {
  apiResourceStateToPropsUtils,
  filterApiResourceObjectsByType
} from "../../react-utils/ApiResource";
import './EntityList.css'
import {Link, NavLink} from "react-router-dom";
import messages from "../../messages";
import {
  createOrderingOptionChoices,
  ApiForm,
  ApiFormChoiceField,
  ApiFormTextField,
  ApiFormResultTableWithPagination
} from '../../react-utils/api_forms'

class EntityPending extends Component {
  constructor(props) {
    super(props);

    this.state = {
      formValues: {},
      apiFormFieldChangeHandler: undefined,
      entities: undefined
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

  setEntities = json => {
    this.setState({
      entities: json ? json.payload : null
    })
  };

  handleEntityHideClick = entity => {
    this.props.fetchAuth(entity.url + 'toggle_visibility/', {
      method: 'POST'
    });

    const newEntities = {
      ...this.state.entities,
      count: this.state.entities.count - 1,
      results: this.state.entities.results.filter(e => e.url !== entity.url)
    };

    this.setState({
      entities: newEntities
    })

  };

  render() {
    const columns = [
      {
        label: <FormattedMessage id="name" defaultMessage="Name" />,
        ordering: 'name',
        renderer: entity => <NavLink to={'/entities/' + entity.id}>{entity.name || <em>N/A</em>}</NavLink>
      },
      {
        label: <FormattedMessage id="cell_plan_name" defaultMessage="Cell plan" />,
        renderer: entity => entity.cellPlanName || <em>N/A</em>,
        cssClasses: 'hidden-xs-down',
        displayFilter: entities => entities.some(entity => entity.cellPlanName !== null)
      },
      {
        label: <FormattedMessage id="store" defaultMessage="Store" />,
        ordering: 'store',
        renderer: entity => <span>
          <Link to={'/stores/' + entity.store.id}>{entity.store.name}</Link>
          <a href={entity.externalUrl} target="_blank" className="ml-2">
            <span className="glyphicons glyphicons-link">&nbsp;</span>
          </a>
        </span>
      },
      {
        label: <FormattedMessage id="category" defaultMessage="Category" />,
        ordering: 'category',
        renderer: entity => entity.category.name,
      },
      {
        label: <FormattedMessage id="associate" defaultMessage="Associate" />,
        renderer: entity => <a href={`/entities/${entity.id}/associate`} className="btn btn-secondary">
          <FormattedMessage id="associate" defaultMessage="Associate" />
        </a>,
      },
      {
        label: <FormattedMessage id="hide" defaultMessage="Hide" />,
        renderer: entity => <button type="button" className="btn btn-secondary" onClick={evt => this.handleEntityHideClick(entity)}>
          <FormattedMessage id="hide" defaultMessage="Hide" />
        </button>,
      },
    ];

    const storeChoices = this.props.stores;
    const categoryChoices = this.props.categories;

    return (
        <div className="animated fadeIn">
          <ApiForm
              endpoints={["entities/pending/"]}
              fields={['stores', 'categories', 'countries', 'search', 'page', 'page_size', 'ordering']}
              onResultsChange={this.setEntities}
              onFormValueChange={this.handleFormValueChange}
              setFieldChangeHandler={this.setApiFormFieldChangeHandler}>
            <ApiFormChoiceField
                name="ordering"
                choices={createOrderingOptionChoices(['name', 'store', 'category'])}
                hidden={true}
                required={true}
                value={this.state.formValues.ordering}
                onChange={this.state.apiFormFieldChangeHandler}
            />
            <div className="row">
              <div className="col-12">
                <div className="card">
                  <div className="card-header">
                    <i className="glyphicons glyphicons-search">&nbsp;</i> <FormattedMessage id="filters" defaultMessage={`Filters`} />
                  </div>
                  <div className="card-block">
                    <div className="row entity-form-controls">
                      <div className="col-12 col-sm-6">
                        <label htmlFor="stores">
                          <FormattedMessage id="stores" defaultMessage={`Stores`} />
                        </label>
                        <ApiFormChoiceField
                            name="stores"
                            id="stores"
                            choices={storeChoices}
                            multiple={true}
                            searchable={!this.props.isExtraSmall}
                            onChange={this.state.apiFormFieldChangeHandler}
                            value={this.state.formValues.stores}
                            placeholder={messages.all_feminine}

                        />
                      </div>
                      <div className="col-12 col-sm-6">
                        <label htmlFor="categories">
                          <FormattedMessage id="categories" defaultMessage={`Categories`} />
                        </label>
                        <ApiFormChoiceField
                            name="categories"
                            id="categories"
                            choices={categoryChoices}
                            multiple={true}
                            searchable={!this.props.isExtraSmall}
                            onChange={this.state.apiFormFieldChangeHandler}
                            value={this.state.formValues.categories}
                            placeholder={messages.all_feminine}
                        />
                      </div>
                      <div className="col-12 col-sm-6">
                        <label htmlFor="countries">
                          <FormattedMessage id="countries" defaultMessage="Countries" />
                        </label>
                        <ApiFormChoiceField
                            name="countries"
                            id="countries"
                            choices={this.props.countries}
                            multiple={true}
                            searchable={false}
                            onChange={this.state.apiFormFieldChangeHandler}
                            value={this.state.formValues.countries}
                            placeholder={messages.all_masculine}
                        />
                      </div>
                      <div className="col-12 col-sm-6">
                        <label htmlFor="search">
                          <FormattedMessage id="keywords" defaultMessage={'Keywords'} />
                        </label>
                        <ApiFormTextField
                            name="search"
                            onChange={this.state.apiFormFieldChangeHandler}
                            value={this.state.formValues.search}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-12">
                <ApiFormResultTableWithPagination
                    label={<FormattedMessage id="entities" defaultMessage="Entities" />}
                    page_size_choices={[50, 100, 200]}
                    page={this.state.formValues.page}
                    page_size={this.state.formValues.page_size}
                    data={this.state.entities}
                    onChange={this.state.apiFormFieldChangeHandler}
                    columns={columns}
                    ordering={this.state.formValues.ordering}
                />
              </div>
            </div>
          </ApiForm>
        </div>
    )
  }
}


function mapStateToProps(state) {
  const {fetchAuth} = apiResourceStateToPropsUtils(state);

  return {
    fetchAuth,
    stores: filterApiResourceObjectsByType(state.apiResourceObjects, 'stores'),
    categories: filterApiResourceObjectsByType(state.apiResourceObjects, 'categories')
        .filter(category => category.permissions.includes('is_category_staff')),
    countries: filterApiResourceObjectsByType(state.apiResourceObjects, 'countries'),
    isExtraSmall: state.browser.is.extraSmall
  }
}

export default connect(mapStateToProps)(EntityPending);
