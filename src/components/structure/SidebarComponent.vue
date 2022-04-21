<template>
  <sidebar-menu :menu="menu"
                :width="width"
                widthCollapsed="50px"
                :collapsed="collapsed"
                @toggle-collapse="ev => $emit('toggle-collapse', ev)">
    <span slot="toggle-icon">
      <MdiIcon :path="mdiArrowCollapseRight" v-if="collapsed" />
      <MdiIcon :path="mdiArrowCollapseLeft" v-else />
    </span>
    <span slot="dropdown-icon">
      <MdiIcon :path="mdiChevronLeft" />
    </span>
  </sidebar-menu>
</template>

<script>
import MdiIcon from '@/components/icons/MdiIcon'
import SidebarIcon from '@/components/icons/SidebarIcon'
import SidebarLogoComponent from '@/components/structure/SidebarLogoComponent'

import { SidebarMenu } from 'vue-sidebar-menu'
import 'vue-sidebar-menu/dist/vue-sidebar-menu.css'

import { mdiArrowCollapseLeft, mdiArrowCollapseRight, mdiAtom, mdiChartAreaspline, mdiChartGantt, mdiChartSankey, mdiChevronLeft, mdiDatabase, mdiDna, mdiEarth, mdiFileDownload, mdiFileExport, mdiFlask, mdiFolderTable, mdiFormatIndentIncrease, mdiGroup, mdiHarddisk, mdiHome, mdiImageMultiple, mdiInformation, mdiInformationOutline, mdiMagnify, mdiMap, mdiMapSearch, mdiNewspaperVariant, mdiPulse, mdiReorderVertical, mdiShovel, mdiSprout, mdiTagMultiple, mdiTagTextOutline, mdiWeatherSnowyRainy } from '@mdi/js'

import formattingMixin from '@/mixins/formatting'
import statsApi from '@/mixins/api/stats'

const emitter = require('tiny-emitter/instance')
const germinateLogo = 'M 11.999836,0 C 5.384778,0 -3.9999998e-7,5.38515 0,12.00026 -3.9999998e-7,18.61531 5.384778,24.00011 11.999836,24.00011 18.614894,24.00011 24,18.61531 24,12.00026 24,5.38515 18.614894,0 11.999836,0 Z m 0,2.09227 c 5.484271,0 9.907984,4.42367 9.907984,9.90799 0,5.48425 -4.423713,9.90754 -9.907984,9.90754 -5.4842703,0 -9.9076558,-4.42329 -9.9076558,-9.90754 0,-5.48432 4.4233855,-9.90799 9.9076558,-9.90799 z M 9.5003025,5.50579 c -2.4997191,0 -2.4997043,0 -3.7494633,2.16472 L 4.500991,9.83539 c -1.2498943,2.16476 -1.2498943,2.16487 0,4.32945 l 1.2498482,2.16476 c 1.261759,2.16476 1.2617442,2.16476 3.7494633,2.16476 2.4996545,0 2.4997185,0 3.7495455,-2.16476 h -8.1e-5 c 1.249812,-2.16476 1.249787,-2.16469 0,-4.32934 v -1.1e-4 H 10.750152 8.2505363 l 1.2497662,2.16469 H 12 L 10.750152,16.3296 H 8.2505363 L 7.0006881,14.16484 5.7508392,12.00015 7.0006881,9.83539 8.2505363,7.67051 h 2.4996157 2.499696 L 12,5.50579 Z m 4.9993125,0 1.249849,2.16472 1.249848,2.16488 h -2.499697 l -1.249767,2.16476 h 2.499616 l 1.249848,2.16469 -1.249848,2.16476 -1.249849,2.16476 h 2.499697 l 1.249849,-2.16476 1.249766,-2.16476 c 1.249826,-2.16476 1.249826,-2.16469 0,-4.32945 L 18.249161,7.67051 16.999312,5.50579 Z'

