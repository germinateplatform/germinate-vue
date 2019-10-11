export default {
  TABLE_COLUMNS_GERMPLASM_SEARCHABLE: [
    {
      name: 'germplasmId',
      type: Number
    }, {
      name: 'germplasmName',
      type: String
    }, {
      name: 'germplasmNumber',
      type: String
    }, {
      name: 'germplasmPuid',
      type: String
    }, {
      name: 'entityTypeName',
      type: 'entityType'
    }, {
      name: 'biologicalStatusName',
      type: String
    }, {
      name: 'synonyms',
      type: String
    }, {
      name: 'collectorNumber',
      type: String
    }, {
      name: 'genus',
      type: String
    }, {
      name: 'species',
      type: String
    }, {
      name: 'subtaxa',
      type: String
    }, {
      name: 'location',
      type: String
    }, {
      name: 'elevation',
      type: Number
    }, {
      name: 'countryName',
      type: String
    }, {
      name: 'collDate',
      type: Date
    }
  ],
  TABLE_COLUMNS_GERMPLASM_ATTRIBUTE_SEARCHABLE: [
    {
      name: 'germplasmId',
      type: Number
    }, {
      name: 'germplasmGid',
      type: String
    }, {
      name: 'germplasmName',
      type: String
    }, {
      name: 'attributeName',
      type: String
    }, {
      name: 'attributeDescription',
      type: String
    }, {
      name: 'attributeType',
      type: 'dataType'
    }, {
      name: 'attributeValue',
      type: String
    }
  ],
  TABLE_COLUMNS_DATASET_SEARCHABLE: [
    {
      name: 'datasetId',
      type: Number
    }, {
      name: 'datasetName',
      type: String
    }, {
      name: 'datasetDescription',
      type: String
    }, {
      name: 'experimentName',
      type: String
    }, {
      name: 'experimentType',
      type: String
    }, {
      name: 'datatype',
      type: String
    }, {
      name: 'location',
      type: String
    }, {
      name: 'countryName',
      type: String
    }, {
      name: 'licenseName',
      type: String
    }, {
      name: 'contact',
      type: String
    }, {
      name: 'startDate',
      type: Date
    }, {
      name: 'endDate',
      type: Date
    }, {
      name: 'dataObjectCount',
      type: Number
    }, {
      name: 'dataPointCount',
      type: Number
    }
  ],
  TABLE_COLUMNS_DATASET_ATTRIBUTE_SEARCHABLE: [
    {
      name: 'datasetId',
      type: Number
    }, {
      name: 'datasetName',
      type: String
    }, {
      name: 'datasetDescription',
      type: String
    }, {
      name: 'attributeName',
      type: String
    }, {
      name: 'attributeDescription',
      type: String
    }, {
      name: 'attributeType',
      type: 'dataType'
    }, {
      name: 'attributeValue',
      type: String
    }
  ]
}
