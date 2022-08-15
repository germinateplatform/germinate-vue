<template>
  <div>
    <h1>{{ $t('pageDataResourcesTitle') }} <b-button size="sm" v-if="storeToken && userIsAtLeast(storeToken.userType, 'Data Curator')" @click="onShowAddModal"><MdiIcon :path="mdiPlus" /></b-button></h1>
    <p>{{ $t('pageDataResourcesText') }}</p>

    <FileresourceTable :getData="getFileResourcesTable" ref="dataresourceTable" />

    <!-- Modal to allow adding new file resources -->
    <FileResourceModal ref="fileResourceModal" v-on:resource-added="update" v-if="storeToken && userIsAtLeast(storeToken.userType, 'Data Curator')" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

import MdiIcon from '@/components/icons/MdiIcon'
import FileResourceModal from '@/components/modals/FileResourceModal'
import FileresourceTable from '@/components/tables/FileresourceTable'

import authApi from '@/mixins/api/auth'
import datasetApi from '@/mixins/api/dataset'

import { mdiPlus } from '@mdi/js'

const emitter = require('tiny-emitter/instance')

export default {
  components: {
    FileResourceModal,
    FileresourceTable,
    MdiIcon
  },
  data: function () {
    return {
      mdiPlus
    }
  },
  computed: {
    ...mapGetters([
      'storeToken'
    ])
  },
  mixins: [authApi, datasetApi],
  methods: {
    update: function () {
      this.$refs.dataresourceTable.refresh()
      emitter.emit('update-sidebar-menu')
    },
    onShowAddModal: function () {
      this.$refs.fileResourceModal.show()
    },
    getFileResourcesTable: function (data, callback) {
      return this.apiPostFileResourceTable(data, callback)
    },
    getDatasetTable: function (data, callback) {
      return this.apiPostFileresourceDatasetTable(this.fileresource.fileresourceId, data, callback)
    }
  }
}
</script>

<style>

</style>
