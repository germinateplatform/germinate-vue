// Flagship crops of this Germinate instance, shared by the home page and the passport page.
// "groupName" is the name of the matching germplasm group in Germinate. The colours are the "cp-crop-<key>" classes
// in src/assets/custom-page.css.
import { mdiBarley, mdiFlowerOutline } from '@mdi/js'
import { customBarley, customLettuce, customPea } from '@/components/icons/custom-icons'

const FLAGSHIP_CROPS = [
  { key: 'wheat', name: 'Wheat', groupName: 'Wheat', icon: mdiBarley },
  { key: 'barley', name: 'Barley', groupName: 'Barley', icon: customBarley },
  { key: 'pea', name: 'Pea', groupName: 'Pea', icon: customPea },
  { key: 'lettuce', name: 'Lettuce', groupName: 'Lettuce', icon: customLettuce },
  { key: 'brassica', name: 'Brassica', groupName: 'Brassicas', icon: mdiFlowerOutline }
]

// The flagship crop of a germplasm group name (case-insensitive), or null
const findFlagshipCrop = groupName => {
  const name = groupName ? `${groupName}`.trim().toLowerCase() : null
  return name ? FLAGSHIP_CROPS.find(c => c.groupName.toLowerCase() === name) || null : null
}

export {
  FLAGSHIP_CROPS,
  findFlagshipCrop
}
