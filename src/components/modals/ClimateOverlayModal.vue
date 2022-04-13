<template>
  <b-modal :title="$t('pageLocationsMapsClimateOverlaysTitle')"
           ref="climateModal"
           :ok-title="$t('buttonUpdate')"
           :cancel-title="$t('genericClear')"
           @cancel="handleCancel"
           @ok="handleOk">
    <p>{{ $t('pageLocationsMapsClimateOverlaysText') }}</p>
    <b-form-group :label="$t('pageLocationsMapsClimateOverlaysTitle')">
      <b-form-radio v-model="tempSelected" name="climates" :value="climate.climateId" v-for="climate in climates" :key="`climates-${climate.climateId}`">
        {{ climate.climateName }}
        <!-- Description if available and different to name -->
        <span class="d-block small text-muted" v-if="climate.climateDescription && (climate.climateName !== climate.climateDescription)">{{ climate.climateDescription }}</span>
      </b-form-radio>
    </b-form-group>
    <b-form-group :label="$t('pageLocationsMapsClimateOverlaysOpacity')" label-for="climateOpacity">
      <b-form-input id="climateOpacity" v-model="tempOpacity" type="range" :min="0" :max="100" :disabled="tempSelected === null" />
    </b-form-group>
  </b-modal>
</template>

<script>
import climateApi from '@/mixins/api/climate.js'

export default {
  data: function () {
    return {
      tempSelected: null,
      selected: null,
      tempOpacity: 100,
      opacity: 100
    }
  },
  props: {
    climates: {
      type: Array,
      default: () => []
    }
  },
  mixins: [climateApi],
  methods: {
    handleCancel: function () {
      this.selected = null
      this.tempSelected = null
      this.opacity = 100
      this.tempOpacity = 100
      this.$emit('overlay-changed', {
        climateId: null,
        opacity: undefined
      })
    },
    handleOk: function () {
      this.selected = this.tempSelected
      this.opacity = this.tempOpacity
      this.$emit('overlay-changed', {
        climateId: this.selected,
        opacity: this.opacity
      })
    },
    show () {
      this.tempSelected = this.selected
      this.tempOpacity = this.opacity
      this.$nextTick(() => this.$refs.climateModal.show())
    }
  }
}
</script>

<style>
</style>
