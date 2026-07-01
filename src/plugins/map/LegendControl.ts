// LegendControl.ts
import { mdiMapLegend } from '@mdi/js'
import L from 'leaflet'

export interface LegendControlOptions extends L.ControlOptions {
}

export class LegendControl extends L.Control {
  private imageUrl: string

  constructor (imageUrl: string, options?: LegendControlOptions) {
    super({ position: 'bottomleft', ...options })
    this.imageUrl = imageUrl
  }

  onAdd (_map: L.Map): HTMLElement {
    const container = L.DomUtil.create('div', 'leaflet-control legend-control leaflet-bar leaflet-control')

    const button = L.DomUtil.create('a', 'legend-control__button', container) as HTMLAnchorElement
    button.href = '#'
    button.innerHTML = this.buildIconSvg(mdiMapLegend)
    button.setAttribute('role', 'button')
    button.setAttribute('aria-label', 'Show legend')

    const image = L.DomUtil.create('img', 'legend-control__image pa-2', container) as HTMLImageElement
    image.src = this.imageUrl
    image.alt = 'Legend'

    // stop map drag/zoom/click from firing when interacting with the control
    L.DomEvent.disableClickPropagation(container)
    L.DomEvent.disableScrollPropagation(container)

    return container
  }

  onRemove (_map: L.Map): void {
    // nothing to clean up, but Leaflet expects the method
  }

  private buildIconSvg(path: string): string {
    return `
      <svg viewBox="0 0 24 24" width="18" height="18" class="legend-control__icon">
        <path d="${path}" fill="currentColor" />
      </svg>
    `
  }
}
