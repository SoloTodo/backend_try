import React from 'react'
import {Row, Col} from 'reactstrap'
import {
  ApiForm, ApiFormChoiceField,
  ApiFormResultTableWithPagination,
  createOrderingOptionChoices,
} from "../../react-utils/api_forms";
import {formatDateStr} from "../../react-utils/utils";
import {NavLink} from "react-router-dom";

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
        renderer: asset => asset.id
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
        label: 'Completitud',
        renderer: asset => `${asset.totalPercentage || 0} %`
      },
      {
        label: 'Completar',
        renderer: asset => <NavLink to={`/banner_assets/${asset.id}`} className="btn btn-secondary">Completar</NavLink>
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
          <ApiFormResultTableWithPagination
            page_size_choices={[50, 100, 200]}
            page={this.state.formValues.page}
            page_size={this.state.formValues.page_size}
            data = {this.state.assets}
            onChange={this.state.apiFormFieldChangeHandler}
            columns={columns}
            ordering={this.state.formValues.ordering}/>
        </Col>
      </Row>
    </div>
  }
}

export default BannerAssetListPending