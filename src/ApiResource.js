import { settings } from "./settings"
import { camelize, fetchAuth } from './utils';

export function filterApiResourceObjectsByType(apiResourceObjects, resource) {
  const apiResourceEndpoint = settings.apiResourceEndpoints[resource];
  return Object.values(apiResourceObjects).filter(x => x.url.startsWith(apiResourceEndpoint))
}

export function fetchApiResource(resource, dispatch, authToken=null) {
  const resourceUrl = settings.apiResourceEndpoints[resource];

  let resourceRequest = null;

  if (authToken) {
    resourceRequest = fetchAuth(authToken, resourceUrl)
  } else {
    resourceRequest = fetch(resourceUrl).then(res => res.json())
  }

  return resourceRequest.then(json => {
    dispatch({
      type: 'addApiResource',
      apiResourceObjects: json,
      resource: resource,
    });
    return json;
  })
}

export function fetchApiResourceObject(resource, id, dispatch, authToken) {
  const apiResourceObjectUrl = `${settings.apiResourceEndpoints[resource]}${id}/`;

  return fetchAuth(authToken, apiResourceObjectUrl).then(json => {
    if (json.url) {
      dispatch({
        type: 'addApiResourceObject',
        apiResource: json
      });
    } else {
      dispatch({
        type: 'deleteApiResourceObject',
        url: apiResourceObjectUrl
      })
    }
    return json;
  })
}

export function apiResourceObjectForeignKey(rawApiResource, field, state) {
  return state.apiResourceObjects[rawApiResource[field]]
}

export function addApiResourceStateToPropsUtils(mapStateToProps=null) {
  return (state) => {
    let originalMapStateToPropsResult = {};
    if (mapStateToProps !== null) {
      originalMapStateToPropsResult = mapStateToProps(state)
    }

    return {
      ApiResourceObject: (jsonData) => {
        return new ApiResourceObject(jsonData, state.apiResourceObjects)
      },
      fetchAuth: (input, init={}) => {
        return fetchAuth(state.authToken, input, init);
      },
      fetchApiResource: (resource, dispatch) => {
        return fetchApiResource(resource, dispatch, state.authToken)
      },
      fetchApiResourceObject: (resource, id, dispatch) => {
        return fetchApiResourceObject(resource, id, dispatch, state.authToken)
      },
      filterApiResourceObjectsByType: resource => {
        return filterApiResourceObjectsByType(state.apiResourceObjects, resource)
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

class ApiResourceObject {
  constructor(jsonData, apiResourceObjects) {
    this.apiResourceObjects = apiResourceObjects;
    this.dirtyFields = [];

    let properties = {};

    for (let entry in jsonData) {
      if (jsonData.hasOwnProperty(entry)) {
        let camelizedEntry = camelize(entry);
        if (entry !== 'url' && jsonData[entry] && jsonData[entry].includes && jsonData[entry].includes(settings.endpoint)) {
          this[camelizedEntry + 'Url'] = jsonData[entry];
          properties[camelizedEntry] = this.createApiResourceForeignKeyProperty(entry)
        } else {
          // The property is a primitive value OR is a originally null valued ForeignKey
          properties[camelizedEntry] = {
            get: () => {
              return jsonData[entry];
            },
            set: (value) => {
              // Check whether this was originally a null value foreign key
              if (value && value.url) {
                // Yup, the field was originally a null value, modify the object
                let newProperties = {
                  [camelizedEntry]: this.createApiResourceForeignKeyProperty(entry)
                };
                Object.defineProperties(this, newProperties);
                this[camelizedEntry] = value
              } else {
                jsonData[entry] = value
              }

              this.dirtyFields.push(entry);
            },
            configurable: true
          }
        }
      }
    }

    Object.defineProperties(this, properties);
  }

  createApiResourceForeignKeyProperty(entry) {
    let camelizedEntry = camelize(entry);

    return {
      get: () => {
        const foreignKeyValue = this.apiResourceObjects[this[camelizedEntry + 'Url']];
        if (this[camelizedEntry + 'Url'] && !foreignKeyValue) {
          throw Object({
            name: 'Invalid ApiResourceLookup',
            object: this,
            field: camelizedEntry
          })
        }
        return new ApiResourceObject(foreignKeyValue, this.apiResourceObjects);
      },
      set: (value) => {
        this.dirtyFields.push(entry);
        this[camelizedEntry + 'Url'] = value.url;
      },
      configurable: true
    }
  }

  save(authToken, dispatch) {
    if (!this.dirtyFields.length) {
      return;
    }

    let payload = {};

    for (let dirtyField of this.dirtyFields) {
      let camelizedField = camelize(dirtyField);

      let value = this[camelizedField];
      if (value && value.url) {
        value = value.url
      }

      payload[dirtyField] = value;
    }

    this.dirtyFields = [];

    return fetchAuth(authToken, this.url, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    }).then(json => {
      dispatch({
        type: 'updateApiResource',
        payload: json
      });
    });
  }
}

export default ApiResourceObject;