import type { Layer, Map } from 'leaflet'
import type { FeatureCollectionWithFilename } from 'shpjs'
import L from 'leaflet'

import emitter from 'tiny-emitter/instance'

function addShapefileToMap (map: Map, shp: FeatureCollectionWithFilename): { [key: string]: Layer[] } {
  const bounds = L.latLngBounds([])
  const shapefileLayers: { [key: string]: Layer[] } = {}
  shp.features.forEach(f => {
    if (f.properties?.germplasm) {
      const layer = L.geoJSON(f, {
        onEachFeature: (feature, layer) => {
          if (feature.geometry && feature.geometry.type === 'Polygon' && feature.geometry.coordinates) {
            feature.geometry.coordinates.forEach(c => c.forEach(cd => bounds.extend([cd[1], cd[0]])))
          }
          if (feature.properties) {
            layer.bindPopup(Object.keys(feature.properties).map(function (k) {
              if (k === '__color__') {
                return null
              }
              return k + ': ' + feature.properties[k]
            }).join('<br />'), {
              maxHeight: 200,
            })
          }

          layer.on({
            click: e => {
              if (e && e.target && e.target.feature && e.target.feature.properties) {
                const row = e.target.feature.properties.row
                const column = e.target.feature.properties.column
                const germplasm = e.target.feature.properties.germplasm
                const rep = `${e.target.feature.properties.rep}`

                emitter.emit('shapefile-germplasm-selected', {
                  germplasm,
                  rep,
                  row,
                  column,
                })
              }
            },
          })
        },
        style: () => {
          return {
            opacity: 1,
            fillOpacity: 1,
            radius: 1,
            fillColor: 'rgba(var(--v-theme-primary), 0.3)',
            color: 'rgba(var(--v-theme-primary), 0.6)',
            weight: 1,
          }
        }
      })

      layer.addTo(map)

      if (shapefileLayers[`${f.properties.row}-${f.properties.column}`]) {
        shapefileLayers[`${f.properties.row}-${f.properties.column}`].push(layer)
      } else {
        shapefileLayers[`${f.properties.row}-${f.properties.column}`] = [layer]
      }
    }
  })

  return shapefileLayers
}

export {
  addShapefileToMap,
}
