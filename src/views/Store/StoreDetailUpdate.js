import React, { Component } from 'react';
import {connect} from "react-redux";
import {addApiResourceStateToPropsUtils} from "../../ApiResource";
import {FormattedMessage} from "react-intl";
import StoreDetailMenu from "./StoreDetailMenu";



class StoreDetailUpdate extends Component {
  constructor(props) {
    super(props);
    this.state = {
      formData: {}
    }
  }

  componentDidMount() {
    const store = this.props.ApiResource(this.props.resourceObject);

    this.props.fetchAuth(`${store.url}update_prices/`).then(formData => {
      this.setState({
        formData
      })
    })
  }

  render() {
    const store = this.props.ApiResource(this.props.resourceObject);
    const formData = this.state.formData;

    return (
        <div className="animated fadeIn">
          <div className="row">
            <div className="col-sm-6 col-md-4">
              <div className="card">
                <div className="card-header"><strong><FormattedMessage id="update" defaultMessage={`Update`} /></strong></div>
                <div className="card-block">
                  <div className="row">
                    <div className="col-sm-12">
                      <div className="form-group">
                        <label htmlFor="name">Name</label>
                        <input type="text" className="form-control" id="name" placeholder="Enter your name"/>
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-sm-12">
                      <div className="form-group">
                        <label htmlFor="ccnumber">Credit Card Number</label>
                        <input type="text" className="form-control" id="ccnumber" placeholder="0000 0000 0000 0000"/>
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="form-group col-sm-4">
                      <label htmlFor="ccmonth">Month</label>
                      <select className="form-control" id="ccmonth">
                        <option>1</option>
                        <option>2</option>
                        <option>3</option>
                        <option>4</option>
                        <option>5</option>
                        <option>6</option>
                        <option>7</option>
                        <option>8</option>
                        <option>9</option>
                        <option>10</option>
                        <option>11</option>
                        <option>12</option>
                      </select>
                    </div>
                    <div className="form-group col-sm-4">
                      <label htmlFor="ccyear">Year</label>
                      <select className="form-control" id="ccyear">
                        <option>2014</option>
                        <option>2015</option>
                        <option>2016</option>
                        <option>2017</option>
                        <option>2018</option>
                        <option>2019</option>
                        <option>2020</option>
                        <option>2021</option>
                        <option>2022</option>
                        <option>2023</option>
                        <option>2024</option>
                        <option>2025</option>
                      </select>
                    </div>
                    <div className="col-sm-4">
                      <div className="form-group">
                        <label htmlFor="cvv">CVV/CVC</label>
                        <input type="text" className="form-control" id="cvv" placeholder="123"/>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <StoreDetailMenu store={store} />
          </div>
        </div>
  )
  }
  }

  export default connect(addApiResourceStateToPropsUtils())(StoreDetailUpdate);