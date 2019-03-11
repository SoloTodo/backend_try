import React from 'react'
import {connect} from "react-redux";
import Select from "react-select";
import {toast} from "react-toastify";
import {Container, Row, Col, Card, CardHeader, Table, Button, Input,
  Modal, ModalHeader, ModalBody, ModalFooter} from 'reactstrap'
import {
  apiResourceStateToPropsUtils,
  filterApiResourceObjectsByType
} from "../../react-utils/ApiResource";
import './BannerAssetDetail.css'
import {createOption} from "../../react-utils/form_utils";
import {settings} from "../../settings";
import {NavLink} from 'react-router-dom'
import {formatDateStr} from "../../react-utils/utils";

class BannerAssetDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      addContentModalIsActive: false,
      selectedBrand:undefined,
      selectedCategory:undefined,
      inputPercentage:undefined,
      banners: undefined
    };
  }

  componentDidMount() {
    this.props.fetchAuth(`banners/?ordering=-id&asset=${this.props.apiResourceObject.id}`).then(json => {
      this.setState({
        banners: json.results
      })
    })
  }

  toggleAddContentModal = () => {
    this.setState({
      addContentModalIsActive: !this.state.addContentModalIsActive
    })
  };

  handleBrandChange = (selectedBrand) => {
    this.setState({
      selectedBrand
    })
  };

  handleCategoryChange = (selectedCategory) => {
    this.setState({
      selectedCategory
    })
  };

  handlePercentageChange = (percentage) => {
    this.setState({
      inputPercentage: percentage.target.value
    })
  };

  handleAddContentButtonClick = () => {
    const formData = JSON.stringify({
      brand: this.state.selectedBrand.option.id,
      category: this.state.selectedCategory.option.id,
      percentage: this.state.inputPercentage
    });

    this.props.fetchAuth(`${settings.apiResourceEndpoints.banner_assets}${this.props.apiResourceObject.id}/add_content/`, {
      method: 'POST',
      body: formData
    }).then(json => {
      this.props.updateAsset(json);
      this.setState({
        selectedBrand: null,
        selectedCategory: null,
        inputPercentage: null
      });
      toast.success('Contenido agregado exitosamente')
    }).catch(async error => {
      const jsonError = await error.json();
      toast.error(jsonError.errors.percentage[0])
    });
    this.toggleAddContentModal()
  };

  handleDeleteContentButtonClick = id => {
    const formData = JSON.stringify({
      id
    });

    this.props.fetchAuth(`${settings.apiResourceEndpoints.banner_assets}${this.props.apiResourceObject.id}/delete_content/`,{
      method: 'POST',
      body:formData
    }).then(json => {
      this.props.updateAsset(json);
      toast.success('Contenido eliminado exitosamente')
    }).catch(async error => {
      const jsonError = await error.json();
      toast.error(jsonError.error)
    });
  };

  handleEnterKeyPress = e => {
    if(e.key === 'Enter'){
      if(!this.state.selectedBrand || !this.state.selectedCategory || !this.state.inputPercentage){
        return
      }
      this.handleAddContentButtonClick()
    }
  };

  render() {
    const bannerAsset = this.props.apiResourceObject;

    return <div className="animated fadeIn">
      <Row>
        <Col sm="12">
          <Card>
            <CardHeader>Banner</CardHeader>
            <div className="card-block">
              <img className="banner-img" src={bannerAsset.picture_url} alt="Banner"/>
            </div>
          </Card>
        </Col>
        <Col sm="12">
          <Card>
            <CardHeader className="d-flex justify-content-between card-header-with-button">
              <span>Contenidos</span>
              {bannerAsset.is_complete?
                <span>
                  <Button color="success" disabled><i className="fas fa-check"/> Completo!</Button>
                  <NavLink to="/banner_assets/pending" className='btn btn-info ml-2'>Ver pendientes</NavLink>
                </span>:
                <Button color="success" onClick={this.toggleAddContentModal}><i className="fas fa-plus"/> Agregar</Button>
              }
            </CardHeader>
            <div className="card-block">
              <Table striped responsive>
                <thead>
                <tr>
                  <th>Marca</th>
                  <th>Categoría</th>
                  <th>Porcentaje</th>
                  <th>Eliminar</th>
                </tr>
                </thead>
                <tbody>
                {bannerAsset.contents.map(content => <tr key={content.id}>
                  <td>{content.brand.name}</td>
                  <td>{content.category.name}</td>
                  <td>{content.percentage}</td>
                  <td><Button color="danger" onClick={() => this.handleDeleteContentButtonClick(content.id)}><i className="fas fa-trash"/> Eliminar</Button></td>
                </tr>)}
                <tr>
                  <th colSpan="2">Total</th>
                  <th colSpan="2">{bannerAsset.contents.reduce((previous, current) => {
                    return {"percentage": previous.percentage + current.percentage}
                  }, {"percentage": 0})['percentage']}
                  </th>
                </tr>
                </tbody>
              </Table>
            </div>
          </Card>
        </Col>
        <Col sm="12">
          <Card>
            <CardHeader>
              Banners
            </CardHeader>
            <div className="card-block">
              {this.state.banners?
                <Table striped responsive>
                  <thead>
                  <tr>
                    <th>Tienda</th>
                    <th>Subsección</th>
                    <th>Destino</th>
                    <th>¿Activo?</th>
                    <th>Posición</th>
                    <th>Fecha creación</th>
                  </tr>
                  </thead>
                  <tbody>
                  {this.state.banners.map(banner => <tr key={banner.id}>
                    <td>{this.props.stores.filter(store => store.url === banner.update.store)[0].name}</td>
                    <td><a href={banner.external_url} target="_blank" rel="noopener noreferrer">{banner.subsection.section.name}>{banner.subsection.name}</a></td>
                    <td>{banner.destination_url_list.length? <ul className="list-without-decoration mb-0">{banner.destination_url_list.map(url =>
                      <li key={url}><a href={url} target="_blank" rel="noopener noreferrer">Link</a></li>
                    )}</ul> : 'Sin link'}</td>
                    <td>{banner.update.is_active? 'Sí' : 'No'}</td>
                    <td>{banner.position}</td>
                    <td>{formatDateStr(banner.update.timestamp)}</td>
                  </tr>)}
                  </tbody>
                </Table>:
                'Loading ...'
              }

            </div>
          </Card>
        </Col>
      </Row>
      <Modal centered id="add_content" isOpen={this.state.addContentModalIsActive} toggle={this.toggleAddContentModal} size="lg">
        <ModalHeader>Agregar Contenido</ModalHeader>
        <ModalBody>
          <Container>
            <Row>
              <Col sm="6">
                <label htmlFor="brand_select">Marca</label>
                <Select
                  id="brand_select"
                  options={this.props.brands.map(brand => createOption(brand))}
                  value={this.state.selectedBrand}
                  onChange={this.handleBrandChange}/>
              </Col>
              <Col sm="6">
                <label htmlFor="category_select">Categoría</label>
                <Select
                  id="category_select"
                  options={this.props.categories.map(category => createOption(category))}
                  value={this.state.selectedCategory}
                  onChange={this.handleCategoryChange} />
              </Col>
              <Col sm="6">
                <label htmlFor="percentage_input">Porcentaje</label>
                <Input onChange={this.handlePercentageChange} onKeyPress={this.handleEnterKeyPress} type="number" name="percentage" id="percentage_input"/>
              </Col>
            </Row>
          </Container>
        </ModalBody>
        <ModalFooter>
          <Button disabled={!this.state.selectedBrand || !this.state.selectedCategory || !this.state.inputPercentage} color="primary" onClick={this.handleAddContentButtonClick}><i className="fas fa-plus"/> Agregar Contenido</Button>
          <Button color="danger" onClick={this.toggleAddContentModal}>Cancelar</Button>
        </ModalFooter>
      </Modal>
    </div>
  }
}

function mapStateToProps(state) {
  const {fetchAuth} = apiResourceStateToPropsUtils(state);

  return {
    fetchAuth,
    categories: filterApiResourceObjectsByType(state.apiResourceObjects, 'categories'),
    brands: filterApiResourceObjectsByType(state.apiResourceObjects, 'brands'),
    stores: filterApiResourceObjectsByType(state.apiResourceObjects, 'stores'),
  }
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
    updateAsset: bannerAsset => {
      dispatch({
        type: 'updateApiResourceObject',
        apiResourceObject: bannerAsset
      });
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(BannerAssetDetail)
