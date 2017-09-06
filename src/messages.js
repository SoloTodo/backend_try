import React from 'react'
import {FormattedMessage} from "react-intl";

const messages = {
  success_exclamation: <FormattedMessage id="success_exclamation" defaultMessage='Success!' />,
  warning_exclamation: <FormattedMessage id="warning_exclamation" defaultMessage='Warning!' />,
  store_no_scraper_warning: <FormattedMessage id="store_no_scraper_warning" defaultMessage='The store has no valid scraper, so it cannot be updated' />,
  yes: <FormattedMessage id="yes" defaultMessage='Yes' />,
  no: <FormattedMessage id="no" defaultMessage='No' />,
  previous: <FormattedMessage id="previous" defaultMessage={`Previous`} />,
  next: <FormattedMessage id="next" defaultMessage={`Next`} />,
  update_stores: <FormattedMessage id="update_stores" defaultMessage={`Update Stores`} />,
  category: <FormattedMessage id="category" defaultMessage={`Category`} />,
  scraped_category: <FormattedMessage id="scraped_category" defaultMessage={`Scraped category`} />,
  currency: <FormattedMessage id="currency" defaultMessage={`Currency`} />,
  product: <FormattedMessage id="product" defaultMessage={`Product`} />,
  cell_plan: <FormattedMessage id="cell_plan" defaultMessage={`Cell Plan`} />,
  name: <FormattedMessage id="name" defaultMessage={`Name`} />,
  cell_plan_name: <FormattedMessage id="cell_plan_name" defaultMessage={`Cell plan name`} />,
  part_number: <FormattedMessage id="part_number" defaultMessage={`Part number`} />,
  sku: <FormattedMessage id="sku" defaultMessage={`SKU`} />,
  url: <FormattedMessage id="url" defaultMessage={`URL`} />,
  discovery_url: <FormattedMessage id="discovery_url" defaultMessage={`Discovery URL`} />,
  picture_url: <FormattedMessage id="picture_url" defaultMessage={`Picture URL`} />,
  description: <FormattedMessage id="description" defaultMessage={`Description`} />,
  is_visible: <FormattedMessage id="is_visible" defaultMessage={`Is visible`} />,
  normal_price: <FormattedMessage id="normal_price" defaultMessage={`Normal price`} />,
  offer_price: <FormattedMessage id="offer_price" defaultMessage={`Offer price`} />,
  cell_monthly_payment: <FormattedMessage id="cell_monthly_payment" defaultMessage={`Cell monthly payment`} />,
  default_text: <FormattedMessage id="default_text" defaultMessage={`default`} />,
  entity_dissociation_reason_placeholder: <FormattedMessage id="entity_dissociation_reason_placeholder" defaultMessage="Dissociation reason (optional)" />,
};

export default messages;