export default {
  components: {
    MdiIcon,
    SidebarMenu
  },
  props: {
    width: {
      type: String,
      default: '300px'
    },
    collapsed: {
      type: Boolean,
      default: false
    }
  },
  data: function () {
    return {
      mdiArrowCollapseLeft,
      mdiArrowCollapseRight,
      mdiChevronLeft,
      badgeCounts: {}
    }
  },
  computed: {
    menu: function () {
      return [
        {
          header: true,
          title: 'Main Navigation',
          hiddenOnCollapse: true
        },
        {
          href: { name: 'home' },
          title: this.$t('menuHome'),
          icon: {
            element: SidebarIcon,
            attributes: {
              path: mdiHome
            }
          }
        },
        {
          title: this.$t('menuData'),
          icon: {
            element: SidebarIcon,
            attributes: {
              path: mdiHarddisk
            }
          },
          child: [
            {
              title: this.$t('menuGermplasm'),
              href: { name: 'germplasm' },
              icon: {
                element: SidebarIcon,
                attributes: {
                  path: mdiSprout
                }
              },
              badge: {
                text: this.getBadgeCount(this.badgeCounts, 'germplasm'),
                class: 'vsm--badge vsm--badge_default'
              }
            },
            {
              title: this.$t('menuGenotypicData'),
              icon: {
                element: SidebarIcon,
                attributes: {
                  path: mdiDna
                }
              },
              child: [
                {
                  title: this.$t('menuGenotypicMarkers'),
                  badge: {
                    text: this.getBadgeCount(this.badgeCounts, 'markers'),
                    class: 'vsm--badge vsm--badge_default'
                  },
                  href: { name: 'markers' },
                  icon: {
                    element: SidebarIcon,
                    attributes: {
                      path: mdiFormatIndentIncrease,
                      rotate: 90
                    }
                  }
                },
                {
                  title: this.$t('menuGenotypicMaps'),
                  badge: {
                    text: this.getBadgeCount(this.badgeCounts, 'maps'),
                    class: 'vsm--badge vsm--badge_default'
                  },
                  href: { name: 'maps' },
                  icon: {
                    element: SidebarIcon,
                    attributes: {
                      path: mdiReorderVertical
                    }
                  }
                },
                {
                  title: this.$t('menuGenotypicDataExport'),
                  badge: {
                    text: this.getBadgeCount(this.badgeCounts, 'datasetsGenotype'),
                    class: 'vsm--badge vsm--badge_default'
                  },
                  href: '/data/export/genotype',
                  icon: {
                    element: SidebarIcon,
                    attributes: {
                      path: mdiDna
                    }
                  }
                },
                {
                  title: this.$t('menuAlleleFrequencyDataExport'),
                  badge: {
                    text: this.getBadgeCount(this.badgeCounts, 'datasetsAllelefreq'),
                    class: 'vsm--badge vsm--badge_default'
                  },
                  href: '/data/export/allelefreq',
                  icon: {
                    element: SidebarIcon,
                    attributes: {
                      path: mdiPulse
                    }
                  }
                }
              ]
            },
            {
              title: this.$t('menuTrialsData'),
              icon: {
                element: SidebarIcon,
                attributes: {
                  path: mdiTagMultiple
                }
              },
              child: [
                {
                  title: this.$t('menuTrialsTraits'),
                  badge: {
                    text: this.getBadgeCount(this.badgeCounts, 'traits'),
                    class: 'vsm--badge vsm--badge_default'
                  },
                  href: { name: 'traits' },
                  icon: {
                    element: SidebarIcon,
                    attributes: {
                      path: mdiTagTextOutline
                    }
                  }
                },
                {
                  title: this.$t('menuTrialsDataExport'),
                  badge: {
                    text: this.getBadgeCount(this.badgeCounts, 'datasetsTrials'),
                    class: 'vsm--badge vsm--badge_default'
                  },
                  href: '/data/export/trials',
                  icon: {
                    element: SidebarIcon,
                    attributes: {
                      path: mdiShovel
                    }
                  }
                }
              ]
            },
            {
              title: this.$t('menuGeography'),
              icon: {
                element: SidebarIcon,
                attributes: {
                  path: mdiEarth
                }
              },
              child: [
                {
                  title: this.$t('menuLocations'),
                  badge: {
                    text: this.getBadgeCount(this.badgeCounts, 'locations'),
                    class: 'vsm--badge vsm--badge_default'
                  },
                  href: { name: 'locations' },
                  icon: {
                    element: SidebarIcon,
                    attributes: {
                      path: mdiMap
                    }
                  }
                },
                {
                  title: this.$t('menuGeographicSearch'),
                  href: { name: 'geographic-search' },
                  icon: {
                    element: SidebarIcon,
                    attributes: {
                      path: mdiMapSearch
                    }
                  }
                }
              ]
            },
            {
              title: this.$t('menuClimateData'),
              icon: {
                element: SidebarIcon,
                attributes: {
                  path: mdiWeatherSnowyRainy
                }
              },
              child: [
                {
                  title: this.$t('menuClimateClimates'),
                  badge: {
                    text: this.getBadgeCount(this.badgeCounts, 'climates'),
                    class: 'vsm--badge vsm--badge_default'
                  },
                  href: { name: 'climates' },
                  icon: {
                    element: SidebarIcon,
                    attributes: {
                      path: mdiWeatherSnowyRainy
                    }
                  }
                },
                {
                  title: this.$t('menuClimateDataExport'),
                  badge: {
                    text: this.getBadgeCount(this.badgeCounts, 'datasetsClimate'),
                    class: 'vsm--badge vsm--badge_default'
                  },
                  href: '/data/export/climate',
                  icon: {
                    element: SidebarIcon,
                    attributes: {
                      path: mdiChartSankey
                    }
                  }
                }
              ]
            },
            {
              title: this.$t('menuCompoundsData'),
              icon: {
                element: SidebarIcon,
                attributes: {
                  path: mdiFlask
                }
              },
              child: [
                {
                  title: this.$t('menuCompoundsCompounds'),
                  badge: {
                    text: this.getBadgeCount(this.badgeCounts, 'compounds'),
                    class: 'vsm--badge vsm--badge_default'
                  },
                  href: { name: 'compounds' },
                  icon: {
                    element: SidebarIcon,
                    attributes: {
                      path: mdiAtom
                    }
                  }
                },
                {
                  title: this.$t('menuCompoundDataExport'),
                  badge: {
                    text: this.getBadgeCount(this.badgeCounts, 'datasetsCompound'),
                    class: 'vsm--badge vsm--badge_default'
                  },
                  href: '/data/export/compound',
                  icon: {
                    element: SidebarIcon,
                    attributes: {
                      path: mdiFlask
                    }
                  }
                }
              ]
            },
            {
              title: this.$t('menuCrossDataTypeComparison'),
              href: { name: 'export-cross-comparison' },
              icon: {
                element: SidebarIcon,
                attributes: {
                  path: mdiChartGantt
                }
              }
            },
            {
              title: this.$t('menuDatasets'),
              badge: {
                text: this.getBadgeCount(this.badgeCounts, 'datasets'),
                class: 'vsm--badge vsm--badge_default'
              },
              href: { name: 'datasets' },
              icon: {
                element: SidebarIcon,
                attributes: {
                  path: mdiDatabase
                }
              }
            },
            {
              title: this.$t('menuExperiments'),
              badge: {
                text: this.getBadgeCount(this.badgeCounts, 'experiments'),
                class: 'vsm--badge vsm--badge_default'
              },
              href: { name: 'experiments' },
              icon: {
                element: SidebarIcon,
                attributes: {
                  path: mdiFolderTable
                }
              }
            },
            {
              title: this.$t('menuDataResources'),
              badge: {
                text: this.getBadgeCount(this.badgeCounts, 'fileresources'),
                class: 'vsm--badge vsm--badge_default'
              },
              href: { name: 'data-resources' },
              icon: {
                element: SidebarIcon,
                attributes: {
                  path: mdiFileDownload
                }
              }
            },
            {
              title: this.$t('menuDataStatistics'),
              href: { name: 'statistics' },
              icon: {
                element: SidebarIcon,
                attributes: {
                  path: mdiChartAreaspline
                }
              }
            }
          ]
        },
        {
          title: this.$t('menuPublications'),
          badge: {
            text: this.getBadgeCount(this.badgeCounts, 'publications'),
            class: 'vsm--badge vsm--badge_default'
          },
          href: { name: 'publications' },
          icon: {
            element: SidebarIcon,
            attributes: {
              path: mdiNewspaperVariant
            }
          }
        },
        {
          title: this.$t('menuGroups'),
          badge: {
            text: this.getBadgeCount(this.badgeCounts, 'groups'),
            class: 'vsm--badge vsm--badge_default'
          },
          href: { name: 'groups' },
          icon: {
            element: SidebarIcon,
            attributes: {
              path: mdiGroup
            }
          }
        },
        {
          title: this.$t('menuImages'),
          badge: {
            text: this.getBadgeCount(this.badgeCounts, 'images'),
            class: 'vsm--badge vsm--badge_default'
          },
          href: { name: 'images' },
          icon: {
            element: SidebarIcon,
            attributes: {
              path: mdiImageMultiple
            }
          }
        },
        {
          title: this.$t('menuSearch'),
          href: { name: 'search' },
          icon: {
            element: SidebarIcon,
            attributes: {
              path: mdiMagnify
            }
          }
        },
        {
          title: this.$t('menuAbout'),
          icon: {
            element: SidebarIcon,
            attributes: {
              path: mdiInformation
            }
          },
          child: [
            {
              title: this.$t('menuAboutProject'),
              href: { name: 'about-project' },
              icon: {
                element: SidebarIcon,
                attributes: {
                  path: mdiInformationOutline
                }
              }
            },
            {
              title: this.$t('menuAboutGerminate'),
              href: { name: 'about-germinate' },
              icon: {
                element: SidebarIcon,
                attributes: {
                  path: germinateLogo
                }
              }
            },
            {
              title: this.$t('menuAboutExportFormat'),
              href: { name: 'about-export-formats' },
              icon: {
                element: SidebarIcon,
                attributes: {
                  path: mdiFileExport
                }
              }
            }
          ]
        }, {
          component: SidebarLogoComponent
        }
      ]
    }
  },
  mixins: [formattingMixin, statsApi],
  methods: {
    getBadgeCount: function (stats, key) {
      let value = null

      if (stats && stats[key]) {
        value = stats[key]
      }

      if (value === undefined || value === null) {
        return '0'
      } else {
        return this.getNumberWithSuffix(value, 1)
      }
    },
    updateBadgeCounts: function () {
      this.apiGetOverviewStats(result => {
        this.badgeCounts = result
      })
    }
  },
  beforeDestroy: function () {
    emitter.off('update-sidebar-menu', this.updateBadgeCounts)
  },
  mounted: function () {
    this.updateBadgeCounts()
    emitter.on('update-sidebar-menu', this.updateBadgeCounts)
  }
}
</script>

