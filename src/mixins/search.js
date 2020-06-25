export default {
  data: function () {
    return {
      operators: {
        and: {
          text: () => this.$t('operatorsAnd'),
          value: 'and'
        },
        or: {
          text: () => this.$t('operatorsOr'),
          value: 'or'
        }
      },
      comparators: {
        contains: {
          text: () => this.$t('comparatorsContains'),
          values: 1
        },
        equals: {
          text: () => this.$t('comparatorsEqual'),
          values: 1
        },
        isNull: {
          text: () => this.$t('comparatorsIsNull'),
          value: 0
        },
        between: {
          text: () => this.$t('comparatorsBetween'),
          values: 2
        },
        greaterThan: {
          text: () => this.$t('comparatorsGreaterThan'),
          values: 1
        },
        greaterOrEquals: {
          text: () => this.$t('comparatorsGreaterThanOrEquals'),
          values: 1
        },
        lessThan: {
          text: () => this.$t('comparatorsLessThan'),
          values: 1
        },
        lessOrEquals: {
          text: () => this.$t('comparatorsLessThanOrEquals'),
          values: 1
        },
        inSet: {
          text: () => this.$t('comparatorsInSet'),
          values: 1
        }
      }
    }
  }
}
