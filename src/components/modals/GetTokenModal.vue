<template>
  <b-modal ref="tokenModal" :title="$t('modalTitleGetToken')" ok-only :ok-title="$t('buttonClose')" @shown="$refs.token.focus()">
    <b-form-group :label="$t('formLabelToken')" label-for="token" :description="$t('formDescriptionToken')" v-if="storeToken">
      <b-input-group>
        <b-input :value="storeToken.token" id="token" autofocus @focus="$event.target.select()" ref="token" />
        <b-input-group-append>
          <b-button @click="copyToClipboard" v-b-tooltip="$t('tooltipCopyToClipboard')"><MdiIcon :path="mdiClipboardFileOutline" /></b-button>
        </b-input-group-append>
      </b-input-group>
    </b-form-group>
  </b-modal>
</template>

<script>
import MdiIcon from '@/components/icons/MdiIcon'

import { mapGetters } from 'vuex'
import { mdiClipboardFileOutline } from '@mdi/js'

export default {
  components: {
    MdiIcon
  },
  data: function () {
    return {
      mdiClipboardFileOutline
    }
  },
  computed: {
    ...mapGetters([
      'storeToken'
    ])
  },
  methods: {
    copyToClipboard: function () {
      navigator.clipboard.writeText(this.storeToken.token)
    },
    show: function () {
      this.$refs.tokenModal.show()
    },
    hide: function () {
      this.$refs.tokenModal.hide()
    }
  }
}
</script>

<style>

</style>