<style>
.vsm--mobile-item {
  max-width: 75vw !important;
}

.vsm--scroll-wrapper::-webkit-scrollbar {
    display: none; /* Chrome */
}
.vsm--scroll-wrapper {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}
.v-sidebar-menu .vsm--dropdown>.vsm--list {
    padding-left: 15px;
}

.v-sidebar-menu .vsm--link.vsm--link_active {
  box-shadow: 3px 0px 0px 0px #23a1d7 inset;
}

.v-sidebar-menu.vsm_expanded .vsm--item_open .vsm--link_level-1 {
  background-color: #23a1d7;
}

.v-sidebar-menu.vsm_expanded .vsm--item_open .vsm--link_level-1 .vsm--icon {
  background-color: #23a1d7;
}

.v-sidebar-menu.vsm_collapsed .vsm--link_level-1.vsm--link_hover .vsm--icon, .v-sidebar-menu.vsm_collapsed .vsm--link_level-1:hover .vsm--icon {
  background-color: #23a1d7;
}

.v-sidebar-menu .vsm--mobile-bg {
  background-color: #23a1d7;
}

.v-sidebar-menu .vsm--link_hover, .v-sidebar-menu .vsm--link:hover {
  background-color: #23a1d7;
}

@media (min-width: 768px) {
  .vsm--mobile-item {
    max-width: 400px !important;
  }
}
</style>
