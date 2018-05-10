import React, {Component} from 'react'
import ReactTable from 'react-table'

import 'react-table/react-table.css'
import Loading from "../../components/Loading";
import connect from "react-redux/es/connect/connect";
import {
  filterApiResourceObjectsByType
} from "../../react-utils/ApiResource";


class CategoryDetailBrowseResult extends Component {
  render() {
    if (!this.props.data) {
      return <Loading />
    }

    const data = this.props.data;

    const columns = [
      {
        Header: 'Producto',
        id: 'product_name',
        accessor: d => d.product.name
      },
      {
        Header: 'Plan celular',
        id: 'cell_plan',
        accessor: d => d.cell_plan ? d.cell_plan.name : 'N/A'
      }
    ];

    const storeUrlsSet = new Set();

    for (const entry of data) {
      for (const entity of entry.entities) {
        storeUrlsSet.add(entity.store)
      }
    }

    const stores = this.props.stores.filter(store => storeUrlsSet.has(store.url))

    for (const store of stores) {
      columns.push({
        Header: store.name,
        id: store.name,
        accessor: 'entities',
        Cell: entitiesData => {
          return <div>
            {entitiesData.value.filter(entity => entity.store === store.url).map(entity => <div key={entity.id}>
              {entity.active_registry.normal_price}
            </div>)}
          </div>
        }
      })
    }

    return <ReactTable
        data={data}
        columns={columns}
    />
  }
}

function mapStateToProps(state) {
  return {
    stores: filterApiResourceObjectsByType(state.apiResourceObjects, 'stores'),
  }
}

export default connect(mapStateToProps)(CategoryDetailBrowseResult);
