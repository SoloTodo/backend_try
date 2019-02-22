import React, {Component} from 'react';
import { Link } from 'react-router-dom';
import Route from 'route-parser';
import {injectIntl} from "react-intl";
import routes from '../../routes'
import {connect} from "react-redux";
import {settings} from "../../settings";

const isFunction = value => typeof value === 'function';

const getPathTokens = pathname => {
  const paths = ['/'];

  if (pathname === '/') return paths;

  pathname.split('/').reduce((prev, curr) => {
    if (curr === '') {
      return prev
    }
    const currPath = `${prev}/${curr}`;
    paths.push(currPath);
    return currPath;
  });

  return paths;
};

function getRouteMatch(path) {
  return Object.keys(routes)
      .map(key => {
        const params = new Route(key).match(path);
        return {
          didMatch: params !== false,
          params,
          key
        };
      })
      .filter(item => item.didMatch)[0];
}

class Breadcrumbs extends Component {
  getBreadcrumbs() {
    const pathTokens = getPathTokens(this.props.location.pathname);
    return pathTokens.map((path, i) => {
      const routeMatch = getRouteMatch(path);
      if (!routeMatch) {
        return null
      }
      const routeValue = routes[routeMatch.key];
      let name = '';

      if (isFunction(routeValue)) {
        const {apiResource, apiResourceObjectId} = routeValue(routeMatch.params);
        const apiResourceObjectUrl = `${settings.apiResourceEndpoints[apiResource]}${apiResourceObjectId}/`;
        const apiResourceObject = this.props.apiResourceObjects[apiResourceObjectUrl];
        if (apiResourceObject) {
          name = apiResourceObject.name || apiResourceObject.id;
        }
      } else {
        name = this.props.intl.formatMessage({id: routeValue})
      }

      return { name, path };
    }).filter(x => x !== null);
  }

  render () {
    const breadcrumbs = this.getBreadcrumbs();

    let title = '';

    switch (breadcrumbs.length) {
      case 1:
        title = 'Página principal';
        break;
      case 2:
        title = breadcrumbs[1].name;
        break;
      case 3:
        title = `${breadcrumbs[2].name} - ${breadcrumbs[1].name}`;
        break;
      case 4:
        title = `${breadcrumbs[2].name} - ${breadcrumbs[3].name}`;
        break;
      default:
        title = ''
    }

    document.title = title + ' - SoloTodo';

    return (
        <div>
          <ol className="mb-0 breadcrumb">
            {breadcrumbs.map((breadcrumb, i) =>
                <li key={breadcrumb.path} className="breadcrumb-item">
                  <Link to={breadcrumb.path}>
                    {breadcrumb.name}
                  </Link>
                </li>
            )}
          </ol>
        </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    apiResourceObjects: state.apiResourceObjects
  }
}

export default injectIntl(connect(mapStateToProps)(Breadcrumbs))