import React, {Component} from 'react'
import {connect} from "react-redux";
import {addApiResourceStateToPropsUtils} from "../../ApiResource";
import {settings} from "../../settings";
import {FormattedMessage} from "react-intl";
import Loading from "../../components/Loading";
import {Link} from "react-router-dom";
import './DashboardBestSellingEntities.css'
import moment from "moment";

class DashboardBestSellingEntities extends Component {
  constructor(props) {
    super(props);

    this.state = {
      estimatedSales: undefined
    }
  }

  componentDidMount() {
    const oneWeekAgo = moment().subtract(2, 'days').startOf('day');

    this.props.fetchAuth(settings.apiResourceEndpoints.entities + 'estimated_sales/?grouping=entity&page_size=10&timestamp_0=' + oneWeekAgo.toISOString())
        .then(json => {
          const estimatedSalesPage = json.results.map(e => ({
            ...e,
            entity: this.props.ApiResourceObject(e.entity)
          }));

          this.setState({
            estimatedSales: estimatedSalesPage
          })
        })
  }

  render() {
    return (
        <div className="col-12">
          <div className="card">
            <div className="card-body card-block">
              <div className="row">
                <div className="col-12 col-sm-8">
                  <h4 className="mb-0 card-title">
                    <FormattedMessage id="best_selling_entities" defaultMessage="Best selling entities"/>
                  </h4>
                  <div className="small text-muted">
                    <FormattedMessage id="last_7_days" defaultMessage="Last 7 days"/>
                  </div>
                </div>
                <div className="col-12 col-sm-4 text-right">

                </div>
              </div>
              <div className="row">
                <div className="col-12">
                  {this.state.estimatedSales ? <ul className="icons-list mt-2" id="dashboard_best_selling_entities">
                    {this.state.estimatedSales.map(entry => (
                        <li key={entry.entity.id}>
                          <div className="desc">
                            <div className="title">
                              <Link to={'/entities/' + entry.entity.id}>{entry.entity.name}</Link>
                            </div>
                            <small>{entry.entity.store.name}</small>
                          </div>
                          <div className="value">
                            <div className="small text-muted">
                              <FormattedMessage id="units_sold" defaultMessage="Sold this week"/>
                            </div>
                            <strong>{entry.stock}</strong>
                          </div>
                        </li>
                    ))}
                  </ul> : <Loading />}
                </div>
              </div>
            </div>
          </div>
        </div>
    )
  }
}

export default connect(
    addApiResourceStateToPropsUtils(),
)(DashboardBestSellingEntities);

