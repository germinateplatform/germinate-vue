<template>
  <div class="searchable-select">
    <!-- Input field for search terms -->
    <b-form-input v-model="searchTerm" :disabled="disabled" :placeholder="$t('inputPlaceholderSearch')" />
    <!-- Regular select field showing filtered options -->
    <b-form-select :multiple="multiple"
                   :value="value"
                   :options="filteredOptions"
                   :select-size="selectSize"
                   :class="className"
                   :disabled="disabled"
                   @change="$emit('change', $event)"
                   @input="$emit('input', $event)"/>
  </div>
</template>

<script>
export default {
  model: {
    prop: 'value',
    event: 'input'
  },
  props: {
    idKey: {
      type: String,
      default: null
    },
    queryId: {
      type: String,
      default: null
    },
    multiple: {
      type: Boolean,
      default: true
    },
    /** The select options */
    options: {
      type: Array,
      default: () => []
    },
    /** Whether the select and input element is disabled */
    disabled: {
      type: Boolean,
      default: false
    },
    /** Any class name to apply to the select element */
    className: {
      type: String,
      default: null
    },
    /** Select size (default: 7) */
    selectSize: {
      type: Number,
      default: 7
    },
    value: {
    }
  },
  data: function () {
    return {
      searchTerm: null,
      preselect: null
    }
  },
  watch: {
    options: function () {
      this.updatePreselect()
    },
    value: async function (newValue) {
      if (!this.queryId) {
        return
      }

      const updatedQuery = {}

      if (newValue) {
        if (Array.isArray(newValue)) {
          if (newValue.length > 0) {
            updatedQuery[this.queryId] = newValue.map(v => v ? v[this.idKey] : 'mi').join(',')
          } else {
            updatedQuery[this.queryId] = null
          }
        } else {
          updatedQuery[this.queryId] = [newValue ? newValue[this.idKey] : 'mi']
        }
      } else {
        updatedQuery[this.queryId] = null
      }

      const query = Object.assign({}, this.$router.currentRoute.query, updatedQuery)

      await this.$router.replace({ query })
    },
    searchTerm: function (newValue) {
      // Only update when narrowing the search
      if (newValue !== null && newValue.length > 0 && this.value.length > 0) {
        // Filter the values
        const newSelection = this.value.filter(s => {
          // Compare them to the options
          return this.filteredOptions.filter(o => {
            if (typeof o === 'object') {
              // For objects, compare the selected value to the `value` field of the option
              return o.value === s
            } else {
              // For all other types, compare their value
              return o === s
            }
          }).length > 0
        })

        this.$emit('input', newSelection)
      }
    }
  },
  computed: {
    searchTermLowerCase: function () {
      return this.searchTerm ? this.searchTerm.toLowerCase() : null
    },
    /**
     * Computes the filtered select options
     */
    filteredOptions: function () {
      if (this.searchTermLowerCase) {
        // Filter based on the search term
        return this.options.filter(o => {
          switch (typeof o) {
            case 'object':
              if (o.value === null) {
                return true
              } else {
                // For objects, check if the search term is part of the option text
                return o.text.toLowerCase().indexOf(this.searchTermLowerCase) !== -1
              }
            case 'number':
            case 'boolean':
              // Numbers and booleans have to match the string text
              return o.toString().toLowerCase() === this.searchTermLowerCase
            case 'string':
              // For strings, check if the search temr is part of the text
              return o.toLowerCase().indexOf(this.searchTermLowerCase) !== -1
            default:
              return false
          }
        })
      } else {
        return this.options
      }
    }
  },
  methods: {
    updatePreselect: function () {
      if (this.preselect && this.options && this.options.length > 0) {
        const hasValidOption = this.options.some(o => o.value)
        if (hasValidOption) {
          const matches = this.options.filter(n => this.preselect.includes(n.value ? n.value[this.idKey] : 'mi')).map(o => o.value)

          if (this.multiple) {
            this.$emit('input', matches)
          } else {
            this.$emit('input', matches[0])
          }
          this.preselect = null
        }
      }
    }
  },
  mounted: function () {
    if (this.$router.currentRoute.query) {
      const q = this.$router.currentRoute.query[this.queryId]

      if (q) {
        if (isNaN(q)) {
          this.preselect = q.split(',').map(c => c === 'mi' ? c : +c)
        } else {
          this.preselect = [+q]
        }

        this.updatePreselect()
      } else {
        this.preselect = null
      }
    }
  }
}
</script>

<style>
.searchable-select > input {
  border-bottom: 0;
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
}
.searchable-select > select {
  border-top-left-radius: 0;
  border-top-right-radius: 0;
}
</style>
