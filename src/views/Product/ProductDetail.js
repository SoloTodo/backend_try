import React, {Component} from 'react'

class ProductDetail extends Component {
  render() {
    return (
        <div>
          <h1>{this.props.apiResourceObject.name}</h1>
          <img src={this.props.apiResourceObject.picture_url} />
        </div>
    )
  }
}

export default ProductDetail;