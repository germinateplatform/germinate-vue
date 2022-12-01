<template>
  <div class="base-table">
    <b-table :items="users"
            :fields="columns"
            striped
            responsive
            hover
            outlined
            show-empty
            head-variant="dark"
            :empty-text="$t('paginationNoResult')"
            ref="table">
      <!-- HEAD: Selected checkbox -->
      <template v-slot:head(selected)>
        <b-form-checkbox :checked="allSelected" @change="onSelectionHeaderClicked"/>
      </template>

      <!-- Selected checkbox -->
      <template v-slot:cell(selected)="data">
        <b-form-checkbox :value="data.item.id" v-model="selectedItems" />
      </template>
    </b-table>
    <!-- Action buttons -->
    <b-button-group>
      <b-button v-b-tooltip.hover.bottom
                :title="isAdd ? $t('genericAdd') : $t('genericRemove')"
                @click="$emit('action-clicked', selectedItems)">
        <MdiIcon :path="mdiPlusBox" v-if="isAdd" />
        <MdiIcon :path="mdiDelete" v-else />
      </b-button>
    </b-button-group>
  </div>
</template>

<script>
import MdiIcon from '@/components/icons/MdiIcon'
import { mdiPlusBox, mdiDelete } from '@mdi/js'

export default {
  components: {
    MdiIcon
  },
  props: {
    users: {
      type: Array,
      default: () => []
    },
    isAdd: {
      type: Boolean,
      default: true
    }
  },
  data: function () {
    return {
      mdiPlusBox,
      mdiDelete,
      selectedItems: []
    }
  },
  computed: {
    allSelected: function () {
      return this.selectedItems.length > 0 && this.selectedItems.length === this.users.length
    },
    columns: function () {
      return [
        {
          key: 'selected',
          sortable: false,
          label: ''
        },
        {
          key: 'id',
          sortable: true,
          label: this.$t('tableColumnUserId')
        },
        {
          key: 'username',
          sortable: true,
          label: this.$t('tableColumnUserUsername'),
          preferredSortingColumn: true
        },
        {
          key: 'fullName',
          sortable: true,
          label: this.$t('tableColumnUserFullname')
        },
        {
          key: 'emailAddress',
          sortable: true,
          label: this.$t('tableColumnUserEmail')
        },
        {
          key: 'name',
          sortable: true,
          label: this.$t('tableColumnUserInstitution')
        }
      ]
    }
  },
  watch: {
    users: function () {
      this.selectedItems = []
    }
  },
  methods: {
    onSelectionHeaderClicked: function (value) {
      if (value) {
        this.selectedItems = this.users.map(u => u.id)
      } else {
        this.selectedItems = []
      }
    }
  }
}
</script>

<style>
.base-table table th[aria-sort="none"] {
  padding-right: 0.75em !important;
  background-image: none !important;
}
</style>
