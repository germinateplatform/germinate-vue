<template>
  <div>
    <BaseTable :options="options"
               :columns="columns"
               :filterOn="filterOn"
               ref="table"
               @loaded="update">
      <span slot="imageRefTable" slot-scope="props"><i :class="`mdi mdi-18px ${imageTypes[props.row.imageRefTable].icon} fix-alignment`" :style="`color: ${imageTypes[props.row.imageRefTable].color()};`" /> {{ imageTypes[props.row.imageRefTable].text() }}</span>

      <!-- Formatted date -->
      <span slot="createdOn" slot-scope="props" v-if="props.row.createdOn">{{ props.row.createdOn | toDate }}</span>

      <a slot="image" slot-scope="props" :href="getSrc(props.row, 'large')" class="baguettebox" @click.prevent>
        <img :src="getSrc(props.row, 'small')" class="table-image" />
      </a>
    </BaseTable>
  </div>
</template>

<script>
import baguetteBox from 'baguettebox.js'
import BaseTable from '@/components/tables/BaseTable'

export default {
  name: 'ImageTable',
  props: {
    getData: {
      type: Function,
      default: () => {}
    },
    filterOn: {
      type: Array,
      default: null
    }
  },
  data: function () {
    const columns = [
      {
        name: 'imageId',
        type: Number
      }, {
        name: 'imageDescription',
        type: String
      }, {
        name: 'imagePath',
        type: String
      }, {
        name: 'imageRefTable',
        type: String
      }, {
        name: 'referenceName',
        type: String
      }, {
        name: 'createdOn',
        type: Date
      }, {
        name: 'image',
        type: undefined
      }
    ]
    return {
      options: {
        requestData: (data, callback) => {
          return this.getData(data, callback)
        },
        idColumn: 'imageId',
        tableName: 'images',
        sortable: ['imageId', 'imageDescription', 'imagePath', 'imageRefTable', 'referenceName', 'createdOn'],
        filterable: [],
        headings: {
          imageId: () => this.$t('tableColumnImageId'),
          imageDescription: () => this.$t('tableColumnImageDescription'),
          imagePath: () => this.$t('tableColumnImagePath'),
          imageRefTable: () => this.$t('tableColumnImageReferenceTable'),
          referenceName: () => this.$t('tableColumnImageReferenceName'),
          createdOn: () => this.$t('tableColumnImageCreatedOn'),
          image: ''
        },
        columnsClasses: {
          imageId: 'text-right'
        }
      },
      columns: columns
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
      console.log('update')
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
