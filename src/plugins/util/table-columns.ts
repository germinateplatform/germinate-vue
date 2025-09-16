import { FilterComparator, type ViewTableDatasets, type ViewTableGermplasm, type ViewTableLocations } from '@/plugins/types/germinate'
import type { ExtendedDataTableHeader } from '@/plugins/types/ExtendedDataTableHeader'
import { getNumberWithSuffix } from '@/plugins/util/formatting'

const germplasmColumns: ExtendedDataTableHeader[] = [{
  key: 'germplasmId',
  title: 'tableColumnGermplasmId',
  dataType: 'integer',
  searchable: true,
}, {
  key: 'germplasmName',
  title: 'tableColumnGermplasmName',
  dataType: 'string',
  preferredSortingColumn: true,
  searchable: true,
}, {
  key: 'germplasmDisplayName',
  title: 'tableColumnGermplasmDisplayName',
  dataType: 'string',
  searchable: true,
}, {
  key: 'germplasmGid',
  dataType: 'string',
  title: 'tableColumnGermplasmGeneralIdentifier',
  searchable: true,
}, {
  key: 'germplasmNumber',
  dataType: 'string',
  title: 'tableColumnGermplasmNumber',
  searchable: true,
}, {
  key: 'germplasmPuid',
  dataType: 'string',
  title: 'tableColumnGermplasmPuid',
  searchable: true,
}, {
  key: 'entityTypeName',
  dataType: 'entityType',
  title: 'tableColumnEntityType',
}, {
  key: 'entityParentName',
  dataType: 'string',
  title: 'tableColumnGermplasmEntityParentName',
}, {
  key: 'entityParentGeneralIdentifier',
  dataType: 'string',
  title: 'tableColumnGermplasmEntityParentGeneralIdentifier',
}, {
  key: 'biologicalStatusName',
  dataType: 'string',
  title: 'tableColumnBiologicalStatus',
  searchable: true,
}, {
  key: 'genus',
  dataType: 'string',
  title: 'tableColumnGenus',
  cellProps: { class: 'font-italic' },
  searchable: true,
}, {
  key: 'species',
  dataType: 'string',
  title: 'tableColumnSpecies',
  cellProps: { class: 'font-italic' },
  searchable: true,
}, {
  key: 'subtaxa',
  dataType: 'string',
  title: 'tableColumnSubtaxa',
  cellProps: { class: 'font-italic' },
  searchable: true,
}, {
  key: 'synonyms',
  dataType: 'json',
  title: 'tableColumnSynonyms',
  searchable: true,
}, {
  key: 'collectorNumber',
  dataType: 'string',
  title: 'tableColumnCollectorNumber',
}, {
  key: 'institutions',
  dataType: 'jsonObject',
  title: 'tableColumnGermplasmInstitutions',
  // @ts-ignore
  value: (value: ViewTableGermplasm) => value.institutions ? value.institutions.map(i => `Code: ${i.code || 'N/A'}, name: ${i.name}, type: ${i.type}`).join('; ') : undefined,
}, {
  key: 'locationId',
  dataType: 'integer',
  title: 'tableColumnGermplasmLocationId',
  visibleInTable: false,
  visibleInFilter: true,
}, {
  key: 'location',
  visibleInTable: false,
  visibleInFilter: true,
  title: 'tableColumnGermplasmLocation',
  dataType: 'string',
  searchable: true,
}, {
  key: 'data-table-expand',
  visibleInFilter: false,
  title: 'tableColumnGermplasmLocation',
  dataType: 'string',
}, {
  key: 'elevation',
  dataType: 'float',
  align: 'end' as 'start' | 'end' | 'center',
  title: 'tableColumnElevation',
  // @ts-ignore
  value: (value: ViewTableGermplasm) => value.elevation ? value.elevation.toFixed(2) : undefined,
}, {
  key: 'latitude',
  dataType: 'float',
  align: 'end' as 'start' | 'end' | 'center',
  title: 'tableColumnLatitude',
  // @ts-ignore
  value: (value: ViewTableGermplasm) => value.latitude ? value.latitude.toFixed(2) : undefined,
}, {
  key: 'longitude',
  dataType: 'float',
  align: 'end' as 'start' | 'end' | 'center',
  title: 'tableColumnLongitude',
  // @ts-ignore
  value: (value: ViewTableGermplasm) => value.longitude ? value.longitude.toFixed(2) : undefined,
}, {
  key: 'countryName',
  dataType: 'string',
  title: 'tableColumnCountryName',
  searchable: true,
}, {
  key: 'hasTrialsData',
  dataType: 'boolean',
  title: 'tableColumnHasTrialsData',
  cellProps: { class: 'px-1 mx-0' },
  headerProps: { class: 'px-1 mx-0' },
}, {
  key: 'hasGenotypicData',
  dataType: 'boolean',
  title: 'tableColumnHasGenotypicData',
  cellProps: { class: 'px-1 mx-0' },
  headerProps: { class: 'px-1 mx-0' },
}, {
  key: 'hasPedigreeData',
  dataType: 'boolean',
  title: 'tableColumnHasPedigreeData',
  cellProps: { class: 'px-1 mx-0' },
  headerProps: { class: 'px-1 mx-0' },
}, {
  key: 'hasAllelefreqData',
  dataType: 'boolean',
  title: 'tableColumnHasAllelefreqData',
  cellProps: { class: 'px-1 mx-0' },
  headerProps: { class: 'px-1 mx-0' },
}, {
  key: 'imageCount',
  dataType: 'integer',
  align: 'end' as 'start' | 'end' | 'center',
  title: 'tableColumnGermplasmImageCount',
}, {
  key: 'pdci',
  dataType: 'float',
  align: 'center' as 'start' | 'end' | 'center',
  title: 'tableColumnPdci',
}]

