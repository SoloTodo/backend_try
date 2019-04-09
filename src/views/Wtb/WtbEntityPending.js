import React, {Component} from 'react';
import {connect} from "react-redux";
import {FormattedMessage} from "react-intl";
import {
  apiResourceStateToPropsUtils,
  filterApiResourceObjectsByType,
} from "../../react-utils/ApiResource";
import {
  createOrderingOptionChoices,
  ApiFormResultTableWithPagination,
  ApiForm,
  ApiFormChoiceField,
  ApiFormTextField,
} from "../../react-utils/api_forms";
import {Link, NavLink} from "react-router-dom";
import messages from "../../messages";

class WtbEntityPending extends Component {
  constructor(props) {
    super(props);

    this.state = {
      formValues: {},
      apiFormFieldChangeHandler: undefined,
      wtbEntities: undefined
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

  setWtbEntities = json => {
    this.setState({
      wtbEntities: json ? json.payload : null
    })
  };

  handleWtbEntityHideClick = wtbEntity => {
    this.props.fetchAuth(wtbEntity.url + 'toggle_visibility/', {
      method: 'POST'
    });

    const newWtbEntities = {
      ...this.state.wtbEntities,
      count: this.state.wtbEntities.count - 1,
      results: this.state.wtbEntities.results.filter(e => e.url !== wtbEntity.url)
    };

    this.setState({
      wtbEntities: newWtbEntities
    })

  };

  render() {
    const columns = [
      {
        label: <FormattedMessage id="name" defaultMessage="Name" />,
        renderer: wtbEntity => <NavLink to={'/wtb/entities/' + wtbEntity.id}>{wtbEntity.name || <em>N/A</em>}</NavLink>
      },
      {
        label: <FormattedMessage id="brand" defaultMessage="Brand" />,
        renderer: wtbEntity => <span>
          <Link to={'/wtb/brands/' + wtbEntity.brand.id}>{wtbEntity.brand.name}</Link>
          <a href={wtbEntity.externalUrl} target="_blank" rel="noopener noreferrer" className="ml-2">
            <span className="glyphicons glyphicons-link">&nbsp;</span>
          </a>
        </span>
      },
      {
        label: <FormattedMessage id="category" defaultMessage="Category" />,
        renderer: wtbEntity => wtbEntity.category.name,
      },
      {
        label: <FormattedMessage id="associate" defaultMessage="Associate" />,
        renderer: wtbEntity => <a href={`/wtb/entities/${wtbEntity.id}/associate`} className="btn btn-secondary">
          <FormattedMessage id="associate" defaultMessage="Associate" />
        </a>,
      },
      {
        label: <FormattedMessage id="hide" defaultMessage="Hide" />,
        renderer: wtbEntity => <button type="button" className="btn btn-secondary" onClick={evt => this.handleWtbEntityHideClick(wtbEntity)}>
          <FormattedMessage id="hide" defaultMessage="Hide" />
        </button>,
      },
    ];

    const wtbBrandChoices = this.props.wtb_brands.filter(wtbBrand => wtbBrand.permissions.includes('is_wtb_brand_staff'));
    const categoryChoices = this.props.categories.filter(category => category.permissions.includes('is_category_staff'));

    return (
        <div className="animated fadeIn">
          <ApiForm
              endpoints={["wtb/entities/pending/"]}
              fields={['brands', 'categories', 'search', 'page', 'page_size', 'ordering']}
              onResultsChange={this.setWtbEntities}
              onFormValueChange={this.handleFormValueChange}
              setFieldChangeHandler={this.setApiFormFieldChangeHandler}>
            <ApiFormChoiceField
                name="ordering"
                choices={createOrderingOptionChoices(['name', 'wtb_brand', 'category'])}
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
                      <div className="col-12 col-sm-6 col-md-6 col-lg-6 col-xl-6">
                        <label htmlFor="wtb_brands">
                          <FormattedMessage id="brands" defaultMessage="Brands" />
                        </label>
                        <ApiFormChoiceField
                            name="brands"
                            id="brands"
                            choices={wtbBrandChoices}
                            multiple={true}
                            onChange={this.state.apiFormFieldChangeHandler}
                            value={this.state.formValues.wtb_brands}
                            placeholder={messages.all_feminine}

                        />
                      </div>
                      <div className="col-12 col-sm-6 col-md-6 col-lg-6 col-xl-6">
                        <label htmlFor="categories">
                          <FormattedMessage id="categories" defaultMessage={`Categories`} />
                        </label>
                        <ApiFormChoiceField
                            name="categories"
                            id="categories"
                            choices={categoryChoices}
                            multiple={true}
                            searchable={true}
                            onChange={this.state.apiFormFieldChangeHandler}
                            value={this.state.formValues.categories}
                            placeholder={messages.all_feminine}
                        />
                      </div>
                      <div className="col-12 col-sm-5 col-md-6 col-lg-4 col-xl-4">
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
                    data={this.state.wtbEntities}
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
    wtb_brands: filterApiResourceObjectsByType(state.apiResourceObjects, 'wtb_brands'),
    categories: filterApiResourceObjectsByType(state.apiResourceObjects, 'categories'),
  }
}

export default connect(mapStateToProps)(WtbEntityPending);
