export function createOptions(options) {
  return options.map(createOption)
}

export function createOption(option) {
  return {
    option,
    value: option.id.toString(),
    label: option.name
  }
}