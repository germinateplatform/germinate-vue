<template>
  <b-card no-body :style="`border: 1px solid ${templateColor}`">
    <b-card-body :style="`background: linear-gradient(330deg, ${brighterColor} 0%, ${templateColor} 50%); color: white;`">
      <b-row>
        <b-col :cols="6" :lg="8" class="align-self-center">
          <h2 class="mb-0">{{ formattedDisplayInfo }}</h2>
          <span>{{ $t(title) }}</span>
        </b-col>
        <b-col :cols="6" :lg="4" class="d-flex align-items-center justify-content-end dashboard-icon">
          <MdiIcon :size="48" :path="iconPath" />
        </b-col>
      </b-row>
      <router-link class="stretched-link" :disabled="isDisabled" :event="isDisabled ? '' : 'click'" :to="{ name: link, params: linkParams }" :title="`${$t(title)}: ${numericValue.toLocaleString()}`" v-if="numericValue" />
    </b-card-body>
  </b-card>
</template>

<script>
import { mapGetters } from 'vuex'
import MdiIcon from '@/components/icons/MdiIcon'
import { brighten, getTemplateColor, hexToRgb, rgbColorToHex } from '@/mixins/colors'
import { getNumberWithSuffix } from '@/mixins/formatting'

export default {
  components: {
    MdiIcon
  },
  props: {
    title: {
      type: String,
      default: null
    },
    numericValue: {
      type: Number,
      default: 0
    },
    textValue: {
      type: String,
      default: null
    },
    link: {
      type: String,
      default: null
    },
    linkParams: {
      type: Object,
      default: () => null
    },
    iconPath: {
      type: String,
      default: null
    },
    templateColorIndex: {
      type: Number,
      default: 0
    }
  },
  computed: {
    ...mapGetters([
      'storeServerSettings'
    ]),
    templateColor: function () {
      return getTemplateColor(this.templateColorIndex)
    },
    brighterColor: function () {
      return rgbColorToHex(brighten(hexToRgb(this.templateColor)))
    },
    isDisabled: function () {
      return this.storeServerSettings && this.storeServerSettings.hiddenPages.indexOf(this.link) !== -1
    },
    formattedDisplayInfo: function () {
      return this.textValue || getNumberWithSuffix(this.numericValue, 1)
    }
  }
}
</script>

<style>

</style>
