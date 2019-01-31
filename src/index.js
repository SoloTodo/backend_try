import React from 'react';
import ReactDOM from 'react-dom';

import App from './App';
import { addLocaleData } from 'react-intl';
import en from 'react-intl/locale-data/en';
import es from 'react-intl/locale-data/es';
import './scss/style.scss'

addLocaleData([...en, ...es]);

ReactDOM.render((
    <App />
), document.getElementById('root'));
