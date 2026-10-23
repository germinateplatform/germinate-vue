export default {
  BASE: {
    filterOn: {
      type: Array,
      default: null
    },
    getData: {
      type: Function,
      default: () => {
        return {
          data: [],
          count: 0
        }
      }
    },
    storeUrlParameters: {
      type: Boolean,
      default: true
    }
  },
  DOWNLOAD: {
    downloadTable: {
      type: Function,
      default: null
    }
  },
  IDS: {
    getIds: {
      type: Function,
      default: () => {
        return {
          data: [],
          count: 0
        }
      }
    }
  },
  ACTIONS: {
    tableActions: {
      type: Array,
      default: () => null
    }
  },
  FULL: {
    downloadTable: {
      type: Function,
      default: null
    },
    filterOn: {
      type: Array,
      default: null
    },
    getData: {
      type: Function,
      default: () => {
        return {
          data: [],
          count: 0
        }
      }
    },
    getIds: {
      type: Function,
      default: () => {
        return {
          data: [],
          count: 0
        }
      }
    },
    tableActions: {
      type: Array,
      default: () => null
    },
    storeUrlParameters: {
      type: Boolean,
      default: true
    },
    // Own text for the badge of a filter above the table: (filter) => text, or null for the usual one
    filterLabel: {
      type: Function,
      default: null
    }
  }
}
