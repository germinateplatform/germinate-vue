<template>
  <div>
    <BaseTable :options="options"
               :columns="columns"
               v-bind="$props"
               ref="table"
               @loaded="update">
      <template v-slot:cell(imageRefTable)="data">
        <span><i :class="`mdi mdi-18px ${imageTypes[data.item.imageRefTable].icon} fix-alignment`" :style="`color: ${imageTypes[data.item.imageRefTable].color()};`" /> {{ imageTypes[data.item.imageRefTable].text() }}</span>
      </template>

      <template v-slot:cell(image)="data">
        <a :href="getSrc(data.item, 'large')" class="baguettebox" @click.prevent>
          <img :src="getSrc(data.item, 'small')" class="table-image" />
        </a>
      </template>
    </BaseTable>
  </div>
</template>

<script>
import baguetteBox from 'baguettebox.js'
import BaseTable from '@/components/tables/BaseTable'
import defaultProps from '@/const/table-props.js'

export default {
  name: 'ImageTable',
  props: {
    ...defaultProps.BASE,
    ...defaultProps.DOWNLOAD
  },
  data: function () {
    return {
      options: {
        idColumn: 'imageId',
        tableName: 'images'
      }
    }
  },
  computed: {
    columns: function () {
      return [
        {
          key: 'imageId',
          type: Number,
          sortable: true,
          class: `text-right ${this.isTableColumnHidden(this.options.tableName, 'imageId')}`,
          label: this.$t('tableColumnImageId')
        }, {
          key: 'imageDescription',
          type: String,
          sortable: true,
          class: `${this.isTableColumnHidden(this.options.tableName, 'imageDescription')}`,
          label: this.$t('tableColumnImageDescription')
        }, {
          key: 'imagePath',
          type: String,
          sortable: true,
          class: `${this.isTableColumnHidden(this.options.tableName, 'imagePath')}`,
          label: this.$t('tableColumnImagePath')
        }, {
          key: 'imageRefTable',
          type: String,
          sortable: true,
          class: `${this.isTableColumnHidden(this.options.tableName, 'imageRefTable')}`,
          label: this.$t('tableColumnImageReferenceTable')
        }, {
          key: 'referenceName',
          type: String,
          sortable: true,
          class: `${this.isTableColumnHidden(this.options.tableName, 'referenceName')}`,
          label: this.$t('tableColumnImageReferenceName')
        }, {
          key: 'createdOn',
          type: Date,
          sortable: true,
          class: `${this.isTableColumnHidden(this.options.tableName, 'createdOn')}`,
          label: this.$t('tableColumnImageCreatedOn'),
          formatter: this.$options.filters.toDateTime
        }, {
          key: 'image',
          type: undefined,
          sortable: false,
          class: `${this.isTableColumnHidden(this.options.tableName, 'image')}`,
          label: ''
        }
      ]
    }
  },
  components: {
    BaseTable
  },
  methods: {
    getSrc: function (image, size) {
      var params = {
        name: image.imagePath,
        type: 'database',
        size: size,
        token: this.token ? this.token.imageToken : ''
      }

      var paramString = this.toUrlString(params)

      return this.baseUrl + 'image/src?' + paramString
    },
    update: function () {
      this.$nextTick(() => {
        baguetteBox.run('.baguettebox', {
          captions: 'true',
          fullscreen: true,
          filter: /.*/i
        })
      })
    },
    refresh: function () {
      this.$refs.table.refresh()
    }
  }
}
</script>

<style scoped>
.table-image {
  width: 100px;
  height: 100px;
  object-fit: cover;
}
</style>
