import { settings } from "./settings"
import { fetchAuth } from './utils';

export function getResourcesByType(state, resourceType) {
  return Object.values(state.apiResources).filter(x => x.resourceType === resourceType)
}

function createApiResourceForeignKeyProperty(obj, entry, apiResources, authToken, dispatch) {
  let camelizedEntry = camelize(entry);

  return {
    get: () => {
      return ApiResource(apiResources[obj[camelizedEntry + 'Url']], apiResources, authToken, dispatch);
    },
    set: (value) => {
      fetchAuth(authToken, obj.url, {
        method: 'PATCH',
        body: JSON.stringify({[entry]: value.url})
      }).then(json => {
        dispatch({
          type: 'ApiResourceUpdate',
          payload: json
        })
      });
      obj[camelizedEntry + 'Url'] = value.url
    },
    configurable: true
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
        // The property is a primitive value OR is a null valued ForeignKey
        properties[camelizedEntry] = {
          get: () => {
            return jsonData[entry];
          },
          set: (value) => {
            // Check whether this was originally a null value
            if (value.url) {
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

// REF: https://stackoverflow.com/questions/6660977/convert-hyphens-to-camel-case-camelcase
function camelize(str) {
  return str.replace(/_([a-z])/g, function (g) { return g[1].toUpperCase(); });
}

export default ApiResource;