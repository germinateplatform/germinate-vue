export function mapFilters (filters) {
  return filters.reduce((result, filter) => {
    result[filter] = function (...args) {
      return this.$options.filters[filter](...args)
    }
    return result
  }, {})
}
