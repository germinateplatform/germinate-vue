<template>
  <b-modal ref="customChartColorModal"
           :title="$t('modalTitleChartColors')"
           :ok-title="$t('buttonUpdate')"
           :cancel-title="$t('buttonCancel')"
           @ok.prevent="onSubmit">
    <b-form @submit.prevent >
      <b-form-group :label="$t('formLabelChartColorsCurrent')" label-for="colors">
        <b-form-tags id="colors">
          <b-form-tag v-for="(color, index) in colors"
                      class="p-1 m-1"
                      :key="`custom-color-${color}-${index}`"
                      :style="{ backgroundColor: color, color: getHighContrastTextColor(color) }"
                      @remove="removeColor(index)">
            {{ color }}
          </b-form-tag>
        </b-form-tags>
      </b-form-group>
      <b-form-group :label="$t('formLabelChartColorsNew')" label-for="new-color" :invalid-feedback="message" :state="colorValid">
        <b-input-group>
          <template v-slot:append>
            <b-button variant="info" v-b-tooltip="$t('genericAdd')" @click="addColor"><i class="mdi mdi-plus-box" /></b-button>
          </template>
          <b-form-input type="color" v-model="color" id="label-for" :state="colorValid" required />
        </b-input-group>
      </b-form-group>
      <b-button @click="resetColors">{{ $t('buttonResetColorsToDefault') }}</b-button>
    </b-form>
  </b-modal>
</template>

<script>
import colorMixin from '@/mixins/colors.js'

export default {
  data: function () {
    return {
      colors: [],
      color: '#00acef',
      message: null,
      colorValid: null
    }
  },
  mixins: [colorMixin],
  methods: {
    removeColor: function (index) {
      this.colors.splice(index, 1)
    },
    addColor: function () {
      if (this.colors.indexOf(this.color) === -1) {
        this.colors.push(this.color)
        this.message = null
        this.colorValid = null
      } else {
        this.colorValid = false
        this.message = 'Color already added'
      }
    },
    show: function () {
      this.color = (this.serverSettings && this.serverSettings.primaryColor) ? this.serverSettings.primaryColor : '#00acef'
      this.colors = this.getColors().slice()
      this.message = null

      this.$refs.customChartColorModal.show()
    },
    hide: function () {
      this.$refs.customChartColorModal.hide()
    },
    onSubmit: function () {
      if (this.colors && this.colors.length > 0) {
        this.$store.dispatch('ON_CUSTOM_CHART_COLORS_CHANGED', this.colors)
        this.$emit('colors-changed')
        this.$nextTick(() => this.hide())
      }
    },
    resetColors: function () {
      this.$store.dispatch('ON_CUSTOM_CHART_COLORS_CHANGED', null)
      this.$emit('colors-changed')
      this.hide()
    }
  }
}
</script>

<style>

</style>
