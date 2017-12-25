import React, {Component} from 'react';
import {connect} from "react-redux";
import {FormattedMessage} from "react-intl";
import {
  addApiResourceStateToPropsUtils
} from "solotodo-react-utils";
import './WtbEntityList.css'
import {NavLink} from "react-router-dom";
import {booleanChoices} from "../../utils";
import messages from "../../messages";
import ApiForm from "../../api_forms/ApiForm";
import ApiFormChoiceField from "../../api_forms/ApiFormChoiceField";
import ApiFormTextField from "../../api_forms/ApiFormTextField";
import ApiFormSubmitButton from "../../api_forms/ApiFormSubmitButton";
import {
  createOrderingOptionChoices
} from "../../api_forms/utils";
import ApiFormResultTableWithPagination from "../../api_forms/ApiFormResultTableWithPagination";

class WtbEntityList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      formValues: {},
      apiFormFieldChangeHandler: undefined,
      wtbEntities: undefined
    }
  }

  setApiFormFieldChangeHandler = apiFormFieldChangeHandler => {
    this.setState({
      apiFormFieldChangeHandler
    })
  };

  handleFormValueChange = formValues => {
    this.setState({formValues})
  };

  setWtbEntities = json => {
    this.setState({
      wtbEntities: json ? json.payload : null
    })
  };

  render() {
    const columns = [
      {
        label: <FormattedMessage id="name" defaultMessage="Name" />,
        ordering: 'name',
        renderer: wtbEntity => <NavLink to={'/wtb/entities/' + wtbEntity.id}>{wtbEntity.name || <em>N/A</em>}</NavLink>
      },
      {
        label: <FormattedMessage id="brand" defaultMessage="Brand" />,
        ordering: 'brand',
        renderer: wtbEntity => <span>
          <NavLink to={'/wtb/brands/' + wtbEntity.brand.id}>{wtbEntity.brand.name}</NavLink>
          <a href={wtbEntity.externalUrl} target="_blank" className="ml-2">
            <span className="glyphicons glyphicons-link">&nbsp;</span>
          </a>
        </span>
      },
      {
        label: <FormattedMessage id="key" defaultMessage="Key" />,
        ordering: 'key',
        renderer: wtbEntity => wtbEntity.key
      },
      {
        label: <FormattedMessage id="category" defaultMessage="Category" />,
        ordering: 'category',
        renderer: wtbEntity => wtbEntity.category.name,
        cssClasses: 'hidden-xs-down',
      },
      {
        label: <FormattedMessage id="product" defaultMessage="Product" />,
        renderer: wtbEntity => wtbEntity.product ?
              <NavLink to={'/products/' + wtbEntity.product.id}>{wtbEntity.product.name}</NavLink>
            : <em>N/A</em>,
        cssClasses: 'hidden-sm-down',
      },
      {
        label: <FormattedMessage id="is_active_question" defaultMessage="Active?" />,
        renderer: wtbEntity => <i className={wtbEntity.isActive ?
            'glyphicons glyphicons-check' :
            'glyphicons glyphicons-unchecked'}/>,
        cssClasses: 'hidden-md-down center-aligned',
      },
      {
        label: <FormattedMessage id="is_visible_question" defaultMessage="Visible?" />,
        renderer: wtbEntity => <i className={wtbEntity.isVisible ?
            'glyphicons glyphicons-check' :
            'glyphicons glyphicons-unchecked'}/>,
        cssClasses: 'hidden-md-down center-aligned',
      },
    ];

    return (
        <div className="animated fadeIn">
          <ApiForm
              endpoints={['wtb/entities/']}
              fields={['brands', 'is_active', 'categories', 'is_visible', 'is_associated', 'search', 'page', 'page_size', 'ordering']}
              onResultsChange={this.setWtbEntities}
              onFormValueChange={this.handleFormValueChange}
              setFieldChangeHandler={this.setApiFormFieldChangeHandler}>
            <ApiFormChoiceField
                name="ordering"
                choices={createOrderingOptionChoices(['name', 'brand', 'key', 'category'])}
                hidden={true}
                required={true}
                value={this.state.formValues.ordering}
                onChange={this.state.apiFormFieldChangeHandler}
            />
            <div className="row">
              <div className="col-12">
                <div className="card">
                  <div className="card-header">
                    <i className="glyphicons glyphicons-search">&nbsp;</i> <FormattedMessage id="filters" defaultMessage="Filters" />
                  </div>
                  <div className="card-block">
                    <div className="row entity-form-controls">
                      <div className="col-12 col-sm-6 col-md-6 col-lg-6 col-xl-6">
                        <label htmlFor="brands">
                          <FormattedMessage id="brands" defaultMessage="Brands" />
                        </label>
                        <ApiFormChoiceField
                            name="brands"
                            id="brands"
                            choices={this.props.wtb_brands}
                            multiple={true}
                            searchable={!this.props.breakpoint.isExtraSmall}
                            onChange={this.state.apiFormFieldChangeHandler}
                            value={this.state.formValues.brands}
                            placeholder={messages.all_feminine}

                        />
                      </div>
                      <div className="col-12 col-sm-6 col-md-6 col-lg-6 col-xl-6">
                        <label htmlFor="categories">
                          <FormattedMessage id="categories" defaultMessage="Categories" />
                        </label>
                        <ApiFormChoiceField
                            name="categories"
                            id="categories"
                            choices={this.props.categories}
                            multiple={true}
                            searchable={!this.props.breakpoint.isExtraSmall}
                            onChange={this.state.apiFormFieldChangeHandler}
                            value={this.state.formValues.categories}
                            placeholder={messages.all_feminine}
                        />
                      </div>
                      <div className="col-12 col-sm-3 col-md-3 col-lg-2 col-xl-2">
                        <label id="is_active_label" htmlFor="is_active"><FormattedMessage id="is_active_question" defaultMessage="Active?" /></label>
                        <ApiFormChoiceField
                            name="is_active"
                            id="is_active"
                            choices={booleanChoices}
                            searchable={false}
                            onChange={this.state.apiFormFieldChangeHandler}
                            value={this.state.formValues.is_active}
                            placeholder={messages.all_feminine}
                        />
                      </div>
                      <div className="col-12 col-sm-3 col-md-3 col-lg-2 col-xl-2">
                        <label id="is_visible_label" htmlFor="is_visible">
                          <FormattedMessage id="is_visible_question" defaultMessage="Visible?" />
                        </label>
                        <ApiFormChoiceField
                            name="is_visible"
                            id="is_visible"
                            choices={booleanChoices}
                            searchable={false}
                            onChange={this.state.apiFormFieldChangeHandler}
                            value={this.state.formValues.is_visible}
                            placeholder={messages.all_feminine}
                        />
                      </div>
                      <div className="col-12 col-sm-3 col-md-3 col-lg-2 col-xl-2">
                        <label id="is_associated_label" htmlFor="is_associated"><FormattedMessage id="is_associated_question" defaultMessage="Associated?" /></label>
                        <ApiFormChoiceField
                            name="is_associated"
                            id="is_associated"
                            choices={booleanChoices}
                            searchable={false}
                            onChange={this.state.apiFormFieldChangeHandler}
                            value={this.state.formValues.is_associated}
                            placeholder={messages.all_feminine}
                        />
                      </div>
                      <div className="col-12 col-sm-5 col-md-6 col-lg-4 col-xl-4">
                        <label htmlFor="search">
                          <FormattedMessage id="keywords" defaultMessage="Keywords" />
                        </label>
                        <ApiFormTextField
                            name="search"
                            onChange={this.state.apiFormFieldChangeHandler}
                            value={this.state.formValues.search}
                        />
                      </div>
                      <div className="col-12 col-sm-7 col-md-6 col-lg-12 col-xl-12 float-right">
                        <label htmlFor="submit" className="hidden-xs-down hidden-lg-up">&nbsp;</label>
                        <ApiFormSubmitButton
                            label={<FormattedMessage id="search" defaultMessage='Search' />}
                            loadingLabel={<FormattedMessage id="searching" defaultMessage='Searching'/>}
                            onChange={this.state.apiFormFieldChangeHandler}
                            loading={this.state.wtbEntities === null}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-12">
                <ApiFormResultTableWithPagination
                    label={<FormattedMessage id="entities" defaultMessage="Entities" />}
                    page_size_choices={[50, 100, 200]}
                    page={this.state.formValues.page}
                    page_size={this.state.formValues.page_size}
                    data={this.state.wtbEntities}
                    onChange={this.state.apiFormFieldChangeHandler}
                    columns={columns}
                    ordering={this.state.formValues.ordering}
                />
              </div>
            </div>
          </ApiForm>
        </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    breakpoint: state.breakpoint
  }
}

export default connect(
    addApiResourceStateToPropsUtils(mapStateToProps))(WtbEntityList);
