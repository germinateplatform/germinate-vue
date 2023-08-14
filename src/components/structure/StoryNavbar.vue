<template>
  <b-navbar class="story-navbar" id="story-navbar" type="dark" :variant="storeActiveStory.isEdit ? 'warning' : 'primary'" sticky>
    <b-navbar-nav class="mr-auto">
      <b-nav-item :disabled="storeActiveStory.index < 1"
                  :active="storeActiveStory.index > 0"
                  @click="selectIndex(storeActiveStory.index - 1)"
                  href="#">
        <MdiIcon :path="mdiChevronLeft" />{{ $t('buttonBack') }}
      </b-nav-item>
    </b-navbar-nav>
    <b-navbar-nav>
      <b-nav-item-dropdown id="story-step-dropdown" class="active" v-if="currentStep" @show="showPopover = false">
        <template v-slot:button-content>
          <MdiIcon :path="mdiFormatListNumbered" /> {{ stepName }}
        </template>
        <b-dropdown-item href="#" @click="selectIndex(step.storyIndex)" :active="currentStep.storyIndex === step.storyIndex" v-for="step in storeActiveStory.story.storySteps" :key="`story-${storeActiveStory.story.storyId}-step-${step.storyIndex}`">
          <div class="d-flex flex-column">
            <span>{{ step.name }}</span>
            <small class="story-item-description" v-if="step.description" v-b-popover.ds500.hover="step.description"> {{ step.description }} </small>
          </div>
        </b-dropdown-item>
        <b-dropdown-item @click="closeStory" variant="danger"><MdiIcon :path="mdiClose" /> {{ $t('buttonCloseStory') }}</b-dropdown-item>
      </b-nav-item-dropdown>

      <b-nav-item-dropdown class="active" v-if="storeActiveStory.isEdit && storeToken && userIsAtLeast(storeToken.userType, 'Data Curator')" @show="showPopover = false">
        <template v-slot:button-content>
          <MdiIcon :path="mdiPencil" /> {{ $t('buttonEdit') }}
        </template>
        <b-dropdown-item href="#" @click="showAddModal(0)">
          <MdiIcon :path="mdiArrowDown" /> {{ $t('buttonAddStepHere') }}
        </b-dropdown-item>
        <b-dropdown-item @click="showAddModal(1)" href="#" :disabled="!currentStep">
          <MdiIcon :path="mdiArrowDownRight" /> {{ $t('buttonAddStepAfter') }}
        </b-dropdown-item>
        <b-dropdown-item @click="deleteStep" href="#" variant="danger">
          <MdiIcon :path="mdiDelete" /> {{ $t('buttonDelete') }}
        </b-dropdown-item>
      </b-nav-item-dropdown>
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
      target="story-navbar"
      placement="bottom"
      triggers="manual"
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
import { mdiChevronLeft, mdiChevronRight, mdiClose, mdiArrowDown, mdiArrowDownRight, mdiFormatListNumbered, mdiDelete, mdiPencil } from '@mdi/js'
import { getImageUrlById } from '@/mixins/image'
import { userIsAtLeast } from '@/mixins/api/auth'
import { apiDeleteStoryStep, apiPostStoryTable } from '@/mixins/api/misc'

export default {
  components: {
    AddStoryStepModal,
    MdiIcon
  },
  data: function () {
    return {
      mdiClose,
      mdiArrowDown,
      mdiArrowDownRight,
      mdiDelete,
      mdiPencil,
      mdiFormatListNumbered,
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
      this.$nextTick(() => {
        this.showPopover = true
      })
    }
  },
  methods: {
    userIsAtLeast,
    updateStory: function (targetIndex) {
      apiPostStoryTable({
        page: 1,
        limit: 1,
        filter: [{
          column: 'storyId',
          comparator: 'equals',
          operator: 'and',
          values: [this.storeActiveStory.story.storyId]
        }]
      }, result => {
        if (result && result.data && result.data.length > 0) {
          this.$store.dispatch('setActiveStory', {
            story: result.data[0],
            index: targetIndex,
            isEdit: true
          })
        }
      })
    },
    deleteStep: function () {
      this.$bvModal.msgBoxConfirm(this.$t('modalTitleSure'), {
        okVariant: 'danger',
        okTitle: this.$t('genericYes'),
        cancelTitle: this.$t('genericNo')
      })
        .then(value => {
          if (value) {
            apiDeleteStoryStep(this.storeActiveStory.story.storyId, this.currentStep.id, () => {
              const targetIndex = Math.max(0, Math.min(this.currentStep.storyIndex, this.storeActiveStory.story.storySteps.length))
              this.updateStory(targetIndex)
            })
          }
        })
    },
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

      this.$router.push({ name: 'stories' })
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
