import React from 'react';
import { Link, withRouter } from 'react-router-dom';
import Route from 'route-parser';
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

function getBreadcrumbs({ location, apiResources }) {
  const pathTokens = getPathTokens(location.pathname);
  return pathTokens.map((path, i) => {
    const routeMatch = getRouteMatch(path);
    if (!routeMatch) {
      return null
    }
    const routeValue = routes[routeMatch.key];
    let name = '';

    if (isFunction(routeValue)) {
      const {resourceType, resourceId} = routeValue(routeMatch.params);
      const resourceUrl = `${settings.resourceEndpoints[resourceType]}${resourceId}/`;
      const resource = apiResources[resourceUrl];
      if (resource) {
        name = resource.name;
      }
    } else {
      name = routeValue
    }

    return { name, path };
  }).filter(x => x !== null);
}

function Breadcrumbs({ location, apiResources }) {
  const breadcrumbs = getBreadcrumbs({ location, apiResources });

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

function mapStateToProps(state) {
  return {
    apiResources: state.apiResources
  }
}

export default connect(mapStateToProps)(withRouter(Breadcrumbs))