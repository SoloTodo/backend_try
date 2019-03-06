import React from 'react'
import {connect} from 'react-redux'
import {Row, Col, Card, CardHeader} from 'reactstrap'
import {
  ApiForm,
  ApiFormChoiceField,
  ApiFormResultTableWithPagination,
  ApiFormRemoveOnlyListField,
  createOrderingOptionChoices
} from '../../react-utils/api_forms'
import {
  apiResourceStateToPropsUtils,
  filterApiResourceObjectsByType
} from "../../react-utils/ApiResource";
import {booleanChoices} from "../../utils";
import {formatDateStr} from "../../react-utils/utils";
import NavLink from "react-router-dom/es/NavLink";


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
    });
  };

  render() {
    const columns = [
      {
        label: 'Asset',
        renderer: banner => <NavLink to={`/banner_assets/${banner.asset.id}`}>Asset</NavLink>
      },
      {
        label: 'Tienda',
        ordering: 'store',
        renderer: banner => this.storeObject[banner.update.store].name
      },
      {
        label: 'Subsección',
        ordering: 'subsection',
        renderer: banner => <a href={banner.externalUrl} target="_blank" rel="noopener noreferrer">{banner.subsection.section.name} > {banner.subsection.name}</a>
      },
      {
        label: 'Imagen',
        renderer: banner => <a href={banner.asset.picture_url} target="_blank" rel="noopener noreferrer">Imagen</a>
      },
      {
        label: 'Destino',
        renderer: banner => {return banner.destinationUrlList.length? <ul className="list-without-decoration mb-0">{banner.destinationUrlList.map(url => {
          return <li key={url}><a href={url} target="_blank" rel="noopener noreferrer">Link</a></li>
        })}</ul> : 'Sin link'}
      },
      {
        label: '¿Activo?',
        renderer: banner => banner.update.is_active? 'Sí' : 'No'
      },
      {
        label: 'Completitud',
        renderer: banner => `${banner.asset.total_percentage || 0} %`
      },
      {
        label:'Posición',
        ordering: 'position',
        renderer: banner => banner.position
      },
      {
        label: 'Fecha creación',
        ordering: 'update__timestamp',
        renderer: banner => formatDateStr(banner.update.timestamp)
      }
    ];

    const displayUpdateFilter = this.state.formValues.update_id && this.state.formValues.update_id.length;

    return <div className="animated fadeIn">
      <ApiForm
        endpoints={['banners/']}
        fields={['stores', 'ordering', 'is_active', 'update_id', 'page', 'page_size']}
        onResultsChange={this.setBanners}
        onFormValueChange={this.handleFormValueChange}
        setFieldChangeHandler={this.setApiFormFieldChangeHandler}>
        <ApiFormChoiceField
          name='ordering'
          choices={createOrderingOptionChoices(['store', 'update__timestamp', 'subsection', 'position'])}
          initial='-update__timestamp'
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
                  <Col xs="12" sm="6">
                    <label htmlFor="is_active">¿Activo?</label>
                    <ApiFormChoiceField
                      name="is_active"
                      id="is_active"
                      choices={booleanChoices}
                      searchable={false}
                      onChange={this.state.apiFormFieldChangeHandler}
                      value={this.state.formValues.stores}/>
                  </Col>
                </Row>
              </div>
            </Card>
          </Col>
          <Col sm="12" className={`${displayUpdateFilter? '' : 'hidden-xs-up'}`}>
            <Card>
              <CardHeader>Filtros Extra</CardHeader>
              <div className="card-block">
                <Row className="entity-form-controls">
                  <Col xs="12" sm="6">
                    <label htmlFor="update_id">Banner Update</label>
                    <ApiFormRemoveOnlyListField
                      name="update_id"
                      id="update_id"
                      value={this.state.formValues.update_id}
                      onChange={this.state.apiFormFieldChangeHandler}
                      resource="banner_updates"/>
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
            data={this.state.banners}
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

export default connect(mapStateToProps)(BannerList);
