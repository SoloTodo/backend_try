import React, { Component } from 'react';
import {
  addApiResourceDispatchToPropsUtils,
  addApiResourceStateToPropsUtils, filterApiResourceObjectsByType
} from '../../ApiResource';
import {connect} from "react-redux";
import {FormattedMessage} from "react-intl";
import NavLink from "react-router-dom/es/NavLink";
import ApiForm from "../../api_forms/ApiForm";
import ChoiceField from "../../api_forms/ChoiceField";
import MultiChoiceField from "../../api_forms/MultiChoiceField";
import ApiFormSubmitButton from "../../api_forms/ApiFormSubmitButton";
import Loading from "../../components/Loading";


class StoreList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      apiFormChangeHandler: undefined,
      stores: undefined
    }
  }

  setApiFormValueChangeHandler = apiFormChangeHandler => {
    this.setState({
      apiFormChangeHandler
    })
  };

  setStores = json => {
    const stores = json ? json.payload : null;

    this.setState({
      stores
    })
  };

  render() {
    const stores = this.state.stores ?
        this.state.stores.map(x => this.props.ApiResourceObject(x)) :
        null;

    const nullBooleanChoices = [
      {
        id: 'any',
        name: 'Any',
      },
      {
        id: 1,
        name: 'Yes',
      },
      {
        id: 0,
        name: 'No',
      }
    ];

    return <div className="animated fadeIn">
      <ApiForm
          endpoint="stores"
          fields={['countries']}
          onResultsChange={this.setStores}
          setValueChangeHandler={this.setApiFormValueChangeHandler}>
        <div className="card">
          <div className="card-header"><strong><FormattedMessage id="filters" defaultMessage={`Filters`} /></strong></div>
          <div className="card-block">
            <div className="row negative-top-margin">
              <div className="mt-2 col-12 col-md-6 col-xl-4">
                <label htmlFor="countries">
                  <FormattedMessage id="countries" defaultMessage="Countries" />
                </label>

                <MultiChoiceField
                    name="countries"
                    id="countries"
                    choices={this.props.countries}
                    searchable={false}
                    onApiParamChange={this.state.apiFormChangeHandler}
                    urlParams=''
                />
              </div>
              <div className="mt-2 col-12 col-md-6 col-xl-4">
                <label htmlFor="types">
                  <FormattedMessage id="store_types" defaultMessage="Types" />
                </label>

                <MultiChoiceField
                    name="types"
                    id="types"
                    choices={this.props.storeTypes}
                    searchable={false}
                    onApiParamChange={this.state.apiFormChangeHandler}
                    urlParams=''
                />
              </div>
              <div className="mt-2 col-12 col-sm-8 col-md-6 col-xl-2">
                <label htmlFor="is_active">
                  <FormattedMessage id="is_listed" defaultMessage="Is listed?" />
                </label>

                <ChoiceField
                    name="is_active"
                    id="is_active"
                    choices={nullBooleanChoices}
                    searchable={false}
                    onApiParamChange={this.state.apiFormChangeHandler}
                    urlParams=''
                />
              </div>
              <div className="mt-2 col-12 col-sm-4 col-xl-2">
                <label htmlFor="submit">&nbsp;</label>
                <ApiFormSubmitButton
                    label={<FormattedMessage id="search" defaultMessage='Search' />}
                    onApiParamChange={this.state.apiFormChangeHandler}
                />
              </div>
            </div>
          </div>
        </div>
      </ApiForm>
      <div className="row">
        <div className="col-12 col-md-10 col-lg-10 col-xl-8">
          <div className="card">
            <div className="card-header">
              <i className="glyphicons glyphicons-list">&nbsp;</i> <FormattedMessage id="stores" defaultMessage={`Stores`} />
            </div>
            <div className="card-block">
              {stores ?
                  <table className="table table-striped">
                    <thead>
                    <tr>
                      <th><FormattedMessage id="name" defaultMessage={`Name`}/>
                      </th>
                      <th><FormattedMessage id="country"
                                            defaultMessage={`Country`}/></th>
                      <th className="hidden-xs-down"><FormattedMessage id="type"
                                                                       defaultMessage={`type`}/>
                      </th>
                      <th className="text-center hidden-xs-down">
                        <FormattedMessage id="active_question"
                                          defaultMessage={`Active?`}/></th>
                      <th className="hidden-sm-down"><FormattedMessage
                          id="scraper" defaultMessage={`Scraper`}/></th>
                    </tr>
                    </thead>
                    <tbody>
                    {stores.map(store => (
                        <tr key={store.url}>
                          <td>
                            <NavLink
                                to={'/stores/' + store.id}>{store.name}</NavLink>
                          </td>
                          <td>{store.country.name}</td>
                          <td className="hidden-xs-down">{store.type.name}</td>
                          <td className="text-center hidden-xs-down"><i
                              className={store.isActive ? 'glyphicons glyphicons-check' : 'glyphicons glyphicons-unchecked'}>&nbsp;</i>
                          </td>
                          <td className="hidden-sm-down">{store.storescraperClass}</td>
                        </tr>
                    ))}
                    </tbody>
                  </table>
                  : <Loading />
              }
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

export default connect(
    addApiResourceStateToPropsUtils(mapStateToProps),
    addApiResourceDispatchToPropsUtils())(StoreList);