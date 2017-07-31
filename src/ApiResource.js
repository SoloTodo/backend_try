import { settings } from "./settings"
import { camelize, fetchAuth } from './utils';

export function filterApiResourcesByType(state, resourceType) {
  return Object.values(state.apiResources).filter(x => x.resourceType === resourceType)
}

export function fetchApiResource(resource, dispatch, authToken=null) {
  const resourceUrl = settings.resourceEndpoints[resource];

  let resourceRequest = null;

  if (authToken) {
    resourceRequest = fetchAuth(authToken, resourceUrl)
  } else {
    resourceRequest = fetch(resourceUrl).then(res => res.json())
  }

  return resourceRequest.then(json => {
    dispatch({
      type: 'addApiResources',
      apiResources: json,
      resourceType: resource
    });
  })
}

export function apiResourceForeignKey(rawApiResource, field, state) {
  return state.apiResources[rawApiResource[field]]
}

export function addApiResourceStateToPropsUtils(mapStateToProps=null) {
  return (state) => {
    let originalMapStateToPropsResult = {};
    if (mapStateToProps !== null) {
      originalMapStateToPropsResult = mapStateToProps(state)
    }

    return {
      ApiResource: (jsonData) => {
        return ApiResource(jsonData, state.apiResources, state.authToken)
      },
      fetchAuth: (input, init={}) => {
        return fetchAuth(state.authToken, input, init);
      },
      fetchApiResource: (resource, dispatch) => {
        return fetchApiResource(resource, dispatch, state.authToken)
      },
      ...originalMapStateToPropsResult
    };
  }
}

export function addApiResourceDispatchToPropsUtils(mapDispatchToProps=null) {
  return (dispatch) => {
    let originalMapDispatchToPropsResult = {};
    if (mapDispatchToProps !== null) {
      originalMapDispatchToPropsResult = mapDispatchToProps(dispatch)
    }

    return {
      dispatch,
      ...originalMapDispatchToPropsResult
    }
  }
}

export function ApiResourceByStore (jsonData, reduxStore) {
  const state = reduxStore.getState();
  return ApiResource(jsonData, state.apiResources, state.authToken, reduxStore.dispatch)
}

let ApiResource = (jsonData, apiResources, authToken, dispatch) => {
  let newObject = {};
  let properties = {};

  for (let entry in jsonData) {
    if (jsonData.hasOwnProperty(entry)) {
      let camelizedEntry = camelize(entry);
      if (entry !== 'url' && jsonData[entry] && jsonData[entry].includes && jsonData[entry].includes(settings.endpoint)) {
        newObject[camelizedEntry + 'Url'] = jsonData[entry];
        properties[camelizedEntry] = createApiResourceForeignKeyProperty(newObject, entry, apiResources, authToken, dispatch)
      } else {
        // The property is a primitive value OR is a orignally null valued ForeignKey
        properties[camelizedEntry] = {
          get: () => {
            return jsonData[entry];
          },
          set: (value) => {
            // Check whether this was originally a null value foreign key
            if (value && value.url) {
              // Yup, the field was originally a null value, modify the object
              let newProperties = {
                [camelizedEntry]: createApiResourceForeignKeyProperty(newObject, entry, apiResources, authToken, dispatch)
              };
              Object.defineProperties(newObject, newProperties);
            }

            newObject[camelizedEntry] = value
          },
          configurable: true
        }
      }
    }
  }

  return Object.defineProperties(newObject, properties)
};

function createApiResourceForeignKeyProperty(obj, entry, apiResources, authToken, dispatch) {
  let camelizedEntry = camelize(entry);

  return {
    get: () => {
      const foreignKeyValue = apiResources[obj[camelizedEntry + 'Url']];
      if (obj[camelizedEntry + 'Url'] && !foreignKeyValue) {
        throw Object({
          name: 'Invalid ApiResourceLookup',
          object: obj,
          field: camelizedEntry
        })
      }
      return ApiResource(foreignKeyValue, apiResources, authToken, dispatch);
    },
    set: (value) => {
      fetchAuth(authToken, obj.url, {
        method: 'PATCH',
        body: JSON.stringify({[entry]: value.url})
      }).then(json => {
        dispatch({
          type: 'updateApiResource',
          payload: json
        });
      });

      obj[camelizedEntry + 'Url'] = value.url;
    },
    configurable: true
  }
}

export default ApiResource;