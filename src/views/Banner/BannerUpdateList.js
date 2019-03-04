import React from 'react'
import {connect} from "react-redux";
import {Card, CardHeader, Col, Row} from "reactstrap";
import {
  ApiForm,
  ApiFormChoiceField,
  ApiFormDateRangeField,
  ApiFormResultTableWithPagination,
  createOrderingOptionChoices
} from "../../react-utils/api_forms";
import {
  apiResourceStateToPropsUtils,
  filterApiResourceObjectsByType
} from "../../react-utils/ApiResource";
import {booleanChoices} from "../../utils";
import {formatDateStr} from "../../react-utils/utils";
import {NavLink} from "react-router-dom";

class BannerUpdateList extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      formValues: {},
      apiFormFieldChangeHandler:undefined,
      updates: undefined
    }
  }

  setApiFormFieldChangeHandler = apiFormFieldChangeHandler => {
    this.setState({
      apiFormFieldChangeHandler
    })
  };

  handleFormValueChange = formValues => {
    this.setState({
      formValues
    })
  };

  setUpdates = json => {
    this.setState({
      updates: json? json.payload : null
    })
  };

  render() {
    const status_codes = {
      1: 'En proceso',
      2: 'Exitoso',
      3: 'Error'
    };

    const columns = [
      {
        label: 'Id',
        renderer: update => <NavLink to={`/banners/?update_id=${update.id}`}>{update.id}</NavLink>
      },
      {
        label: 'Store',
        renderer: update => update.store.name
      },
      {
        label: '¿Activo?',
        renderer: update => update.isActive? 'Sí' : 'No'
      },
      {
        label: 'Estado',
        renderer: update => `${status_codes[update.status]} ${update.status === 3 ? `(${update.statusMessage})` : ''}`
      },
      {
        label: 'Fecha',
        ordering: 'timestamp',
        renderer: update => formatDateStr(update.timestamp)
      }
    ];

    return <div className="animated fadeIn">
      <ApiForm
        endpoints={['banner_updates/']}
        fields={['stores', 'ordering', 'is_active', 'page', 'page_size']}
        onResultsChange={this.setUpdates}
        onFormValueChange={this.handleFormValueChange}
        setFieldChangeHandler={this.setApiFormFieldChangeHandler}>
        <ApiFormChoiceField
          name='ordering'
          choices={createOrderingOptionChoices(['timestamp'])}
          initial='-timestamp'
          hidden={true}
          required={true}
          value={this.state.formValues.ordering}
          onChange={this.state.apiFormFieldChangeHandler}/>
        <Row>
          <Col sm="12">
            <Card>
              <CardHeader>Filtros</CardHeader>
              <div className="card-block">
                <Row className="entity-form-controls">
                  <Col xs="12" sm="6">
                    <label htmlFor="timestamp">Rango de fechas (desde / hasta)</label>
                    <ApiFormDateRangeField
                      name="timestamp"
                      id="timestamp"
                      nullable={true}
                      onChange={this.state.apiFormFieldChangeHandler}
                      value={this.state.formValues.timestamp}/>
                  </Col>
                  <Col xs="12" sm="6">
                    <label htmlFor="stores">Tiendas</label>
                    <ApiFormChoiceField
                      name="stores"
                      id="stores"
                      choices={this.props.stores}
                      multiple={true}
                      onChange={this.state.apiFormFieldChangeHandler}
                      value={this.state.formValues.stores}
                      placeholder='Todas'/>
                  </Col>
                  <Col xs="12" sm="6">
                    <label htmlFor="is_active">¿Activo?</label>
                    <ApiFormChoiceField
                      name="is_active"
                      id="is_active"
                      choices={booleanChoices}
                      searchable={false}
                      onChange={this.state.apiFormFieldChangeHandler}
                      value={this.state.formValues.is_active}/>
                  </Col>
                </Row>
              </div>
            </Card>
          </Col>
        </Row>
      </ApiForm>
      <Row>
        <Col sm="12">
          <ApiFormResultTableWithPagination
            page_size_choices={[10, 20, 50]}
            page={this.state.formValues.page}
            page_size={this.state.formValues.page_size}
            data = {this.state.updates}
            onChange={this.state.apiFormFieldChangeHandler}
            columns={columns}
            ordering={this.state.formValues.ordering}/>
        </Col>
      </Row>
    </div>
  }
}

function mapStateToProps(state) {
  const {ApiResourceObject} = apiResourceStateToPropsUtils(state);

  return {
    ApiResourceObject,
    stores: filterApiResourceObjectsByType(state.apiResourceObjects, 'stores')
  }
}

export default connect(mapStateToProps)(BannerUpdateList);
