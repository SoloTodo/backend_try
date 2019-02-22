import React from 'react'
import {Row, Col, Card, CardHeader} from 'reactstrap'
import {
  ApiForm,
  ApiFormChoiceField,
  ApiFormResultTableWithPagination,
} from "../../react-utils/api_forms";
import {booleanChoices} from "../../utils";
import {formatDateStr} from "../../react-utils/utils";
import NavLink from "react-router-dom/es/NavLink";

class BannerAssetList extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      formValues: {},
      apiFormFieldChangeHandler: undefined,
      assets: undefined
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

  setAssets = json => {
    this.setState({
      assets: json? json.payload : null
    })
  };

  render() {
    const columns = [
      {
        label: 'Id',
        renderer: asset => <NavLink to={`banner_assets/${asset.id}`}>{asset.id}</NavLink>
      },
      {
        label: 'Key',
        renderer: asset => asset.key
      },
      {
        label: 'Imagen',
        renderer: asset => <a href={asset.pictureUrl} target="_blank" rel="noopener noreferrer">Imagen</a>
      },
      {
        label: 'Fecha Creación',
        renderer: asset => formatDateStr(asset.creationDate)
      },
      {
        label: '¿Activo?',
        renderer: asset => asset.isActive? 'Sí' : 'No'
      },
      {
        label: 'Completitud',
        renderer: asset => `${asset.totalPercentage || 0} %`
      }
    ];

    return <div className="animated fadeIn">
      <ApiForm
        endpoints={['banner_assets/']}
        fields={['is_active', 'is_complete']}
        onResultsChange={this.setAssets}
        onFormValueChange={this.handleFormValueChange}
        setFieldChangeHandler={this.setApiFormFieldChangeHandler}>

        <Row>
          <Col sm="12">
            <Card>
              <CardHeader>Filtros</CardHeader>
              <div className="card-block">
                <Row className="entity-form-controls">
                  <Col xs="12" sm="6">
                    <label htmlFor="is_active">¿Activo?</label>
                    <ApiFormChoiceField
                      name="is_active"
                      id="is_active" choices={booleanChoices}
                      searchable={false}
                      onChange={this.state.apiFormFieldChangeHandler}
                      value={this.state.formValues.is_active}/>
                  </Col>
                  <Col xs="12" sm="6">
                    <label htmlFor="is_complete">¿Completo?</label>
                    <ApiFormChoiceField
                      name="is_complete"
                      id="is_complete" choices={booleanChoices}
                      searchable={false}
                      onChange={this.state.apiFormFieldChangeHandler}
                      value={this.state.formValues.is_complete}/>
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
            page_size_choices={[50, 100, 200]}
            page={this.state.formValues.page}
            page_size={this.state.formValues.page_size}
            data = {this.state.assets}
            onChange={this.state.apiFormFieldChangeHandler}
            columns={columns}/>
        </Col>
      </Row>

    </div>
  }
}

export default BannerAssetList