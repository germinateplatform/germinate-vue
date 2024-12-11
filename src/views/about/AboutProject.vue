<template>
  <div>
    <h1>{{ $t('pageAboutProjectTitle') }}</h1>
    <hr />

    <HtmlTemplateEditor i18nKey="pageAboutProjectText" />

    <template v-if="(groupedItems && groupedItems.length > 0) || isAdmin">
      <h3>{{ $t('pageAboutProjectPartnersTitle') }}</h3>
      <p>{{ $t('pageAboutProjectPartnersText') }}</p>

      <section v-for="(group, groupIndex) in groupedItems" :key="`group-${groupIndex}`">
        <h4 v-if="group.name !== NO_GROUP">{{ group.name }}</h4>
        <draggable v-model="group.items" group="partners" tag="b-row" handle=".drag-handle" class="mt-3">
          <b-col cols=12 lg=6 class="mb-3 col-xxl-4" v-for="(item, itemIndex) in group.items" :key="`about-item-${itemIndex}`">
            <b-card no-body class="h-100">
              <b-row no-gutters class="h-100 position-relative">
                <b-form-checkbox class="editing-switch" switch v-model="item.isEditing" v-if="isAdmin" />
                <b-col md=4 class="d-flex align-items-center justify-content-center bg-light">
                  <b-card-img class="about-card-image p-4" :src="`${storeBaseUrl}image/src/?name=${item.image}&type=template`" alt="Image"></b-card-img>
                </b-col>
                <b-col md=8>
                  <b-card-body class="d-flex flex-column justify-content-between align-items-start h-100">
                    <div class="w-100">
                      <div class="d-flex flex-row justify-content-between align-items-center mb-3">
                        <b-form-input v-model="item.name" v-if="isAdmin && item.isEditing" />
                        <b-card-title class="mb-0" v-else>{{ item.name }}</b-card-title>
                        <MdiIcon className="drag-handle" :path="mdiDrag" v-if="isAdmin" />
                      </div>
                      <b-card-text class="text-muted" v-if="item.description">{{ item.description }}</b-card-text>
                    </div>
                    <b-button-group class="mt-3">
                      <b-button variant="primary" rel="noopener noreferrer" :href="item.url"><MdiIcon :path="mdiOpenInNew" /> {{ $t('buttonVisit') }}</b-button>
                      <b-button variant="danger" @click="deleteItem(groupIndex, itemIndex)" v-if="isAdmin"><MdiIcon :path="mdiDelete" /> {{ $t('buttonDelete') }}</b-button>
                    </b-button-group>
                  </b-card-body>
                </b-col>
              </b-row>
            </b-card>
          </b-col>
        </draggable>
      </section>

      <b-button-group v-if="isAdmin">
        <b-button @click="save" variant="success"><MdiIcon :path="mdiContentSave" /> {{ $t('buttonSubmit') }}</b-button>
        <b-button @click="$refs.addAboutPartnerModal.show()" variant="info"><MdiIcon :path="mdiPlusBox" /> {{ $t('genericAdd') }}</b-button>
      </b-button-group>
    </template>

    <AddAboutPartnerModal v-if="isAdmin" :groupNames="groupNames" ref="addAboutPartnerModal" @partner-added="update" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { apiGetTemplateAboutConfig, apiPatchTemplateAboutConfig } from '@/mixins/api/misc'
import { userIsAtLeast, USER_TYPE_ADMINISTRATOR } from '@/mixins/api/auth'
import { mdiDrag, mdiPlusBox, mdiContentSave, mdiDelete, mdiOpenInNew } from '@mdi/js'

import HtmlTemplateEditor from '@/components/util/HtmlTemplateEditor'
import AddAboutPartnerModal from '@/components/modals/AddAboutPartnerModal'
import MdiIcon from '@/components/icons/MdiIcon'
import draggable from 'vuedraggable'

const NO_GROUP = '--NO_GROUP--'

export default {
  components: {
    HtmlTemplateEditor,
    AddAboutPartnerModal,
    MdiIcon,
    draggable
  },
  data: function () {
    return {
      NO_GROUP,
      mdiDrag,
      mdiPlusBox,
      mdiContentSave,
      mdiOpenInNew,
      mdiDelete,
      itemCount: 0,
      groupedItems: []
    }
  },
  computed: {
    ...mapGetters([
      'storeBaseUrl',
      'storeToken'
    ]),
    isAdmin: function () {
      return this.storeToken && userIsAtLeast(this.storeToken.userType, USER_TYPE_ADMINISTRATOR)
    },
    groupNames: function () {
      if (this.groupedItems) {
        const gs = new Set()
        this.groupedItems.forEach(g => gs.add(g.name))
        gs.delete(NO_GROUP)
        return [...gs]
      } else {
        return []
      }
    }
  },
  methods: {
    deleteItem: function (groupIndex, index) {
      this.groupedItems[groupIndex].items.splice(index, 1)
    },
    save: function () {
      const list = []

      this.groupedItems.forEach(g => {
        g.items.forEach(i => {
          if (g.name === NO_GROUP) {
            delete i.group
          } else {
            i.group = g.name
          }
          list.push(i)
        })
      })

      apiPatchTemplateAboutConfig(list, result => {
        // TODO
      })
    },
    update: function () {
      apiGetTemplateAboutConfig(result => {
        if (result && result.length > 0) {
          const groups = [{
            name: NO_GROUP,
            items: []
          }]

          if (result) {
            result.forEach(i => {
              const groupName = i.group || NO_GROUP
              i.isEditing = false

              const match = groups.find(g => g.name === groupName)

              if (!match) {
                groups.push({
                  name: groupName,
                  items: [i]
                })
              } else {
                match.items.push(i)
              }
            })
          }

          this.groupedItems = groups
        }
      }, {
        codes: [404],
        callback: () => {
          this.itemCount = 0
          this.groupedItems = []
          // Do nothing here, it just means there is no config file
        }
      })
    }
  },
  mounted: function () {
    this.update()
  }
}
</script>

<style>
.drag-handle:hover {
  cursor: move;
}
</style>

<style scoped>
.about-card-image {
  max-width: 300px;
  max-height: 300px;
}
.editing-switch {
  position: absolute;
  bottom: 1em;
  right: 1em;
}
</style>
