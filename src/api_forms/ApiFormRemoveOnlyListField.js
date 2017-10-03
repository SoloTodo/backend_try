import React, {Component} from 'react'
import queryString from 'query-string';
import changeCase from 'change-case'
import {settings as setting} from "../settings";
import {connect} from "react-redux";
import {addApiResourceStateToPropsUtils} from "../ApiResource";
import {listToObject} from "../utils";
import {NavLink} from "react-router-dom";
import './ApiFormRemoveOnlyListField.css'

class ApiFormRemoveOnlyListField extends Component {
  constructor(props) {
    super(props);

    this.state = {
      apiResourceObjects: undefined
    }
  }

  componentDidMount() {
    const values = this.parseValueFromUrl();
    this.notifyNewParams(values);

    let endpoint = setting.apiResourceEndpoints[this.props.resource] + '?';
    for (const value of values) {
      endpoint += `ids=${value}&`
    }

    if (values.length) {
      this.props.fetchAuth(endpoint)
          .then(json => {
            const apiResourceObjects = listToObject(json.results, 'id')
            this.setState({
              apiResourceObjects
            })
          })
    }

  }

  componentWillReceiveProps(nextProps) {
    if (this.props.onChange !== nextProps.onChange) {
      this.notifyNewParams(this.parseValueFromUrl(), nextProps)
    }

    if (typeof(nextProps.value) === 'undefined') {
      this.notifyNewParams(this.parseValueFromUrl())
    }
  }

  parseValueFromUrl = () => {
    const parameters = queryString.parse(window.location.search);

    let values = parameters[changeCase.snake(this.props.name)];

    if (typeof(values) === 'undefined') {
      values = []
    }

    if (!Array.isArray(values)) {
      values = [values]
    }

    return values
  };

  notifyNewParams(value, props) {
    props = props ? props : this.props;

    if (!props.onChange) {
      return;
    }

    const fieldName = changeCase.snake(props.name);

    const params = value ? {[fieldName] : value} : {};

    const result = {
      [this.props.name]: {
        apiParams: params,
        urlParams: params,
        fieldValues: value
      }
    };

    props.onChange(result, Boolean(this.props.updateResultsOnChange))
  }

  handleItemRemove = (evt, value) => {
    evt.preventDefault();

    const newValues = this.props.value.filter(x => parseInt(x, 10) !== value.id);

    this.notifyNewParams(newValues)
  };

  render() {
    if (!this.props.value || !this.state.apiResourceObjects) {
      return null
    }

    const values = this.props.value.map(value => this.state.apiResourceObjects[value]);

    return <table>
      <tbody>
      {values.map(value => {
        return <tr key={value.id}>
          <td className="pr-2">
            <a href="" className="api-form-remove-only-list-field-remove" onClick={evt => this.handleItemRemove(evt, value)}>
              <i className="fa fa-times" aria-hidden="true">&nbsp;</i>
            </a>
          </td>
          <td>
            <NavLink to={`/${this.props.resource}/${value.id}`}>{value.name}</NavLink>
          </td>
        </tr>
      })}
      </tbody>
    </table>
  }
}

export default connect(
    addApiResourceStateToPropsUtils()
)(ApiFormRemoveOnlyListField);
