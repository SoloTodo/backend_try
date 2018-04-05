import React, { Component } from 'react';
import {
  filterApiResourceObjectsByType,
} from '../../react-utils/ApiResource';
import {
  createOrderingOptionChoices,
  ApiForm,
  ApiFormChoiceField,
  ApiFormResultsTable
} from '../../react-utils/api_forms';
import {connect} from "react-redux";
import {FormattedMessage} from "react-intl";
import NavLink from "react-router-dom/es/NavLink";
import messages from "../../messages";
import moment from "moment";


class StoreList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      formValues: {},
      apiFormFieldChangeHandler: undefined,
      stores: undefined
    }
  }

  setApiFormFieldChangeHandler = apiFormFieldChangeHandler => {
    this.setState({
      apiFormFieldChangeHandler
    })
  };

  setStores = json => {
    this.setState({
      stores: json ? json.payload : null
    })
  };

  handleFormValueChange = formValues => {
    this.setState({formValues})
  };

  render() {
    const columns = [
      {
        label: <FormattedMessage id="name" defaultMessage={`Name`} />,
        ordering: 'name',
        renderer: entry => <NavLink to={'/stores/' + entry.id}>{entry.name}</NavLink>
      },
      {
        label: <FormattedMessage id="country" defaultMessage={`Country`}/>,
        ordering: 'country',
        renderer: entry => entry.country.name
      },
      {
        label: <FormattedMessage id="type" defaultMessage={`Type`}/>,
        ordering: 'type',
        renderer: entry => entry.type.name
      },
      {
        label: <FormattedMessage id="last_activation" defaultMessage="Last activation" />,
        renderer: entry => entry.lastActivation ? moment(entry.lastActivation).format('lll') : 'N/A',
        cssClasses: 'hidden-xs-down'
      },
      {
        label: <FormattedMessage id="scraper" defaultMessage={`Scraper`}/>,
        ordering: 'storescraper_class',
        field: 'storescraperClass',
        cssClasses: 'hidden-sm-down'
      }
    ];

    return <div className="animated fadeIn">
      <ApiForm
          endpoints={["stores/"]}
          fields={['countries', 'types', 'ordering']}
          onResultsChange={this.setStores}
          onFormValueChange={this.handleFormValueChange}
          setFieldChangeHandler={this.setApiFormFieldChangeHandler}>
        <div className="card">
          <div className="card-header">
            <i className="glyphicons glyphicons-search">&nbsp;</i> <FormattedMessage id="filters" defaultMessage={`Filters`} />
          </div>
          <div className="card-block">
            <div className="row api-form-filters">
              <div className="col-12 col-md-6 col-xl-4">
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
              <div className="col-12 col-md-6 col-xl-3">
                <label htmlFor="types">
                  <FormattedMessage id="store_types" defaultMessage="Types" />
                </label>

                <ApiFormChoiceField
                    name="types"
                    id="types"
                    choices={this.props.storeTypes}
                    multiple={true}
                    searchable={false}
                    onChange={this.state.apiFormFieldChangeHandler}
                    value={this.state.formValues.types}
                    placeholder={messages.all_masculine}
                />
              </div>

              <ApiFormChoiceField
                  name="ordering"
                  choices={createOrderingOptionChoices(['name', 'country', 'type'])}
                  hidden={true}
                  initial="name"
                  value={this.state.formValues.ordering}
                  onChange={this.state.apiFormFieldChangeHandler}
              />
            </div>
          </div>
        </div>
      </ApiForm>
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <i className="glyphicons glyphicons-list">&nbsp;</i> <FormattedMessage id="stores" defaultMessage={`Stores`} />
            </div>
            <div className="card-block">
              <ApiFormResultsTable
                results={this.state.stores}
                columns={columns}
                ordering={this.state.formValues.ordering}
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
    countries: filterApiResourceObjectsByType(state.apiResourceObjects, 'countries'),
    storeTypes: filterApiResourceObjectsByType(state.apiResourceObjects, 'store_types')
  }
}

export default connect(mapStateToProps)(StoreList);