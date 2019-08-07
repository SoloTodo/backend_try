import React from 'react';


class EntityConditionChange extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      newCondition: null,
    }
  }

  changeCondition = () => {
    const requestBody = JSON.stringify({condition: this.state.newCondition});

    this.props.fetchAuth(`${this.props.entity.url}set_condition/`, {
      method: 'POST',
      body: requestBody
    }).then(json => {
      this.setState({
        newCondition: null
      })
    })
  };

  handleChangeCondition = newCondition => {
    this.setState({
      newCondition: newCondition
    }, () => {
      this.changeCondition()
    })
  };

  resetNewCondition = () => {
    this.setState({
      newCondition: null
    })
  };

  render() {
    const entity = this.props.entity;
    const conditionSelectEnabled = !this.state.newCondition;
    const conditionOptions = {
      
    };
    return <div>Hola</div>
  }
}

export default EntityConditionChange
