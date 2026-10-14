<template>
  <div>
    <h1>{{ $t('pageDataResourcesTitle') }} <b-button size="sm" v-if="storeToken && userIsAtLeast(storeToken.userType, USER_TYPE_DATA_CURATOR)" @click="onShowAddModal"><MdiIcon :path="mdiPlus" /></b-button></h1>
    <hr />
    <p>{{ $t('pageDataResourcesText') }}</p>

    <FileresourceTable :getData="getFileResourcesTable" ref="dataresourceTable" />

    <!-- Modal to allow adding new file resources -->
    <FileResourceModal ref="fileResourceModal" v-on:resource-added="update" v-if="storeToken && userIsAtLeast(storeToken.userType, USER_TYPE_DATA_CURATOR)" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

import MdiIcon from '@/components/icons/MdiIcon'
import FileResourceModal from '@/components/modals/FileResourceModal'
import FileresourceTable from '@/components/tables/FileresourceTable'

import { userIsAtLeast, USER_TYPE_DATA_CURATOR, USER_TYPE_ADMINISTRATOR } from '@/mixins/api/auth'
import { apiPostFileResourceTable, apiPostFileresourceDatasetTable, apiGetFileResourceTypes } from '@/mixins/api/dataset'

import { mdiPlus } from '@mdi/js'

// Data resources of this type are only listed for administrators
const ADMIN_ONLY_TYPE = 'Video'

const emitter = require('tiny-emitter/instance')

export default {
  components: {
    FileResourceModal,
    FileresourceTable,
    MdiIcon
  },
  data: function () {
    return {
      mdiPlus,
      USER_TYPE_DATA_CURATOR,
      // Names of the resource types everyone can see, loaded once when needed
      visibleTypeNames: null
    }
  },
  computed: {
    ...mapGetters([
      'storeToken'
    ]),
    isAdmin: function () {
      return !!this.storeToken && userIsAtLeast(this.storeToken.userType, USER_TYPE_ADMINISTRATOR)
    }
  },
  watch: {
    // Logging in or out changes which resources can be listed
    isAdmin: function () {
      this.$refs.dataresourceTable.refresh()
    }
  },
  methods: {
    userIsAtLeast,
    update: function () {
      this.$refs.dataresourceTable.refresh()
      emitter.emit('update-sidebar-menu')
    },
    onShowAddModal: function () {
      this.$refs.fileResourceModal.show()
    },
    getVisibleTypeNames: function () {
      if (this.visibleTypeNames) {
        return Promise.resolve(this.visibleTypeNames)
      }

      return new Promise(resolve => {
        apiGetFileResourceTypes(result => {
          this.visibleTypeNames = (result || []).map(t => t.name).filter(name => name !== ADMIN_ONLY_TYPE)
          resolve(this.visibleTypeNames)
        })
      })
    },
    // There is no "not equals" filter, so non-administrators get the table limited to all other resource types.
    // The extra filter is only added to the request and does not show up in the table filter.
    getFileResourcesTable: function (data, callback) {
      if (this.isAdmin) {
        return apiPostFileResourceTable(data, callback)
      }

      return this.getVisibleTypeNames().then(names => {
        data.filter = [...(data.filter || []), {
          column: 'fileresourcetypeName',
          comparator: 'inSet',
          operator: 'and',
          // An empty set would not filter anything
          values: names.length > 0 ? names : ['']
        }]

        return apiPostFileResourceTable(data, callback)
      })
    },
    getDatasetTable: function (data, callback) {
      return apiPostFileresourceDatasetTable(this.fileresource.fileresourceId, data, callback)
    }
  }
}
</script>

<style>

</style>
