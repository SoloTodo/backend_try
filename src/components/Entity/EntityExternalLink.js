import React, {Component} from 'react'
import {Link} from "react-router-dom";

export default class EntityExternalLink extends Component {
  render() {
    const entity = this.props.entity;

    return <div>
      <Link to={'/entities/' + entity.id}>
        {this.props.label}
      </Link>
      <a href={entity.external_url} target="_blank" className="ml-2">
        <span className="glyphicons glyphicons-link">&nbsp;</span>
      </a>
    </div>
  }
}