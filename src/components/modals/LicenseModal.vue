<template>
  <b-modal id="license-modal" ref="licenseModal" title="License" size="lg" modal-class="d-print-none">
    <div v-if="license">
      <div v-html="license.licensecontent" class="license-content d-print-block"></div>
    </div>
    <div slot="modal-footer">
      <b-button-group>
        <b-dropdown>
          <template slot="button-content"><i class="mdi mdi-18px mdi-download"/> Save</template>
          <b-dropdown-item @click="onPrint"><i class="mdi mdi-18px mdi-printer" /> Print</b-dropdown-item>
          <b-dropdown-item><i class="mdi mdi-18px mdi-file-xml" /> HTML</b-dropdown-item>
        </b-dropdown>
        <b-button v-if="isAccepted" @click="hide"><i class="mdi mdi-18px mdi-cancel" /> Close</b-button>
        <template v-else>
          <b-button variant="success" @click="accept"><i class="mdi mdi-18px mdi-check" /> Accept</b-button>
          <b-button variant="danger" @click="hide"><i class="mdi mdi-18px mdi-cancel" /> Decline</b-button>
        </template>
      </b-button-group>
    </div>
  </b-modal>
</template>

<script>
import { EventBus } from '@/plugins/event-bus.js'

export default {
  props: {
    license: {
      type: Object,
      default: null
    },
    isAccepted: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    show: function () {
      this.$refs.licenseModal.show()
    },
    hide: function () {
      this.$refs.licenseModal.hide()
    },
    accept: function () {
      this.$emit('license-accepted')
    },
    onPrint: function () {
      EventBus.$emit('on-print', this.license.licensecontent)
    }
  }
}
</script>

<style scoped>
.license-content {
  max-height: calc(100vh - 225px);
  overflow-y: auto;
}
</style>
