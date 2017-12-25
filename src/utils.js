import { settings } from './settings';
import messages from "./messages";

export function defaultProperty(resource) {
  return `${settings.apiResourceEndpoints[resource]}${settings.defaults[resource]}/`;
}

export const booleanChoices = [
  {
    id: '1',
    name: messages.yes,
  },
  {
    id: '0',
    name: messages.no,
  }
];