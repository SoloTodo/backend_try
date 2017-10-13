export function createOptions(options) {
  return options.map(createOption)
}

export function createOption(option) {
  const label = typeof(option.docCount) !== 'undefined' ? `${option.name} (${option.docCount})` : option.name;

  return {
    option,
    value: option.id,
    label
  }
}