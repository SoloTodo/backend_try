import React, { Component } from 'react';
import {FormattedMessage} from "react-intl";
import {settings} from "../../settings";
import {
  formatDateStr,
} from "../../react-utils/utils";
import {
  ApiForm,
  ApiFormResultsTable,
  ApiFormPaginationField,
  ApiFormChoiceField
} from "../../react-utils/api_forms";


class WtbBrandDetailUpdateLogs extends Component {
  constructor(props) {
    super(props);

    this.state = {
      formValues: {},
      apiFormFieldChangeHandler: undefined,
      updateLogs: undefined
    }
  }

  setApiFormFieldChangeHandler = apiFormFieldChangeHandler => {
    this.setState({
      apiFormFieldChangeHandler
    })
  };

  setUpdateLogs = json => {
    this.setState({
      updateLogs: json ? json.payload : null
    })
  };

  handleFormValueChange = formValues => {
    this.setState({formValues})
  };

  render() {
    const statusDict = {
      1: <FormattedMessage id="pending" defaultMessage={`Pending`} />,
      2: <FormattedMessage id="in_process" defaultMessage={`In process`} />,
      3: <FormattedMessage id="success" defaultMessage={`Success`} />,
      4: <FormattedMessage id="error" defaultMessage={`Error`} />
    };

    const columns = [
      {
        label: <FormattedMessage id="status" defaultMessage={`Status`} />,
        renderer: entry => statusDict[entry.status]
      },
      {
        label: <FormattedMessage id="last_update" defaultMessage={`Last update`} />,
        renderer: entry => formatDateStr(entry.lastUpdated)
      },
      {
        label: <FormattedMessage id="start" defaultMessage={`Start`} />,
        renderer: entry => formatDateStr(entry.creationDate),
        cssClasses: 'hidden-sm-down'
      },
      {
        label: <FormattedMessage id="log" defaultMessage={`Log`} />,
        renderer: entry => entry.registryFile ?
            <a href={entry.registryFile} target="_blank"><FormattedMessage id="download" defaultMessage={`Download`} /></a> :
            <FormattedMessage id="unavailable" defaultMessage={`Unavailable`} />,
        cssClasses: 'hidden-md-down'
      }
    ];

    return (
        <div className="animated fadeIn">
          <ApiForm
              endpoints={[settings.apiResourceEndpoints.wtb_brand_update_logs + '?brand=' + this.props.apiResourceObject.id]}
              fields={['page', 'page_size']}
              onResultsChange={this.setUpdateLogs}
              onFormValueChange={this.handleFormValueChange}
              setFieldChangeHandler={this.setApiFormFieldChangeHandler}>

            <ApiFormChoiceField
                name="page_size"
                choices={[{id: '5', name: '5'}]}
                required={true}
                hidden={true}
                onChange={this.state.apiFormFieldChangeHandler}
                value={this.state.formValues.page_size}
                urlField={null}
            />

            <div className="row">
              <div className="col-12">
                <div className="card">
                  <div className="card-header">
                    <FormattedMessage id="update_logs" defaultMessage={`Update logs`} />
                  </div>
                  <div className="card-block">
                    <div className="mb-3 float-right">
                      <ApiFormPaginationField
                          page={this.state.formValues.page}
                          pageSize={this.state.formValues.page_size}
                          resultCount={this.state.updateLogs && this.state.updateLogs.count}
                          onChange={this.state.apiFormFieldChangeHandler}
                      />
                    </div>

                    <ApiFormResultsTable
                        results={this.state.updateLogs && this.state.updateLogs.results}
                        columns={columns}
                        onChange={this.state.apiFormFieldChangeHandler}
                    />
                  </div>
                </div>
              </div>
            </div>
          </ApiForm>
        </div>
    )
  }
}

export default WtbBrandDetailUpdateLogs;