import React from 'react'
import {FormattedMessage} from "react-intl";

const messages = {
  success_exclamation: <FormattedMessage id="success_exclamation" defaultMessage='Success!' />,
  warning_exclamation: <FormattedMessage id="warning_exclamation" defaultMessage='Warning!' />,
  store_update_requested_success: <FormattedMessage id="store_update_requested_success" defaultMessage='Store update requested successfully' />,
  store_no_scraper_warning: <FormattedMessage id="store_no_scraper_warning" defaultMessage='The store has no valid scraper, so it cannot be updated' />,
};

export default messages;