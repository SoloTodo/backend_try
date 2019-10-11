import React from 'react'
import {connect} from 'react-redux'
import {Row, Col, Card, CardHeader} from 'reactstrap'
import {
  ApiForm,
  ApiFormChoiceField,
  ApiFormResultTableWithPagination,
  ApiFormRemoveOnlyListField,
  createOrderingOptionChoices, ApiFormDateRangeField
} from '../../react-utils/api_forms'
import {
  apiResourceStateToPropsUtils,
  filterApiResourceObjectsByType
} from "../../react-utils/ApiResource";
import {booleanChoices} from "../../utils";
import {formatDateStr} from "../../react-utils/utils";
import NavLink from "react-router-dom/es/NavLink";

import './BannerList.css'


class BannerList extends React.Component{
  constructor(props) {
    super(props);
    this.state = {
      formValues: {},
      banners: undefined
    };

    this.storeObject = {};
    for (const store of this.props.stores){
      this.storeObject[store.url] = store
    }
  }

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
        renderer: banner => <NavLink to={`/banner_assets/${banner.asset.id}`}>
          <img className="banner-preview img-fluid" src={banner.asset.picture_url} alt=""/>
        </NavLink>
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
        label: <div className='d-flex flex-row banner-content-container'>
          <div className="d-flex flex-column align-items-start banner-content-brand">Marca</div>
          <div className="d-flex flex-column align-items-start banner-content-category">Categoría</div>
          <div className="d-flex flex-column align-items-center banner-content-percentage">%</div>
        </div>,
        renderer: banner => {
          return banner.asset.total_percentage?
            <div>
              {banner.asset.contents.map(content =>
                <div className='d-flex flex-row banner-content-container'>
                  <div className="d-flex flex-column align-items-start banner-content-brand">{content.brand.name}</div>
                  <div className="d-flex flex-column align-items-start banner-content-category">{content.category.name}</div>
                  <div className="d-flex flex-column align-items-center banner-content-percentage">{`${content.percentage} %`}</div>
                </div>
              )}
            </div>
            : "Sin contenido"
        }
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
        onFormValueChange={this.handleFormValueChange}>
        <ApiFormChoiceField
          name='ordering'
          choices={createOrderingOptionChoices(['store', 'update__timestamp', 'subsection', 'position'])}
          initial='-update__timestamp'
          hidden={true}
          required={true} />
        <Row>
          <Col sm="12">
            <Card>
              <CardHeader>Filtros</CardHeader>
              <div className="card-block">
                <Row className="entity-form-controls">
                  <Col xs="12" sm="6">
                    <label htmlFor="brands">Marcas</label>
                    <ApiFormChoiceField
                      name="brands"
                      id="brand"
                      choices={this.props.brands}
                      multiple={true}
                      placeholder='Todas'/>
                  </Col>
                  <Col xs="12" sm="6">
                    <label htmlFor="categories">Categorías</label>
                    <ApiFormChoiceField
                      name="categories"
                      id="categories"
                      choices={this.props.categories}
                      multiple={true}
                      placeholder='Todas'/>
                  </Col>
                  <Col xs="12" sm="6">
                    <label htmlFor="stores">Tiendas</label>
                    <ApiFormChoiceField
                      name="stores"
                      id="stores"
                      choices={this.props.stores}
                      multiple={true}
                      placeholder='Todas'/>
                  </Col>
                  <Col xs="12" sm="6">
                    <label htmlFor="types">Tipos</label>
                    <ApiFormChoiceField
                      name="types"
                      id="types"
                      choices={this.props.banner_subsection_types}
                      multiple={true}
                      placeholder='Todas'/>
                  </Col>
                  <Col xs="12" sm="6">
                    <label htmlFor="is_active">¿Activo?</label>
                    <ApiFormChoiceField
                      name="is_active"
                      id="is_active"
                      choices={booleanChoices}
                      searchable={false} />
                  </Col>
                  <div className="col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6">
                    <label htmlFor="creation_date">Fecha creación (desde / hasta)</label>
                    <ApiFormDateRangeField
                      name="creation_date"
                      id="creation_date"
                      nullable={true}/>
                  </div>
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
                      resource="banner_updates"/>
                  </Col>
                </Row>
              </div>
            </Card>
          </Col>
        </Row>

        <Row>
          <Col sm="12">
            <ApiFormResultTableWithPagination
              page_size_choices={[10, 20, 50]}
              page={this.state.formValues.page}
              page_size={this.state.formValues.page_size}
              data={this.state.banners}
              columns={columns}
              ordering={this.state.formValues.ordering}/>
          </Col>
        </Row>
      </ApiForm>
    </div>
  }
}

function mapStateToProps(state) {
  const {ApiResourceObject} = apiResourceStateToPropsUtils(state);

  return {
    ApiResourceObject,
    stores: filterApiResourceObjectsByType(state.apiResourceObjects, 'stores'),
    brands: filterApiResourceObjectsByType(state.apiResourceObjects, 'brands'),
    categories: filterApiResourceObjectsByType(state.apiResourceObjects, 'categories'),
    banner_subsection_types: filterApiResourceObjectsByType(state.apiResourceObjects, 'banner_subsection_types')
  }
}

export default connect(mapStateToProps)(BannerList);
