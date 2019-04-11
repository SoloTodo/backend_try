import React from 'react'
import {connect} from "react-redux";
import {Card, CardHeader, Col, Row, Table} from "reactstrap";
import {
  apiResourceStateToPropsUtils,
  filterApiResourceObjectsByType
} from "../../react-utils/ApiResource";
import {formatDateStr, listToObject} from "../../react-utils/utils";
import Loading from "../../components/Loading";

class BannerUpdateLatest extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      updates: undefined
    }
  }

  componentDidMount() {
    this.props.fetchAuth('banner_updates/latest/').then(updatesDict => {
      const storesDict = listToObject(this.props.stores, 'url');
      const updates = Object.keys(updatesDict).map(storeUrl => ({
        store: storesDict[storeUrl],
        update: updatesDict[storeUrl]
      }));

      this.setState({
        updates
      })
    })
  }


  render() {
    if (!this.state.updates) {
      return <Loading />
    }

    const statusCodes = {
      1: 'En proceso',
      2: 'Exitoso',
      3: 'Error'
    };

    return <div className="animated fadeIn">
        <Row>
          <Col sm="12">
            <Card>
              <CardHeader>Últimas actualizaciones</CardHeader>
              <div className="card-block">
                <Table>
                  <thead>
                  <tr>
                    <th>Tienda</th>
                    <th>Estado</th>
                    <th>Fecha</th>
                    <th>Errores</th>
                  </tr>
                  </thead>
                  <tbody>
                  {this.state.updates.map(updateEntry => <tr key={updateEntry.store.id}>
                    <td>{updateEntry.store.name}</td>
                    <td>{updateEntry.update ? statusCodes[updateEntry.update.status] : 'N/A'}</td>
                    <td>{updateEntry.update ? formatDateStr(updateEntry.update.timestamp) : 'N/A'}</td>
                    <td>{updateEntry.update ? updateEntry.update.status_message || <em>N/A</em> : 'N/A'}</td>
                  </tr>)}
                  </tbody>
                </Table>
              </div>
            </Card>
          </Col>
        </Row>
    </div>
  }
}

function mapStateToProps(state) {
  const {fetchAuth} = apiResourceStateToPropsUtils(state);

  return {
    fetchAuth,
    stores: filterApiResourceObjectsByType(state.apiResourceObjects, 'stores')
  }
}

export default connect(mapStateToProps)(BannerUpdateLatest);
