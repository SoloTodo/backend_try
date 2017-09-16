import React, { Component } from 'react';
import {connect} from "react-redux";
import {
  addApiResourceDispatchToPropsUtils,
  addApiResourceStateToPropsUtils
} from "../../ApiResource";
import {FormattedMessage} from "react-intl";
import {NavLink} from "react-router-dom";
import ReactMarkdown from 'react-markdown';
import Loading from "../../components/Loading";
import {formatDateStr} from "../../utils";
import messages from "../../messages";
import './EntityDetailEvents.css'


class EntityDetailEvents extends Component {
  constructor(props) {
    super(props);

    this.state = {
      events: undefined
    }
  }

  componentDidMount() {
    const entity = this.props.apiResourceObject;

    this.props.fetchAuth(`${entity.url}events/`).then(
        json => this.setState({events: json})
    )
  }

  fieldValueToComponent(field, value) {
    if (['category', 'scraped_category', 'currency', 'state'].includes(field)) {
      return value.name
    } else if (['product', 'cell_plan'].includes(field)) {
      return value ? <NavLink to={`/products/${value.id}`}>{value.name}</NavLink> : <em>N/A</em>
    } else if (['url', 'discovery_url'].includes(field)) {
      return <a className="url-link" href={value} target="_blank">{value || <em>N/A</em>}</a>
    } else if (field === 'description') {
      return <div className="description-container"><ReactMarkdown source={value} /></div>
    } else if (field === 'is_visible') {
      return value ? messages.yes : messages.no
    } else if (field === 'picture_urls') {
      if (value) {
        return <ul>
          {JSON.parse(value).map(pictureUrl =>
            <li key={pictureUrl}><a href={pictureUrl} target="_blank">{pictureUrl}</a></li>
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
                <div className="card-header"><strong><FormattedMessage id="no_events_found" defaultMessage={`No events found`} /></strong></div>
                <div className="card-block">
                  <FormattedMessage id="no_events_found_description" defaultMessage={`This entity dooesn't have any events`} />
                </div>
              </div>
            </div>
            }

            {this.state.events.map((event, idx) => (
                <div key={idx} className="col-12 col-lg-6">
                  <div className="card" >
                    <div className="card-header"><strong>{formatDateStr(event.timestamp)}</strong></div>
                    <div className="card-block">
                      <strong><FormattedMessage id="user" defaultMessage={`User`} />:</strong> {event.user.full_name}

                      {event.changes.map((change, changeIdx) => (
                          <ul className="mt-3 list-unstyled" key={changeIdx}>
                            <li>
                              <div className="field-name">{messages[change.field]}</div>
                              <dl>
                                <dt><FormattedMessage id="old_value" defaultMessage={`Old value`} /></dt>
                                <dd>
                                  {this.fieldValueToComponent(change.field, change.old_value)}
                                </dd>
                                <dt><FormattedMessage id="new_value" defaultMessage={`New value`} /></dt>
                                <dd>
                                  {this.fieldValueToComponent(change.field, change.new_value)}
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

export default connect(
    addApiResourceStateToPropsUtils(),
    addApiResourceDispatchToPropsUtils())(EntityDetailEvents);