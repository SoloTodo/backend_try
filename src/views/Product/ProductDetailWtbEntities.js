import React, {Component} from 'react'
import connect from "react-redux/es/connect/connect";
import {
  ApiFormResultsTable
} from "../../react-utils/api_forms";
import moment from "moment";
import {settings} from "../../settings";
import Loading from "../../components/Loading";
import {FormattedMessage, injectIntl} from "react-intl";
import {NavLink} from "react-router-dom";
import {backendStateToPropsUtils} from "../../utils";
import {apiResourceStateToPropsUtils} from "../../react-utils/ApiResource";

class ProductDetailWtbEntities extends Component {
  initialState = {
    wtb_entities: undefined
  };

  constructor(props) {
    super(props);
    this.state = {...this.initialState}
  }

  componentDidMount() {
    this.componentUpdate(this.props.apiResourceObject)
  }

  componentWillReceiveProps(nextProps) {
    const currentProduct = this.props.apiResourceObject;
    const nextProduct = nextProps.apiResourceObject;

    if (currentProduct.id !== nextProduct.id) {
      this.setState(this.initialState, () => this.componentUpdate(nextProduct));
    }
  }

  componentUpdate(product) {
    const wtb_url = settings.apiResourceEndpoints.wtb_entities;
    this.props.fetchAuth(`${wtb_url}?products=${product.id}`)
      .then(result => {
        const wtb_entities = result['results'];
        wtb_entities.sort((a, b) => moment(a.last_update).isBefore(moment(b.last_update)));
        this.setState({
          wtb_entities
        })
      })
  }

  render() {
    if (!this.state.wtb_entities) {
      return <Loading />
    }

    const columns = [
      {
        label: <FormattedMessage id="id" defaultMessage="ID"/>,
        renderer: entity => <NavLink to={`/wtb/entities/${entity.id}`}>{entity.id}</NavLink>
      },
      {
        label: <FormattedMessage id="key" defaultMessage="Key"/>,
        renderer: entity => entity.key
      },
      {
        label: <FormattedMessage id="name" defaultMessage="Name"/>,
        renderer: entity => <span>
          <a href={entity.externalUrl} target="_blank" rel="noopener noreferrer">
            {entity.name}
          </a>
        </span>
      },
      {
        label: <FormattedMessage id="category" defaultMessage="Category"/>,
        renderer: entity => entity.category.name
      },
      {
        label: <FormattedMessage id="brand" defaultMessage="Brand"/>,
        renderer: entity => entity.brand.name
      },
      {
        label: <FormattedMessage id="is_visible" defaultMessage="Visible?"/>,
        renderer: entity => entity.isVisible? 'Sí': 'No'
      },
      {
        label: <FormattedMessage id="is_active" defaultMessage="¿Activo?"/>,
        renderer: entity => entity.isActive? 'Sí': 'No'
      },
      {
        label: <FormattedMessage id="creation_date" defaultMessage="Creation date"/>,
        renderer: entity => moment(entity.creationDate).format('lll')
      },
      {
        label: <FormattedMessage id="last_update" defaultMessage="Last update"/>,
        renderer: entity => moment(entity.lastUpdated).format('lll')
      }
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
                      results={this.state.wtb_entities}
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

function mapStateToProps(state) {
  const {fetchAuth} = apiResourceStateToPropsUtils(state);
  const {formatCurrency} = backendStateToPropsUtils(state);

  return {
    fetchAuth,
    formatCurrency
  }
}

export default injectIntl(connect(mapStateToProps)(ProductDetailWtbEntities));