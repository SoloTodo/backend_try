export function createOptions(options) {
  return options.map(createOption)
}

export function createOption(option) {
  const label = typeof(option.doc_count) === 'undefined' ? option.name : `${option.name} (${option.doc_count})`;

  return {
    option,
    value: option.id.toString(),
    label
  }
}