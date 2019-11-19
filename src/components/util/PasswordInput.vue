<template>
  <div>
    <b-form-group
      :label="label"
      label-for="password">
      <b-form-input id="password" :value="value" name="password" type="password" trim class="no-border-radius-bottom" autocomplete="password" @keyup="updateScore" required/>
      <b-progress :value="percent" :max="100" height="5px" :variant="variant" class="password-score" id="progress"></b-progress>
      <b-tooltip target="progress" placement="bottom">
        {{ message }}
      </b-tooltip>
    </b-form-group>
  </div>
</template>

<script>
export default {
  data: function () {
    return {
      password: null,
      score: 0,
      variant: 'danger',
      percent: 1,
      message: ''
    }
  },
  props: {
    value: {
      type: String,
      default: null
    },
    label: {
      type: String,
      default: null
    }
  },
  methods: {
    updateScore: function (event) {
      if (event) {
        this.password = event.target.value
      }

      if (!this.password) {
        return
      }

      this.score = this.$zxcvbn(this.password).score

      switch (this.score) {
        case 0:
          this.percent = 1
          this.variant = 'danger'
          this.message = this.$t('tooltipPasswordStrengthOne')
          break
        case 1:
          this.percent = 25
          this.variant = 'danger'
          this.message = this.$t('tooltipPasswordStrengthTwo')
          break
        case 2:
          this.percent = 50
          this.variant = 'warning'
          this.message = this.$t('tooltipPasswordStrengthThree')
          break
        case 3:
          this.percent = 75
          this.variant = 'success'
          this.message = this.$t('tooltipPasswordStrengthFour')
          break
        case 4:
          this.percent = 100
          this.variant = 'success'
          this.message = this.$t('tooltipPasswordStrengthFive')
      }

      this.$emit('input', this.password)
    },
    getPassword: function () {
      return this.password
    },
    getScore: function () {
      return this.score
    }
  },
  mounted: function () {
    this.password = this.value
    this.updateScore()
  }
}
</script>

<style>
  .password-score {
    border-top-left-radius: 0;
    border-top-right-radius: 0;
  }
  .no-border-radius-bottom {
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
  }
</style>
