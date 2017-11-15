import React, {Component} from 'react'
import connect from "react-redux/es/connect/connect";
import {addApiResourceStateToPropsUtils} from "../../ApiResource";
import moment from "moment";
import Loading from "../../components/Loading";
import {FormattedMessage} from "react-intl";
import ApiFormResultsTable from "../../api_forms/ApiFormResultsTable";
import {NavLink} from "react-router-dom";

class ProductDetailEntities extends Component {
  constructor(props) {
    super(props);

    this.state = {
      entities: undefined
    }
  }

  componentDidMount() {
    this.props
        .fetchAuth(this.props.apiResourceObject.url + 'entities/')
        .then(entities => {
          entities.sort((a, b) => moment(a.last_pricing_update).isBefore(moment(b.last_pricing_update)));

          this.setState({
            entities
          })
        })
  }

  render() {
    if (!this.state.entities) {
      return <Loading />
    }

    const columns = [
      {
        label: <FormattedMessage id="id" defaultMessage="ID"/>,
        renderer: entity => entity.id
      },
      {
        label: <FormattedMessage id="name" defaultMessage="Name"/>,
        renderer: entity => <NavLink to={`/entities/${entity.id}`}>{entity.name}</NavLink>
      },
      {
        label: <FormattedMessage id="store" defaultMessage="Store"/>,
        renderer: entity => <span>
          <NavLink to={`/stores/${entity.store.id}`}>{entity.store.name}</NavLink>
          <a href={entity.externalUrl} target="_blank" className="ml-2">
            <span className="glyphicons glyphicons-link">&nbsp;</span>
          </a>
        </span>
      },
      {
        label: <FormattedMessage id="sku" defaultMessage="SKU"/>,
        renderer: entity => entity.sku || <em>N/A</em>
      },
      {
        label: <FormattedMessage id="part_number" defaultMessage="Part Number"/>,
        displayFilter: entities => entities.some(entity => entity.partNumber),
        renderer: entity => entity.partNumber || <em>N/A</em>
      },
        {
        label: <FormattedMessage id="ean" defaultMessage="EAN"/>,
        displayFilter: entities => entities.some(entity => entity.ean),
        renderer: entity => entity.ean || <em>N/A</em>
      },
      {
        label: <FormattedMessage id="cell_plan_name" defaultMessage="Cell plan name"/>,
        displayFilter: entities => entities.some(entity => entity.cellPlanName),
        renderer: entity => entity.cellPlanName || <em>N/A</em>
      },
      {
        label: <FormattedMessage id="cell_plan" defaultMessage="Cell plan"/>,
        displayFilter: entities => entities.some(entity => entity.cellPlan),
        renderer: entity => entity.cellPlan ? <NavLink to={`/products/${entity.cellPlan.id}`}>{entity.cellPlan.name}</NavLink> : <em>N/A</em>
      },
        {
        label: <FormattedMessage id="last_update" defaultMessage="Last update"/>,
        renderer: entity => moment(entity.lastPricingUpdate).format('lll')
      },
      {
        label: <FormattedMessage id="is_available_short_question" defaultMessage="Avail?" />,
        renderer: entity => <i className={entity.activeRegistry && entity.activeRegistry.is_available ?
            'glyphicons glyphicons-check' :
            'glyphicons glyphicons-unchecked' }/>,
        cssClasses: 'center-aligned',
      },
      {
        label: <FormattedMessage id="is_active_short_question" defaultMessage="Act?" />,
        renderer: entity => <i className={entity.activeRegistry ?
            'glyphicons glyphicons-check' :
            'glyphicons glyphicons-unchecked'}/>,
        cssClasses: 'center-aligned',
      },
        {
        label: <FormattedMessage id="currency" defaultMessage="Currency" />,
        renderer: entity => entity.currency.isoCode,
      },
      {
        label: <FormattedMessage id="normal_price" defaultMessage="Normal price" />,
        renderer: entity => entity.activeRegistry ?
            this.props.formatCurrency(entity.activeRegistry.normal_price) :
            <em>N/A</em>,
        cssClasses: 'right-aligned',
      },
      {
        label: <FormattedMessage id="offer_price" defaultMessage="Offer price" />,
        renderer: entity => entity.activeRegistry ?
            this.props.formatCurrency(entity.activeRegistry.offer_price) :
            <em>N/A</em>,
        cssClasses: 'right-aligned',
      },
        {
        label: <FormattedMessage id="cell_monthly_payment" defaultMessage="Cell monthly payment" />,
          displayFilter: entities => entities.some(entity => entity.activeRegistry && entity.activeRegistry.cell_monthly_payment),
        renderer: entity => entity.activeRegistry && entity.activeRegistry.cell_monthly_payment ?
            this.props.formatCurrency(entity.activeRegistry.cell_monthly_payment) :
            <em>N/A</em>,
        cssClasses: 'right-aligned',
      },
    ];

    return (
        <div className="animated fadeIn">
          <div className="row">
            <div className="col-12">
              <div className="card">
                <div className="card-header">
                  <FormattedMessage id="entities" defaultMessage="Entities" />
                </div>
                <div className="card-block">
                  <ApiFormResultsTable
                      results={this.state.entities}
                      columns={columns}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
    )
  }
}

export default connect(
    addApiResourceStateToPropsUtils())(ProductDetailEntities);