const locationColumns: ExtendedDataTableHeader[] = [{
  key: 'locationId',
  title: 'tableColumnLocationId',
  dataType: 'integer',
  searchable: true,
}, {
  key: 'locationName',
  title: 'tableColumnLocationName',
  dataType: 'string',
  searchable: true,
}, {
  key: 'locationRegion',
  title: 'tableColumnLocationRegion',
  dataType: 'string',
  searchable: true,
}, {
  key: 'locationState',
  title: 'tableColumnLocationState',
  dataType: 'string',
  searchable: true,
}, {
  key: 'locationType',
  title: 'tableColumnLocationType',
  dataType: 'locationType',
  searchable: true,
}, {
  key: 'locationElevation',
  dataType: 'float',
  align: 'end' as 'start' | 'end' | 'center',
  title: 'tableColumnLocationElevation',
  // @ts-ignore
  value: (value: ViewTableLocations) => value.locationElevation ? value.locationElevation.toFixed(2) : undefined,
}, {
  key: 'locationLatitude',
  dataType: 'float',
  align: 'end' as 'start' | 'end' | 'center',
  title: 'tableColumnLocationLatitude',
  // @ts-ignore
  value: (value: ViewTableLocations) => value.locationLatitude ? value.locationLatitude.toFixed(2) : undefined,
}, {
  key: 'locationLongitude',
  dataType: 'float',
  align: 'end' as 'start' | 'end' | 'center',
  title: 'tableColumnLocationLongitude',
  // @ts-ignore
  value: (value: ViewTableLocations) => value.locationLongitude ? value.locationLongitude.toFixed(2) : undefined,
}, {
  key: 'countryName',
  dataType: 'string',
  title: 'tableColumnLocationCountryName',
  searchable: true,
}]

const pedigreeColumns: ExtendedDataTableHeader[] = [
  {
    key: 'datasetId',
    dataType: 'integer',
    title: 'tableColumnPedigreeDatasetId',
  },
  {
    key: 'datasetName',
    dataType: 'string',
    title: 'tableColumnPedigreeDatasetName',
  },
  {
    key: 'parentId',
    dataType: 'integer',
    title: 'tableColumnPedigreeParentId',
  }, {
    key: 'parentGid',
    dataType: 'string',
    title: 'tableColumnPedigreeParentGid',
    searchable: true,
  }, {
    key: 'parentName',
    dataType: 'string',
    title: 'tableColumnPedigreeParentName',
    searchable: true,
  }, {
    key: 'childId',
    dataType: 'integer',
    title: 'tableColumnPedigreeChildId',
  }, {
    key: 'childGid',
    dataType: 'string',
    title: 'tableColumnPedigreeChildGid',
    searchable: true,
  }, {
    key: 'childName',
    dataType: 'string',
    title: 'tableColumnPedigreeChildName',
    searchable: true,
  }, {
    key: 'relationshipType',
    dataType: 'string',
    title: 'tableColumnPedigreeRelationshipType',
    searchable: true,
  }, {
    key: 'relationshipDescription',
    dataType: 'string',
    title: 'tableColumnPedigreeRelationshipDescription',
    searchable: true,
  }, {
    key: 'pedigreeDescription',
    dataType: 'string',
    title: 'tableColumnPedigreeDescription',
    searchable: true,
  }, {
    key: 'pedigreeAuthor',
    dataType: 'string',
    title: 'tableColumnPedigreeAuthor',
    searchable: true,
  },
]

