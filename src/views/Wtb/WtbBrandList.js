import React, {Component} from 'react';
import {FormattedMessage} from "react-intl";
import {NavLink} from "react-router-dom";

class WtbBrandList extends Component {
  render() {
    const wtbBrands = this.props.wtb_brands;

    return (
        <div className="animated fadeIn">
          <div className="row">
            <div className="col-12">
              <div className="card">
                <div className="card-header">
                  <FormattedMessage id="brands" defaultMessage="Brands" />
                </div>
                <div className="card-block">
                  <table className="table table-striped">
                    <thead>
                    <tr>
                      <th>
                        <FormattedMessage id="id" defaultMessage="ID"/>
                      </th>
                      <th>
                        <FormattedMessage id="name" defaultMessage="Name"/>
                      </th>
                    </tr>
                    </thead>

                    <tbody>

                    {wtbBrands.map(wtbBrand => (
                        <tr key={wtbBrand.id}>
                          <td>{wtbBrand.id}</td>
                          <td><NavLink to={`/wtb/brands/${wtbBrand.id}`}>{wtbBrand.name}</NavLink></td>
                        </tr>
                    ))}

                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>)
  }
}

export default WtbBrandList