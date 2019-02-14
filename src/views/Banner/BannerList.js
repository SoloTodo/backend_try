import React from 'react'
import {connect} from 'react-redux'
import {Row, Col, Card, CardHeader} from 'reactstrap'
import {
  ApiForm,
  ApiFormChoiceField,
  ApiFormResultsTable,
  createOrderingOptionChoices
} from '../../react-utils/api_forms'
import {
  apiResourceStateToPropsUtils,
  filterApiResourceObjectsByType
} from "../../react-utils/ApiResource";


class BannerList extends React.Component{
  constructor(props) {
    super(props);
    this.state = {
      formValues: {},
      apiFormFieldChangeHandler: undefined,
      banners: undefined
    };

    this.storeObject = {};
    for (const store of this.props.stores){
      this.storeObject[store.url] = store
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

  setBanners = json => {
    this.setState({
      banners: json? json.payload : null
    })
  };

  render() {
    const columns = [
      {
        label: 'Tienda',
        ordering: 'store',
        renderer: banner => this.storeObject[banner.update.store].name
      },
      {
        label: 'Categoría',
        renderer: banner => banner.category || 'N/A'
      },
      {
        label: 'Imagen',
        renderer: banner => banner.asset.picture_url
      },
      {
        label:'Posición',
        renderer: banner => banner.position
      },
      {
        label: 'Fecha creación',
        ordering: 'timestamp',
        renderer: banner => banner.update.timestamp
      }
    ];

    return <div className="animated fadeIn">
      <ApiForm
        endpoints={['banners/']}
        fields={['stores', 'ordering']}
        onResultsChange={this.setBanners}
        onFormValueChange={this.handleFormValueChange}
        setFieldChangeHandler={this.setApiFormFieldChangeHandler}>
        <ApiFormChoiceField
          name='ordering'
          choices={createOrderingOptionChoices(['store', 'timestamp'])}
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
                </Row>
              </div>
            </Card>
          </Col>
        </Row>

      </ApiForm>
      <Row>
        <Col sm="12">
          <Card>
            <CardHeader>Banners</CardHeader>
            <div className="card-block">
              <ApiFormResultsTable
                results = {this.state.banners}
                onChange={this.state.apiFormFieldChangeHandler}
                columns={columns}
                ordering={this.state.formValues.ordering}/>
            </div>
          </Card>
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

export default connect(mapStateToProps)(BannerList);
