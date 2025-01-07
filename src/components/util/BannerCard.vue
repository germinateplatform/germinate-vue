<template>
  <b-card no-body class="h-100" :style="`border: 1px solid ${templateColor}`">
    <b-card-body class="h-100" :style="`background: linear-gradient(330deg, ${brighterColor} 0%, ${templateColor} 50%); color: white;`">
      <b-row class="h-100">
        <b-col :cols="6" :lg="8" class="align-self-top">
          <component :is="headingComponent" class="mb-0">{{ formattedDisplayInfo }}</component>
          <span>{{ $t(title) }}</span>
        </b-col>
        <b-col :cols="6" :lg="4" class="d-flex align-items-center justify-content-end dashboard-icon">
          <MdiIcon :size="48" :path="iconPath" />
        </b-col>
      </b-row>
      <router-link class="stretched-link" :disabled="isDisabled" :event="isDisabled ? '' : 'click'" :to="{ name: link, params: linkParams }" :title="`${title ? ($t(title) + ': ') : ''}${numericValue ? numericValue.toLocaleString() : textValue}`" v-if="numericValue || textValue" />
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
      default: null
    },
    headingComponent: {
      type: String,
      default: 'h2'
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

<style scoped>
.dashboard-icon {
  color: #999;
  mix-blend-mode: color-burn;
}
</style>
