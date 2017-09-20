export function createOrderingOptionChoices(fields) {
  const result = [];

  for (const field of fields) {
    result.push(createOrderingOptionChoice(field));
    result.push(createOrderingOptionChoice('-' + field));
  }

  return result
}

export function createOrderingOptionChoice(field) {
  return {
    id: field,
    name: field
  }
}