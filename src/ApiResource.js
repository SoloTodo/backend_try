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
        return new ApiResource(jsonData, state.apiResources)
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

class ApiResource {
  constructor(jsonData, apiResources) {
    this.apiResources = apiResources;
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
              }

              this.dirtyFields.push(entry);
              this[camelizedEntry] = value
            },
            configurable: true
          }
        }
      }
    }

    Object.defineProperties(this, properties);
  }

  createApiResourceForeignKeyProperty(entry, authToken, dispatch) {
    let camelizedEntry = camelize(entry);

    return {
      get: () => {
        const foreignKeyValue = this.apiResources[this[camelizedEntry + 'Url']];
        if (this[camelizedEntry + 'Url'] && !foreignKeyValue) {
          throw Object({
            name: 'Invalid ApiResourceLookup',
            object: this,
            field: camelizedEntry
          })
        }
        return new ApiResource(foreignKeyValue, this.apiResources);
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

export default ApiResource;