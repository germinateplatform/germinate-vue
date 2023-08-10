<template>
  <b-navbar class="story-navbar" type="dark" :variant="storeActiveStory.isEdit ? 'warning' : 'primary'" sticky>
    <b-navbar-nav class="mr-auto">
      <b-nav-item :disabled="storeActiveStory.index < 1"
                  :active="storeActiveStory.index > 0"
                  @click="selectIndex(storeActiveStory.index - 1)"
                  href="#">
        <MdiIcon :path="mdiChevronLeft" />{{ $t('buttonBack') }}
      </b-nav-item>
    </b-navbar-nav>
    <b-navbar-nav>
      <b-nav-item v-if="storeActiveStory.isEdit && storeToken && userIsAtLeast(storeToken.userType, 'Data Curator')"
                  active
                  @click="showAddModal(0)"
                  href="#">
        <MdiIcon :path="mdiPlusBox" /> {{ $t('buttonAddStepHere') }}
      </b-nav-item>
      <b-nav-item-dropdown :text="stepName" id="story-step-dropdown" class="active" v-if="currentStep">
        <b-dropdown-item href="#" @click="selectIndex(step.storyIndex)" :active="currentStep.storyIndex === step.storyIndex" v-for="step in storeActiveStory.story.storySteps" :key="`story-${storeActiveStory.story.storyId}-step-${step.storyIndex}`">
          <div class="d-flex flex-column">
            <span>{{ step.name }}</span>
            <small class="story-item-description" v-if="step.description" v-b-popover.ds500.hover="step.description"> {{ step.description }} </small>
          </div>
        </b-dropdown-item>
        <b-dropdown-item @click="closeStory" variant="danger"><MdiIcon :path="mdiClose" /> {{ $t('buttonCloseStory') }}</b-dropdown-item>
      </b-nav-item-dropdown>
      <b-nav-item v-if="storeActiveStory.isEdit && storeToken && userIsAtLeast(storeToken.userType, 'Data Curator') && currentStep"
                  active
                  @click="showAddModal(1)"
                  href="#">
        <MdiIcon :path="mdiPlusBox" /> {{ $t('buttonAddStepAfter') }}
      </b-nav-item>
    </b-navbar-nav>
    <b-navbar-nav class="ml-auto">
      <b-nav-item v-if="storeActiveStory.index < storeActiveStory.story.storySteps.length - 1"
                  active
                  @click="selectIndex(storeActiveStory.index + 1)"
                  href="#">
        {{ $t('buttonNext') }} <MdiIcon :path="mdiChevronRight" />
      </b-nav-item>
      <b-nav-item v-else
                  active
                  @click="closeStory"
                  href="#">
        {{ $t('buttonCloseStory') }} <MdiIcon :path="mdiClose" />
      </b-nav-item>
    </b-navbar-nav>

    <b-popover
      v-if="currentStep"
      :show.sync="showPopover"
      target="story-step-dropdown"
      trigger="click blur"
      placement="bottom"
      :title="currentStep.name"
      ref="popover">
      <b-img fluid-grow class="story-popover-image" :src="getSrc(currentStep, 'small')" v-if="currentStep.imageId" />
      <span v-if="currentStep.description">{{ currentStep.description }}</span>
    </b-popover>

    <AddStoryStepModal ref="storyStepModal" :stepIndexOffset="stepIndexOffset" @story-step-added="updateStory" />
  </b-navbar>
</template>

<script>
import { mapGetters } from 'vuex'
import MdiIcon from '@/components/icons/MdiIcon'
import AddStoryStepModal from '@/components/modals/AddStoryStepModal'
import { mdiChevronLeft, mdiChevronRight, mdiClose, mdiPlusBox } from '@mdi/js'
import { getImageUrlById } from '@/mixins/image'
import { userIsAtLeast } from '@/mixins/api/auth'

export default {
  components: {
    AddStoryStepModal,
    MdiIcon
  },
  data: function () {
    return {
      mdiClose,
      mdiPlusBox,
      mdiChevronLeft,
      mdiChevronRight,
      showPopover: true,
      stepIndexOffset: 0
    }
  },
  computed: {
    ...mapGetters([
      'storeActiveStory',
      'storeToken'
    ]),
    currentStep: function () {
      return this.storeActiveStory.story.storySteps.find(s => s.storyIndex === this.storeActiveStory.index)
    },
    stepName: function () {
      if (this.currentStep) {
        return `${this.storeActiveStory.index + 1}/${this.storeActiveStory.story.storySteps.length} - ${this.currentStep.name}`
      } else {
        return ''
      }
    }
  },
  watch: {
    'storeActiveStory.index': {
      immediate: true,
      handler: function (newValue) {
        const step = this.storeActiveStory.story.storySteps.find(s => s.storyIndex === newValue)

        if (step) {
          this.$router.push(step.pageConfig.router)
        }
      }
    },
    currentStep: function () {
      this.showPopover = true
    }
  },
  methods: {
    userIsAtLeast,
    showAddModal: function (offset) {
      this.showPopover = false
      this.stepIndexOffset = offset

      this.$nextTick(() => this.$refs.storyStepModal.show())
    },
    getSrc: function (step, size) {
      return getImageUrlById(step.imageId, {
        type: 'storysteps',
        size: size,
        token: this.storeToken ? this.storeToken.imageToken : ''
      })
    },
    selectIndex: function (index) {
      this.$store.dispatch('setActiveStoryIndex', index)
    },
    closeStory: function () {
      this.$store.dispatch('setActiveStory', null)
    }
  }
}
</script>

<style scoped>
.story-navbar {
  margin-left: -15px;
  margin-right: -15px;
}
.story-item-description {
  text-wrap: wrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}
.story-popover-image {
  margin: -0.5rem -0.75rem 0.5rem -0.75rem;
  min-width: calc(100% + 1.5rem) !important;
  max-width: calc(100% + 1.5rem) !important;
}
</style>