const datasetColumns: ExtendedDataTableHeader[] = [
  {
    key: 'projectId',
    dataType: 'integer',
    sortable: false,
    visibleInTable: false,
    title: 'tableColumnProjectId',
  }, {
    key: 'datasetId',
    title: 'tableColumnDatasetId',
    dataType: 'integer',
  }, {
    key: 'datasetName',
    title: 'tableColumnDatasetName',
    dataType: 'string',
    searchable: true,
  }, {
    key: 'datasetDescription',
    title: 'tableColumnDatasetDescription',
    dataType: 'string',
    searchable: true,
  }, {
    key: 'experimentId',
    dataType: 'integer',
    title: 'tableColumnExperimentId',
  }, {
    key: 'experimentName',
    dataType: 'string',
    title: 'tableColumnExperimentName',
    searchable: true,
  }, {
    key: 'datasetType',
    dataType: 'string',
    title: 'tableColumnDatasetDatasetType',
    searchable: true,
  }, {
    key: 'datatype',
    dataType: 'string',
    title: 'tableColumnDatasetDataType',
    searchable: true,
  }, {
    key: 'licenseName',
    dataType: 'string',
    title: 'tableColumnDatasetLicenseName',
    searchable: true,
  }, {
    key: 'contact',
    dataType: 'string',
    title: 'tableColumnDatasetContact',
    searchable: true,
  }, {
    key: 'countries',
    dataType: undefined,
    sortable: false,
    title: 'tableColumnDatasetCountryName',
  }, {
    key: 'data-table-expand',
    visibleInFilter: false,
    title: 'tableColumnDatasetLocations',
    dataType: 'string',
  }, {
    key: 'locations',
    dataType: 'json',
    visibleInTable: false,
    title: 'tableColumnDatasetLocations',
    searchable: true,
  }, {
    key: 'startDate',
    dataType: 'date',
    title: 'tableColumnDatasetStartDate',
    // @ts-ignore
    value: (value: ViewTableDatasets) => value.startDate ? new Date(value.startDate).toLocaleDateString() : undefined,
  }, {
    key: 'endDate',
    dataType: 'date',
    title: 'tableColumnDatasetEndDate',
    // @ts-ignore
    value: (value: ViewTableDatasets) => value.endDate ? new Date(value.endDate).toLocaleDateString() : undefined,
  }, {
    key: 'dataObjectCount',
    dataType: 'integer',
    align: 'end' as 'end' | 'start' | 'center',
    title: 'tableColumnDatasetObjectCount',
    // @ts-ignore
    value: (value: ViewTableDatasets) => value.dataObjectCount ? getNumberWithSuffix(value.dataObjectCount.value, 2) : undefined,
  }, {
    key: 'dataPointCount',
    dataType: 'integer',
    align: 'end' as 'end' | 'start' | 'center',
    title: 'tableColumnDatasetPointCount',
    // @ts-ignore
    value: (value: ViewTableDatasets) => value.dataPointCount ? `${(value.datasetType === 'genotype' || value.datasetType === 'allelefreq') ? '≤' : ''}${getNumberWithSuffix(value.dataPointCount.value, 2)}` : undefined,
  }, {
    key: 'fileresourceIds',
    dataType: 'json',
    sortable: false,
    title: 'tableColumnDatasetFileresources',
  }, {
    key: 'datasetDetails',
    dataType: undefined,
    sortable: false,
    title: '',
  }, {
    key: 'isExternal',
    dataType: 'boolean',
    sortable: false,
    visibleInTable: false,
    title: 'tableColumnDatasetExternal',
  }]

const columns: { [key: string]: ExtendedDataTableHeader[] } = {
  germplasm: germplasmColumns,
  locations: locationColumns,
  pedigrees: pedigreeColumns,
  datasets: datasetColumns,
}

const validCompsForType: { [key: string]: FilterComparator[] } = {
  string: [FilterComparator.equals, FilterComparator.contains, FilterComparator.startsWith, FilterComparator.endsWith, FilterComparator.inSet, FilterComparator.isNotNull, FilterComparator.isNull],
  boolean: [FilterComparator.equals, FilterComparator.isNull, FilterComparator.isNotNull],
  dataType: [FilterComparator.equals, FilterComparator.isNull, FilterComparator.isNotNull],
  locationType: [FilterComparator.equals, FilterComparator.isNull, FilterComparator.isNotNull],
  entityType: [FilterComparator.equals, FilterComparator.isNull, FilterComparator.isNotNull],
  newsType: [FilterComparator.equals, FilterComparator.isNull, FilterComparator.isNotNull],
  groupType: [FilterComparator.equals, FilterComparator.isNull, FilterComparator.isNotNull],
  json: [FilterComparator.jsonSearch, FilterComparator.isNull, FilterComparator.isNotNull],
  jsonObject: [FilterComparator.jsonSearch],
  integer: [FilterComparator.equals, FilterComparator.between, FilterComparator.lessThan, FilterComparator.greaterThan, FilterComparator.lessOrEquals, FilterComparator.greaterOrEquals, FilterComparator.inSet, FilterComparator.isNull, FilterComparator.isNotNull],
  float: [FilterComparator.equals, FilterComparator.between, FilterComparator.lessThan, FilterComparator.greaterThan, FilterComparator.lessOrEquals, FilterComparator.greaterOrEquals, FilterComparator.inSet, FilterComparator.isNull, FilterComparator.isNotNull],
  date: [FilterComparator.equals, FilterComparator.between, FilterComparator.lessThan, FilterComparator.greaterThan, FilterComparator.lessOrEquals, FilterComparator.greaterOrEquals, FilterComparator.isNull, FilterComparator.isNotNull],
}

export {
  columns,
  validCompsForType,
}
