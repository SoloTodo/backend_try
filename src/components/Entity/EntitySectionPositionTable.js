import React from 'react'
import {connect} from "react-redux";

import {apiResourceStateToPropsUtils} from "../../react-utils/ApiResource";

class EntitySectionPositionTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      entityPositions: undefined
    }
  }

  userHasPositionPermissions = entity => {
    return entity.store.permissions.includes('view_store_entity_positions')
      && entity.category.permissions.includes('view_category_entity_positions')
  };

  componentDidMount() {
    if (this.userHasPositionPermissions(this.props.entity)) {
      const entity = this.props.entity;
      const positionEndpoint = `entity_section_positions/?entities=${entity.id}&is_active=1`;
      this.props.fetchAuth(positionEndpoint).then(json => {
        this.setState({
          entityPositions: json.results
        })
      })
    }
  }

  render() {
    if (!this.state.entityPositions) {
      return null;
    }

    let content;

    if (this.props.entity.activeRegistry) {
      if (this.state.entityPositions.length) {
        content = <table className="table table-striped">
          <thead>
          <tr>
            <th>Sección</th>
            <th>Posición</th>
          </tr>
          </thead>
          <tbody>
          {this.state.entityPositions.map(position =>
            <tr key={position.id}>
              <td>{position.section.name}</td>
              <td>{position.value}</td>
            </tr>
          )}
          </tbody>
        </table>
      } else {
        content = <em>Esta entidad no contiene información de posicionamiento.</em>
      }
    } else {
      content = <em>Esta entidad no esta activa actualmente.</em>
    }

    return <div className="card">
      <div className="card-header"> Posicionamiento actual</div>
      <div className="card-block">
        {content}
      </div>
    </div>
  }
}

function mapStateToProps(state) {
  const {fetchAuth} = apiResourceStateToPropsUtils(state);

  return {
    fetchAuth,
  }
}

export default connect(mapStateToProps)(EntitySectionPositionTable);