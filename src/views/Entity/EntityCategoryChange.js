import React, { Component } from 'react';
import {
  apiResourceStateToPropsUtils,
  filterApiResourceObjectsByType
} from "../../react-utils/ApiResource";
import {FormattedMessage, injectIntl} from "react-intl";
import {backendStateToPropsUtils} from "../../utils";
import {connect} from "react-redux";
import {toast} from "react-toastify";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import {createOption, createOptions} from "../../react-utils/form_utils";
import Select from "react-select";

class EntityCategoryChange extends Component {
  initialState = {
    categoryForChange: null,
  };

  constructor(props) {
    super(props);

    this.state = {...this.initialState}
  }

  changeCategory = () => {
    const requestBody = JSON.stringify({category: this.state.categoryForChange.id});

    this.props.fetchAuth(`${this.props.entity.url}change_category/`, {
      method: 'POST',
      body: requestBody
    }).then(json => {
      this.setState({
        categoryForChange: null
      }, () => {
        // We may no longer have permissions to access the entity, so fetch it again.
        // If we don't, the rsource will be deleted from the app ApiResources and
        // we will be automatically redirected to another page.
        this.props.fetchApiResourceObject('entities', json.id, this.props.dispatch)
      });
    });
  };

  userHasStaffPermissionOverSelectedCategory = () => {
    return this.state.categoryForChange.permissions.includes('is_category_staff')
  };

  handleChangeCategory = newCategoryChoice => {
    this.setState({
      categoryForChange: newCategoryChoice.option
    }, () => {
      if (this.userHasStaffPermissionOverSelectedCategory()) {
        this.changeCategory();
      }
    });
  };

  resetCategoryForChange = () => {
    this.setState({
      categoryForChange: null
    })
  };

  handleChangeCategoryClick = evt => {
    if (this.props.entity.product) {
      toast.warn(<FormattedMessage id="changing_category_of_associated_entity_warning" defaultMessage="Please deassociate the the entity before changing it's category" />, {
        autoClose: false
      });
    }
  };

  render() {
    const entity = this.props.entity;

    const categorySelectEnabled = !this.state.categoryForChange && !entity.product;
    const categoryOptions = createOptions(this.props.categories);

    const isModalOpen = Boolean(this.state.categoryForChange) && !this.userHasStaffPermissionOverSelectedCategory();

    return <div>
      <div onClick={this.handleChangeCategoryClick}>
        <Select
            name="categories"
            id="categories"
            options={categoryOptions}
            value={createOption(entity.category)}
            onChange={this.handleChangeCategory}
            searchable={false}
            clearable={false}
            disabled={!categorySelectEnabled}
        />
      </div>

      <Modal isOpen={isModalOpen}>
        <ModalHeader><FormattedMessage id="entity_irreversible_category_change_title" defaultMessage='Irreversible category change' /></ModalHeader>
        <ModalBody>
          <FormattedMessage id="entity_irreversible_category_change_body" defaultMessage="You don't have staff permissions over the category you are assigning. If you proceed you will not be able to edit (or maybe even access) this entity any more." />

        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={this.changeCategory}><FormattedMessage id="entity_irreversible_category_change_proceed" defaultMessage='OK, Proceed either way' /></Button>{' '}
          <Button color="secondary" onClick={this.resetCategoryForChange}><FormattedMessage id="cancel" defaultMessage='Cancel' /></Button>
        </ModalFooter>
      </Modal>
    </div>
  }
}

function mapStateToProps(state) {
  const {ApiResourceObject, fetchAuth, fetchApiResourceObject} = apiResourceStateToPropsUtils(state);
  const {user, preferredCurrency, preferredNumberFormat } = backendStateToPropsUtils(state);

  return {
    ApiResourceObject,
    fetchAuth,
    fetchApiResourceObject,
    user,
    preferredCurrency,
    preferredNumberFormat,
    categories: filterApiResourceObjectsByType(state.apiResourceObjects, 'categories'),
  }
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
    updateEntity: entity => {
      dispatch({
        type: 'updateApiResourceObject',
        apiResourceObject: entity
      });
    }
  }
}


export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(EntityCategoryChange));