import React from 'react';
import {connect} from "react-redux";
import Select from "react-select";

import {apiResourceStateToPropsUtils} from "../../react-utils/ApiResource";


class EntityConditionChange extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedCondition: this.props.entity.condition,
    }
  }

  changeCondition = () => {
    const requestBody = JSON.stringify({condition: this.state.selectedCondition});

    this.props.fetchAuth(`${this.props.entity.url}set_condition/`, {
      method: 'POST',
      body: requestBody
    })
  };

  handleChangeCondition = conditionOption => {
    this.setState({
      selectedCondition: conditionOption.value
    }, () => {
      this.changeCondition()
    })
  };

  render() {
    const conditionOptions = [
      { option: 'https://schema.org/DamagedCondition',
        value: 'https://schema.org/DamagedCondition',
        label: 'Dañado'},
      { option: 'https://schema.org/NewCondition',
        value: 'https://schema.org/NewCondition',
        label: 'Nuevo'},
      { option: 'https://schema.org/RefurbishedCondition',
        value: 'https://schema.org/RefurbishedCondition',
        label: 'Reacondicionado'},
      { option: 'https://schema.org/UsedCondition',
        value: 'https://schema.org/UsedCondition',
        label: 'Usado'},

    ];
    return <div>
      <Select
        name='conditions'
        id='conditions'
        options={conditionOptions}
        value={this.state.selectedCondition}
        onChange={this.handleChangeCondition}
        clearable={false}
        />
    </div>
  }
}

function mapStateToProps(state) {
  const {fetchAuth} = apiResourceStateToPropsUtils(state);

  return {
    fetchAuth
  }
}

export default connect(mapStateToProps)(EntityConditionChange)
