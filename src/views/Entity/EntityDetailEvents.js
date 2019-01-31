import React, { Component } from 'react';
import {connect} from "react-redux";
import {
  apiResourceStateToPropsUtils
} from "../../react-utils/ApiResource";
import {FormattedMessage, injectIntl} from "react-intl";
import {NavLink} from "react-router-dom";
import { Markdown } from 'react-showdown';
import Loading from "../../components/Loading";
import {formatDateStr} from "../../react-utils/utils";
import messages from "../../messages";
import './EntityDetailEvents.css'


class EntityDetailEvents extends Component {
  initialState = {
    events: undefined
  };

  constructor(props) {
    super(props);
    this.state = {...this.initialState}
  }

  componentDidMount() {
    this.componentUpdate(this.props.apiResourceObject);
  }

  componentWillReceiveProps(nextProps) {
    const currentEntity = this.props.apiResourceObject;
    const nextEntity = nextProps.apiResourceObject;

    if (currentEntity.id !== nextEntity.id) {
      this.setState(this.initialState, () => this.componentUpdate(nextEntity))
    }
  }

  componentUpdate(entity) {
    this.props.fetchAuth(`${entity.url}events/`).then(
        json => this.setState({events: json})
    )
  }

  static fieldValueToComponent(field, value) {
    if (['category', 'scraped_category', 'currency', 'state'].includes(field)) {
      return value.name
    } else if (['product', 'cell_plan'].includes(field)) {
      return value ? <NavLink to={`/products/${value.id}`}>{value.name}</NavLink> : <em>N/A</em>
    } else if (['url', 'discovery_url'].includes(field)) {
      return <a className="url-link" href={value} target="_blank" rel="noopener noreferrer">{value || <em>N/A</em>}</a>
    } else if (field === 'description') {
      return <div className="description-container"><Markdown markup={ value } tables={true} /></div>
    } else if (field === 'is_visible') {
      return value ? messages.yes : messages.no
    } else if (field === 'picture_urls') {
      if (value) {
        return <ul>
          {JSON.parse(value).map(pictureUrl =>
            <li key={pictureUrl}><a href={pictureUrl} target="_blank" rel="noopener noreferrer">{pictureUrl}</a></li>
          )}
        </ul>
      } else {
        return <em>N/A</em>
      }
    }

    return value
  }

  render() {
    if (!this.state.events) {
      return <Loading />
    }

    return (
        <div className="animated fadeIn">
          <div className="row">

            {!this.state.events.length &&
            <div className="col-12 col-sm-8 col-md-6 col-lg-6">
              <div className="card" >
                <div className="card-header"><FormattedMessage id="no_events_found" defaultMessage={`No events found`} /></div>
                <div className="card-block">
                  <FormattedMessage id="no_events_found_description" defaultMessage={`This entity dooesn't have any events`} />
                </div>
              </div>
            </div>
            }

            {this.state.events.map((event, idx) => (
                <div key={idx} className="col-12">
                  <div className="card" >
                    <div className="card-header">{formatDateStr(event.timestamp)}</div>
                    <div className="card-block">
                      <strong><FormattedMessage id="user" defaultMessage={`User`} />:</strong> {event.user.full_name}

                      {event.changes.map((change, changeIdx) => (
                          <ul className="mt-3 list-unstyled" key={changeIdx}>
                            <li>
                              <div className="field-name">{messages[change.field]}</div>
                              <dl>
                                <dt><FormattedMessage id="old_value" defaultMessage={`Old value`} /></dt>
                                <dd>
                                  {EntityDetailEvents.fieldValueToComponent(change.field, change.old_value)}
                                </dd>
                                <dt><FormattedMessage id="new_value" defaultMessage={`New value`} /></dt>
                                <dd>
                                  {EntityDetailEvents.fieldValueToComponent(change.field, change.new_value)}
                                </dd>
                              </dl>
                            </li>
                          </ul>
                      ))}
                    </div>
                  </div>
                </div>
            ))}
          </div>
        </div>
    )
  }
}


function mapStateToProps(state) {
  const {fetchAuth} = apiResourceStateToPropsUtils(state);

  return {
    fetchAuth,
  }
}

export default injectIntl(connect(mapStateToProps)(EntityDetailEvents));
