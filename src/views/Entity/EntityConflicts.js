import React, {Component} from 'react'
import {
  filterApiResourceObjectsByType
} from "../../react-utils/ApiResource";
import {connect} from "react-redux";
import {
  ApiForm,
  ApiFormChoiceField,
  ApiFormResultsTable
} from '../../react-utils/api_forms'
import {FormattedMessage} from "react-intl";
import messages from "../../messages";
import {settings} from "../../settings";
import NavLink from "react-router-dom/es/NavLink";

class EntityConflicts extends Component {
  constructor(props) {
    super(props);

    this.state = {
      formValues: {},
      apiFormFieldChangeHandler: undefined,
      conflicts: undefined
    }
  }

  setApiFormFieldChangeHandler = apiFormFieldChangeHandler => {
    this.setState({
      apiFormFieldChangeHandler
    })
  };

  setConflicts = json => {
    this.setState({
      conflicts: json ? json.payload : null
    })
  };

  handleFormValueChange = formValues => {
    this.setState({formValues})
  };

  render() {
    const columns = [
      {
        label: <FormattedMessage id="store" defaultMessage="Store" />,
        renderer: entry => <NavLink to={'/stores/' + entry.store.id}>{entry.store.name}</NavLink>
      },
      {
        label: <FormattedMessage id="product" defaultMessage="Product" />,
        renderer: entry => <NavLink to={'/products/' + entry.product.id}>{entry.product.name}</NavLink>
      },
      {
        label: <FormattedMessage id="cell_plan" defaultMessage="Cell plan" />,
        renderer: entry => entry.cell_plan ? <NavLink to={'/products/' + entry.cell_plan.id}>{entry.cell_plan.name}</NavLink> : <em>N/A</em>
      },
      {
        label: <FormattedMessage id="category" defaultMessage="Category" />,
        renderer: entry => <NavLink to={'/categories/' + entry.category.id}>{entry.category.name}</NavLink>
      },
      {
        label: <FormattedMessage id="entities" defaultMessage="Entities" />,
        renderer: entry => {
          return <ul>
            {entry.entities.map(entity => (
              <li key={entity.id}>
                <NavLink to={'/entities/' + entity.id}>{entity.name}</NavLink>
              </li>
            ))}
          </ul>
        }
      },
    ];

    const stores = this.props.stores;
    const categories = this.props.categories;

    return <div className="animated fadeIn">
      <ApiForm
          endpoints={[settings.apiResourceEndpoints.entities + 'conflicts/']}
          fields={['stores', 'categories']}
          onResultsChange={this.setConflicts}
          onFormValueChange={this.handleFormValueChange}
          setFieldChangeHandler={this.setApiFormFieldChangeHandler}>
        <div className="card">
          <div className="card-header">
            <i className="glyphicons glyphicons-search">&nbsp;</i> <FormattedMessage id="filters" defaultMessage={`Filters`} />
          </div>
          <div className="card-block">
            <div className="row api-form-filters">
              <div className="col-12 col-md-6 col-xl-4">
                <label htmlFor="stores">
                  <FormattedMessage id="stores" defaultMessage="Stores" />
                </label>

                <ApiFormChoiceField
                    name="stores"
                    id="stores"
                    choices={stores}
                    multiple={true}
                    searchable={true}
                    onChange={this.state.apiFormFieldChangeHandler}
                    value={this.state.formValues.stores}
                    placeholder={messages.all_feminine}
                />
              </div>
              <div className="col-12 col-md-6 col-xl-4">
                <label htmlFor="categories">
                  <FormattedMessage id="categories" defaultMessage="Categories" />
                </label>

                <ApiFormChoiceField
                    name="categories"
                    id="categories"
                    choices={categories}
                    multiple={true}
                    searchable={true}
                    onChange={this.state.apiFormFieldChangeHandler}
                    value={this.state.formValues.categories}
                    placeholder={messages.all_masculine}
                />
              </div>
            </div>
          </div>
        </div>
      </ApiForm>
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <i className="glyphicons glyphicons-list">&nbsp;</i> <FormattedMessage id="conflicts" defaultMessage="Conflicts" />
            </div>
            <div className="card-block">
              <ApiFormResultsTable
                  results={this.state.conflicts}
                  columns={columns}
                  onChange={this.state.apiFormFieldChangeHandler}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  }
}

function mapStateToProps(state) {
  return {
    stores: filterApiResourceObjectsByType(state.apiResourceObjects, 'stores'),
    categories: filterApiResourceObjectsByType(state.apiResourceObjects, 'categories')
        .filter(category => category.permissions.includes('is_category_staff'))
  }
}

export default connect(mapStateToProps)(EntityConflicts);
