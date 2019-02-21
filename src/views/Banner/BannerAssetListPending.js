import React from 'react'
import {Row, Col, Card, CardHeader} from 'reactstrap'
import {
  ApiForm, ApiFormChoiceField,
  ApiFormResultsTable,
  createOrderingOptionChoices,
} from "../../react-utils/api_forms";
import {formatDateStr} from "../../react-utils/utils";
import NavLink from "react-router-dom/es/NavLink";

class BannerAssetListPending extends React.Component {
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
        ordering: 'id',
        renderer: asset => <NavLink to={`/banner_assets/${asset.id}`}>{asset.id}</NavLink>
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
      }
    ];

    return <div className="animated fadeIn">
      <ApiForm
        endpoints={['banner_assets/?is_active=1&is_complete=0']}
        fields={['ordering']}
        onResultsChange={this.setAssets}
        onFormValueChange={this.handleFormValueChange}
        setFieldChangeHandler={this.setApiFormFieldChangeHandler}>
        <ApiFormChoiceField
          name='ordering'
          choices={createOrderingOptionChoices(['id'])}
          hidden={true}
          required={true}
          value={this.state.formValues.ordering}
          onChange={this.state.apiFormFieldChangeHandler}/>
      </ApiForm>
      <Row>
        <Col sm="12">
          <Card>
            <CardHeader>Banners Assets</CardHeader>
            <div className="card-block">
              <ApiFormResultsTable
                results = {this.state.assets}
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

export default BannerAssetListPending