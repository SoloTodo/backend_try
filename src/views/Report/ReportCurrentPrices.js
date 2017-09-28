import React, {Component} from 'react'
import {FormattedMessage} from "react-intl";
import LaddaButton from "react-ladda";
import {connect} from "react-redux";
import {addApiResourceStateToPropsUtils} from "../../ApiResource";
import {settings} from "../../settings";

class ReportCurrentPrices extends Component {
  constructor(props) {
    super(props);

    this.state = {
      downloadLink: undefined
    }
  }

  handleClick = evt => {
    this.setState({
      downloadLink: null
    });

    this.props.fetchAuth(settings.apiResourceEndpoints.reports + 'current_prices/')
        .then(downloadLink => {
          window.open(downloadLink.url);

          this.setState({
            downloadLink
          })
        })
  };

  render() {
    return <div className="animated fadeIn d-flex flex-column">
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <FormattedMessage id="parameters" defaultMessage="Parameters" />
            </div>
            <div className="card-block">
              <div className="row">
                <div className="col-12 col-sm-12 col-md-12 col-lg-8 col-xl-6">
                  <p>
                    Descarga el reporte de precios actuales para la categoría seleccionada
                  </p>

                  <LaddaButton
                      loading={this.state.downloadLink === null}
                      onClick={this.handleClick}
                      className="btn btn-primary">
                    {this.state.downloadLink === null ?
                        <FormattedMessage id="downloading_report" defaultMessage="Downloading"/> :
                        <FormattedMessage id="download_report" defaultMessage="Download report"/>
                    }
                  </LaddaButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  }
}

export default connect(
    addApiResourceStateToPropsUtils()
)(ReportCurrentPrices);
