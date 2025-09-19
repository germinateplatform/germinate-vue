/* tslint:disable */
/* eslint-disable */
// Generated using typescript-generator version 3.2.1263 on 2025-08-19 11:49:12.

export interface ViewTableGermplasm {
    germplasmName: string;
    germplasmDisplayName: string;
    germplasmId: number;
    germplasmGid: string;
    germplasmNumber: string;
    germplasmPuid: string;
    entityTypeId: number;
    entityTypeName: string;
    entityParentId: number;
    entityParentName: string;
    entityParentGeneralIdentifier: string;
    biologicalStatusId: number;
    biologicalStatusName: string;
    synonyms: string[];
    collectorNumber: string;
    genus: string;
    species: string;
    subtaxa: string;
    institutions: GermplasmInstitution[];
    locationId: number;
    location: string;
    latitude: number;
    longitude: number;
    elevation: number;
    countryName: string;
    countryCode: string;
    collDate: string;
    pdci: number;
    imageCount: number;
    firstImagePath: string;
    hasTrialsData: number;
    hasGenotypicData: number;
    hasAllelefreqData: number;
    hasCompoundData: number;
    hasPedigreeData: number;
}

export interface ViewTablePedigreedefinitions {
    germplasmId: number;
    germplasmName: string;
    germplasmDisplayName: string;
    pedigreeNotationName: string;
    pedigreeNotationDescription: string;
    pedigreeNotationUrl: string;
    datasetId: number;
    datasetName: string;
    definitionId: number;
    definition: string;
    pedigreeDescriptionName: string;
    pedigreeDescriptionDescription: string;
    pedigreeDescriptionAuthor: string;
    createdOn: Date;
}

export interface ViewTablePedigrees {
    parentId: number;
    parentGid: string;
    parentName: string;
    parentDisplayName: string;
    parentNumber: string;
    childId: number;
    childGid: string;
    childName: string;
    childDisplayName: string;
    childNumber: string;
    datasetId: number;
    datasetName: string;
    experimentId: number;
    experimentName: string;
    relationshipType: ViewTablePedigreesRelationshipType;
    relationshipDescription: string;
    pedigreeDescription: string;
    pedigreeAuthor: string;
}

export interface PublicationDoiLookupDetails {
    title: string;
    container?: string;
    fullReference: string;
    URL: string;
    date?: string
}

export interface ViewTableLocations {
    locationId: number;
    locationName: string;
    locationNameShort?: string;
    locationRegion?: string;
    locationState?: string;
    locationType?: string;
    locationLatitude?: number;
    locationLongitude?: number;
    locationElevation?: number;
    locationCoordinateUncertainty?: number;
    countryId?: number;
    countryName?: string;
    countryCode2?: string;
    countryCode3?: string;
}

export interface Publications {
    id: number;
    doi: string;
    fallbackCache: string;
    createdOn: Date;
    updatedOn: Date;
}

export interface BackupResult {
    timestamp: Date;
    germinateVersion: string;
    filename: string;
    type: BackupType;
    filesize: number;
    href?: string
}

export const enum BackupType {
    UPDATE = 'UPDATE',
    PERIODICAL = 'PERIODICAL',
    MANUAL = 'MANUAL',
}

export interface ViewTableStories {
    storyId: number;
    storyName: string;
    storyDescription: string;
    storyRequirements: StoryRequirements;
    storyImageId: number;
    storyImageName: string;
    projectId: number;
    projectName: string;
    projectDescription: string;
    storyFeatured: boolean;
    storyVisibility: boolean;
    storyUserId: number;
    publicationId: number;
    publicationDoi: string;
    storySteps: Storysteps[];
    storyCreatedOn: Date;
    storyUpdatedOn: Date;
}

export interface Storysteps {
    id: number;
    storyId: number;
    storyIndex: number;
    pageConfig: StoryStepConfig;
    name: string;
    description: string;
    imageId: number;
    createdOn: Date;
    updatedOn: Date;
}

export interface StoryStepConfig {
    router: RouterConfig;
    pageDetails: { [index: string]: string };
}

export interface RouterConfig {
    name: string;
    query: { [index: string]: JsonElement };
    params: { [index: string]: string };
}

export interface JsonElement {
    asInt: number;
    asDouble: number;
    asLong: number;
    asBoolean: boolean;
    asShort: number;
    jsonNull: boolean;
    asFloat: number;
    asJsonPrimitive: JsonPrimitive;
    jsonArray: boolean;
    /**
     * @deprecated
     */
    asCharacter: string;
    asBigInteger: number;
    jsonPrimitive: boolean;
    asNumber: number;
    asJsonObject: JsonObject;
    asBigDecimal: number;
    jsonObject: boolean;
    asJsonArray: JsonArray;
    asJsonNull: JsonNull;
    asByte: number;
    asString: string;
}

export interface JsonPrimitive extends JsonElement {
    string: boolean;
    boolean: boolean;
    number: boolean;
}

export interface JsonObject extends JsonElement {
    empty: boolean;
}

export interface JsonArray extends JsonElement, Iterable<JsonElement> {
    empty: boolean;
}

export interface Iterable<T> {
}

export interface JsonNull extends JsonElement {
}

export interface StoryRequirements {
    datasetIds: number[];
    groupIds: number[];
}

export interface ViewTableCollaborators {
    collaboratorId: number;
    collaboratorFirstName: string;
    collaboratorLastName: string;
    collaboratorExternalId: string;
    collaboratorEmail: string;
    collaboratorPhone: string;
    collaboratorRoles: string;
    institutionId: number;
    institutionName: string;
    institutionAddress: string;
    datasetId: number;
    countryId: number;
    countryName: string;
    countryCode2: string;
    countryCode3: string;
    projectIds: number[];
}

export interface ViewTableDatasetAttributes {
    datasetId: number;
    datasetName: string;
    datasetDescription: string;
    attributeId: number;
    attributeName: string;
    attributeDescription: string;
    attributeType: ViewTableDatasetAttributesAttributeType;
    targetTable: string;
    foreignId: number;
    attributeValue: string;
}

export const enum ViewTableDatasetAttributesAttributeType {
    categorical = 'categorical',
    numeric = 'numeric',
    text = 'text',
    date = 'date',
}

export interface GenesysRequestDetails {
    name: string;
    email: string;
    germplasmIds: number[];
}

export interface NewUnapprovedUserRequest {
    user: NewUnapprovedUser;
    locale: string;
}

export interface NewUserAccessRequest {
    username: string;
    password: string;
    locale: string;
}

export interface NewUnapprovedUser extends LocaleRequest {
    id: number;
    userUsername: string;
    userPassword: string;
    userFullName: string;
    userEmailAddress: string;
    institutionId: number;
    institutionName: string;
    institutionAcronym: string;
    institutionAddress: string;
    databaseSystemId: number;
    needsApproval: number;
    unapprovedUser: UnapprovedUsers;
}

export interface UnapprovedUsers {
    id: number;
    userUsername: string;
    userPassword: string;
    userFullName: string;
    userEmailAddress: string;
    institutionId: number;
    institutionName: string;
    institutionAcronym: string;
    institutionAddress: string;
    databaseSystemId: number;
    createdOn: Date;
    hasBeenRejected: number;
    needsApproval: number;
    activationKey: string;
}

export interface LocaleConfig {
    locale: string;
    name: string;
    flag: string;
}

export interface LocaleRequest {
    locale: string;
}

export interface ClientAdminConfiguration extends ClientConfiguration {
    bcryptSalt: number;
    brapiEnabled: boolean;
    dataDirectoryExternal: string;
    gatekeeperUsername: string;
    gatekeeperPassword: string;
    gatekeeperRegistrationRequiresApproval: boolean;
    pdciEnabled: boolean;
    filesDeleteAfterHoursAsync: number;
    filesDeleteAfterHoursTemp: number;
    hiddenPagesAutodiscover: boolean;
    databaseBackupEveryDays: number;
    databaseBackupMaxSizeGB: number;
}

export interface ClientConfiguration {
    authMode: AuthenticationMode;
    colorsTemplate: string[];
    colorsCharts: string[];
    colorsGradient: string[];
    colorPrimary: string;
    commentsEnabled: boolean;
    dashboardCategories: string[];
    dashboardSections: string[];
    dataImportMode: DataImportMode;
    externalLinkIdentifier: string;
    externalLinkTemplate: string;
    googleAnalyticsKey: string;
    plausibleDomain: string;
    plausibleHashMode: boolean;
    plausibleApiHost: string;
    gatekeeperUrl: string;
    hiddenPages: string[];
    registrationEnabled: boolean;
    showGdprNotification: boolean;
    gridscoreUrl: string;
    heliumUrl: string;
    fieldhubUrl: string;
    hiddenColumns: HiddenColumns;
    supportsFeedback: boolean;
    genesysUrl: string;
}

export interface HiddenColumns {
    germplasm: string[];
    germplasmAttributes: string[];
    images: string[];
    climates: string[];
    climateData: string[];
    comments: string[];
    fileresources: string[];
    maps: string[];
    markers: string[];
    mapDefinitions: string[];
    datasets: string[];
    datasetAttributes: string[];
    experiments: string[];
    entities: string[];
    groups: string[];
    institutions: string[];
    locations: string[];
    pedigrees: string[];
    pedigreedefinitions: string[];
    traits: string[];
    trialsData: string[];
    collaborators: string[];
    publications: string[];
}

export const enum DataImportMode {
    NONE = 'NONE',
    VERIFY = 'VERIFY',
    IMPORT = 'IMPORT',
}

export const enum AuthenticationMode {
    FULL = 'FULL',
    SELECTIVE = 'SELECTIVE',
    NONE = 'NONE',
}

export interface Publicationdata {
    id: number;
    foreignId: number;
    publicationId: number;
    referenceType: PublicationdataReferenceType;
    createdOn: Date;
    updatedOn: Date;
}

export const enum PublicationdataReferenceType {
    database = 'database',
    dataset = 'dataset',
    germplasm = 'germplasm',
    group = 'group',
    experiment = 'experiment',
}

export interface ViewTablePublications {
    publicationId: number;
    publicationDoi: string;
    publicationFallbackCache?: string;
    isDatabasePub?: number;
    datasetIds?: number[];
    germplasmIds?: number[];
    groupIds?: number[];
    experimentIds?: number[];
    projectIds?: number[];
    createdOn: Date;
    updatedOn: Date;
    lookupDetails?: PublicationDoiLookupDetails
}

export interface Filter {
    column: string;
    comparator: FilterComparator;
    values: string[];
    canBeChanged?: boolean;
    safeColumn?: string;
}

export interface ViewTableLicenses {
    licenseId: number;
    licenseName: string;
    licenseDescription: string;
    licenseContent: { [index: string]: string };
    datasetId: number;
    acceptedBy: number[];
}

export interface SubsettedGenotypeDatasetRequest extends SubsettedDatasetRequest {
    mapId: number;
    generateFlapjackProject: boolean;
    generateHapMap: boolean;
    generateFlatFile: boolean;
    fileTypes: AdditionalExportFormat[];
}

export interface MapExportRequest {
    format: string;
    method?: string;
    chromosomes?: string[];
    regions?: Region[];
    markerIdInterval?: number[];
    radius?: Radius;
}

export interface AlleleFrequencyDatasetRequest extends SubsettedGenotypeDatasetRequest {
    config: BinningConfig;
}

export interface ViewTableMarkers {
    markerId: number;
    markerName: string;
    markerType: string;
    markerSynonyms: string[];
    createdOn: Date;
    updatedOn: Date;
}

export interface Region {
    chromosome: string;
    start: number;
    end: number;
}

export interface Radius {
    markerId: number;
    left: number;
    right: number;
}

export interface FilterGroup {
    filters?: Filter[];
    filterGroups?: FilterGroup[];
    operator: FilterOperator;
}

export const enum FilterComparator {
    isNull = 'isNull',
    isNotNull = 'isNotNull',
    equals = 'equals',
    contains = 'contains',
    between = 'between',
    greaterThan = 'greaterThan',
    greaterOrEquals = 'greaterOrEquals',
    lessThan = 'lessThan',
    lessOrEquals = 'lessOrEquals',
    startsWith = 'startsWith',
    endsWith = 'endsWith',
    jsonSearch = 'jsonSearch',
    arrayContains = 'arrayContains',
    inSet = 'inSet',
}

export interface ViewTableTaxonomies {
    taxonomyId: number;
    taxonomyGenus: string;
    taxonomySpecies: string;
    taxonomySubtaxa: string;
    taxonomyCropname: string;
    taxonomyProviders: TaxonomyProviderInfo[];
    count: number
}

export interface TaxonomyProviderInfo {
    providerName: string;
    providerHomepage: string;
    providerPlaceholder: string;
    externalId: string;
}

export const enum FilterOperator {
    and = 'and',
    or = 'or',
}

export interface LoginDetails {
    username: string;
    password: string;
}

export interface GatekeeperConfig {
    url: string;
    username: string;
    password: string;
}

export interface DatabaseConfig {
    host: string;
    database: string;
    port?: string;
    username: string;
    password: string;
}

export interface ServerSetupConfig {
    dbConfig: DatabaseConfig;
    gkConfig: GatekeeperConfig;
}

export interface PaginatedResult<T> {
    data: T;
    count: number;
}

export interface PaginatedPolygonRequest extends PaginatedRequest {
    polygons: LatLng[][];
}

export interface PaginatedLocationRequest extends PaginatedRequest {
    latitude: number;
    longitude: number;
}

export interface TraitTimelineRequest {
    datasetIds: number[];
    traitIds?: number[];
    groupIds?: number[];
    markedIds?: number[];
}

export interface Phenotypes {
    id: number;
    name: string;
    shortName: string;
    description: string;
    datatype: PhenotypesDatatype;
    restrictions: TraitRestrictions;
    unitId: number;
    categoryId: number;
    setsize: number;
    isTimeseries: boolean;
    createdOn: Date;
    updatedOn: Date;
}

export interface PaginatedDatasetRequest extends PaginatedRequest {
    datasetIds: number[];
}

export interface UnacceptedLicenseRequest extends PaginatedRequest {
    justUnacceptedLicenses: boolean;
}

export interface TraitUnificationRequest {
    preferredTraitId: number;
    otherTraitIds: number[];
}

export interface TrialCreationDetails {
    datasetId: number;
    plots: PlotDetails[];
}

export interface PlotDetails {
    row: number;
    column: number;
    germplasm: string;
    rep: string;
}

export interface TraitDatasetRequest extends DatasetRequest {
    traitIds: number[];
}

export interface ViewTableTraits {
    traitId: number;
    traitName: string;
    traitNameShort: string;
    traitDescription: string;
    dataType: ViewTableTraitsDataType;
    traitRestrictions: TraitRestrictions;
    traitSetSize: number;
    traitIsTimeseries: boolean;
    categoryId: number;
    categoryName: string;
    categoryDescription: string;
    unitId: number;
    unitName: string;
    unitDescription: string;
    unitAbbreviation: string;
    synonyms: string[];
    datasetIds: number[];
    count: number;
}

export const enum ViewTableTraitsDataType {
    categorical = 'categorical',
    numeric = 'numeric',
    text = 'text',
    date = 'date',
}

export interface TraitRestrictions {
    categories: string[][];
    min: number;
    max: number;
}

export const enum PhenotypesDatatype {
    categorical = 'categorical',
    numeric = 'numeric',
    text = 'text',
    date = 'date',
}

export interface LatLng {
    lat: number;
    lng: number;
}

export interface PaginatedRequest {
    orderBy?: string;
    ascending?: number;
    limit: number;
    page: number;
    prevCount?: number;
    minimal?: boolean;
    filters?: FilterGroup[];
}

export interface GermplasmExportRequest extends ExportRequest {
    individualIds?: number[];
    groupIds?: number[];
    includeAttributes: boolean;
}

export interface ViewTablePedigrees {
    parentId: number;
    parentGid: string;
    parentName: string;
    parentDisplayName: string;
    parentNumber: string;
    childId: number;
    childGid: string;
    childName: string;
    childDisplayName: string;
    childNumber: string;
    datasetId: number;
    datasetName: string;
    experimentId: number;
    experimentName: string;
    relationshipType: ViewTablePedigreesRelationshipType;
    relationshipDescription: string;
    pedigreeDescription: string;
    pedigreeAuthor: string;
}

export const enum ViewTablePedigreesRelationshipType {
    M = 'M',
    F = 'F',
    OTHER = 'OTHER',
}

export interface JooqWeirdnessValue {
    value: number;
}

export interface GermplasmStats {
    germplasmId: number;
    germplasmName: string;
    traitId: number;
    traitName: string;
    traitNameShort: string;
    min: number;
    avg: number;
    max: number;
    count: number;
    isSelected: boolean;
}

export interface ViewTableDatasets {
    datasetId: number;
    datasetName: string;
    datasetDescription: string;
    hyperlink: string;
    sourceFile: string;
    version: string;
    datasetType: string;
    experimentId: number;
    experimentName: string;
    experimentDescription: string;
    projectId: number;
    projectName: string;
    projectDescription: string;
    datatype: string;
    datasetState: string;
    locations: ViewTableLocations[];
    institutions: ViewTableInstitutions[];
    licenseId: number;
    licenseName: string;
    contact: string;
    startDate: Date;
    endDate: Date;
    dublinCore: DublinCore;
    createdOn: Date;
    updatedOn: Date;
    dataObjectCount: JooqWeirdnessValue;
    dataPointCount: JooqWeirdnessValue;
    isExternal: boolean;
    publications: number;
    fileresourceIds: number[];
    collaborators: number;
    attributes: number;
    acceptedBy: number[];
}

export interface ViewTableProjects {
    projectId?: number;
    projectName?: string;
    projectDescription?: string;
    projectPageContent?: string;
    projectExternalUrl?: string;
    projectImageId?: number;
    projectStartDate?: string;
    projectEndDate?: string;
    projectCreatedOn?: Date;
    projectUpdatedOn?: Date;
    datasets?: Dataset[];
}

export interface ProjectStats {
    publicationCount: number;
    groupCount: number;
    datasetCount: number;
    collaboratorCount: number;
}

export interface Dataset {
    datasetId: number;
    datasetName: string;
    datasetType: string;
    datasetIsExternal: number;
}

export interface ViewTableInstitutions {
    institutionId: number;
    institutionName: string;
    institutionCode: string;
    institutionAcronym: string;
    institutionAddress: string;
    institutionEmail: string;
    institutionContact: string;
    institutionPhone: string;
    countryId: number;
    countryName: string;
    countryCode: string;
    institutionType: string;
}

export interface GermplasmInstitution {
    id: number;
    name: string;
    code: string;
    type: GermplasminstitutionsType;
}

export interface ViewTableGroups {
    groupId?: number;
    groupName?: string;
    groupDescription?: string;
    groupTypeId?: number;
    groupType?: string;
    userName?: string;
    userId?: number;
    groupVisibility?: boolean;
    createdOn?: Date;
    updatedOn?: Date;
    projectIds?: number[];
    count?: number;
}

export interface Grouptypes {
    id: number;
    description: string;
    targetTable: string;
    createdOn: Date;
    updatedOn: Date;
}

export interface DatasetRequest {
    datasetIds: number[];
}

export interface DatasetGroupRequest extends DatasetRequest {
    datasetType: string;
    groupType: string;
}

export interface GroupModificationRequest {
    ids: number[];
    addition: boolean;
}

export interface Groups {
    id?: number;
    grouptypeId?: number;
    name?: string;
    description?: string;
    visibility?: boolean;
    createdBy?: number;
    createdOn?: Date;
    updatedOn?: Date;
}

export interface DataExportJobs {
    id: number;
    uuid: string;
    jobId: string;
    jobConfig: ExportJobDetails;
    userId: number;
    status: DataExportJobsStatus;
    visibility: boolean;
    datatype: DataExportJobsDatatype;
    datasetIds: number[];
    resultSize: number;
    createdOn: Date;
    updatedOn: Date;
}

export const enum DataExportJobsDatatype {
    genotype = 'genotype',
    trials = 'trials',
    allelefreq = 'allelefreq',
    climate = 'climate',
    compound = 'compound',
    pedigree = 'pedigree',
    unknown = 'unknown',
    images = 'images',
}

export interface Datasets {
    id: number;
    experimentId: number;
    datasettypeId?: number;
    name: string;
    description: string;
    dateStart: Date;
    dateEnd: Date;
    sourceFile?: string;
    datatype?: string;
    dublinCore?: DublinCore;
    version?: string;
    createdBy?: number;
    datasetStateId: number;
    licenseId?: number;
    isExternal?: boolean;
    hyperlink: string;
    createdOn?: Date;
    updatedOn?: Date;
    contact?: string;
}

export interface ViewTableMapdefinitions {
    markerId: number;
    markerName: string;
    synonyms: string[];
    mapFeatureType: string;
    mapId: number;
    userId: number;
    visibility: boolean;
    mapName: string;
    chromosome: string;
    position: number;
}

export interface ViewTableMaps {
    mapId: number;
    mapName: string;
    mapDescription: string;
    userId: number;
    visibility: boolean;
    markerCount: number;
}

export interface DublinCore {
    title: string[];
    creator: string[];
    subject: string[];
    description: string[];
    publisher: string[];
    contributor: string[];
    date: string[];
    type: string[];
    format: string[];
    identifier: string[];
    source: string[];
    language: string[];
    relation: string[];
    coverage: string[];
    rights: string[];
}

export interface ViewTableExperiments {
    projectId?: number;
    experimentId?: number;
    experimentName?: string;
    experimentDescription?: string;
    experimentDate?: Date;
    createdOn?: Date;
    genotypeCount?: number;
    trialsCount?: number;
    alleleFreqCount?: number;
    climateCount?: number;
    compoundCount?: number;
    pedigreeCount?: number;
}

export interface ViewTableLicenseDefinitions {
    licenseId?: number;
    licenseName?: string;
    licenseDescription?: string;
    createdOn?: Date;
    licenseData?: { [index: string]: string };
}

export interface ViewTableFileresources {
    fileresourceId?: number;
    fileresourceName: string;
    fileresourcePath: string;
    fileresourceDescription?: string;
    fileresourceSize?: number;
    fileresourceCreatedOn?: Date;
    fileresourceUpdatedOn?: Date;
    projectId?: number;
    projectName?: string;
    projectDescription?: string;
    fileresourcetypeId: number;
    fileresourcetypeName?: string;
    fileresourcetypeDescription?: string;
    datasetIds?: number[];
}

export interface DatasetCrossDataTypeRequest {
    first: Config;
    second: Config;
}

export interface Config {
    id: number;
    columnName: string;
    type: DataType;
    datasetIds: number[];
    markedIds: number[];
    groupIds: number[];
}

export const enum DataType {
    TRAIT = 'TRAIT',
    CLIMATE = 'CLIMATE',
    COMPOUND = 'COMPOUND',
    GERMPLASM_COLUMN = 'GERMPLASM_COLUMN',
}

export interface Fileresourcetypes {
    id?: number;
    name: string;
    description?: string;
    createdOn?: Date;
    updatedOn?: Date;
}

export interface ImageConfig {
    name: string;
    text: string;
}

export interface AboutInfo {
    id?: string
    name?: string;
    description?: string;
    group?: string;
    url?: string;
    image?: string;
    isEditing?: boolean
}

export type CarouselConfig = { [key: string]: ImageConfig[] }

export type AboutConfig = AboutInfo[]

export type TemplateI18n = { [key: string]: string }

export interface Comments {
    id: number;
    commenttypeId: number;
    userId: number;
    visibility: boolean;
    description: string;
    referenceId: number;
    createdOn: Date;
    updatedOn: Date;
}

export interface LinkRequest {
    targetTable: string;
    foreignId: number;
}

export interface News {
    id?: number;
    newstypeId?: number;
    title?: string;
    content?: string;
    image?: string | File;
    imageFit?: NewsImageFit;
    hyperlink?: string;
    userId?: number;
    createdOn?: Date;
    updatedOn?: Date;
}

export interface ViewTableNews {
    newsId?: number;
    newsTitle?: string;
    newsContent?: string;
    newsHyperlink?: string;
    newsImage?: string;
    newsImageFit?: ViewTableNewsNewsImageFit;
    newstypeId?: number;
    newstypeName?: string;
    newstypeDescription?: string;
    createdOn?: Date;
    updatedOn?: Date;
}

export const enum ViewTableNewsNewsImageFit {
    contain = 'contain',
    cover = 'cover',
}

export const enum NewsImageFit {
    contain = 'contain',
    cover = 'cover',
}

export interface ViewTableImages {
    imageId: number;
    imageDescription: string;
    imageForeignId: number;
    imageIsReference: boolean;
    imagePath: string;
    imageExif: Exif;
    imageType: string;
    imageRefTable: string;
    referenceName: string;
    createdOn: Date;
    tags: ImageTag[];
}

export interface ViewTableImportJobs {
    id: number;
    isUpdate: boolean;
    datasetstateId: number;
    datatype: ViewTableImportJobsDatatype;
    status: ViewTableImportJobsStatus;
    stats: ImportJobStats;
    createdOn: Date;
}

export const enum ViewTableImportJobsDatatype {
    mcpd = 'mcpd',
    trial = 'trial',
    compound = 'compound',
    genotype = 'genotype',
    pedigree = 'pedigree',
    groups = 'groups',
    climate = 'climate',
    images = 'images',
    shapefile = 'shapefile',
    geotiff = 'geotiff',
}

export const enum ViewTableImportJobsStatus {
    waiting = 'waiting',
    running = 'running',
    failed = 'failed',
    completed = 'completed',
    cancelled = 'cancelled',
}

export interface ImageTag {
    tagId: number;
    tagName: string;
}

export interface Phenotypecategories {
    id: number;
    name: string;
    description?: string;
    createdOn?: Date;
    updatedOn?: Date;
}

export interface ViewTableClimates {
    climateId: number;
    climateName: string;
    climateNameShort: string;
    climateDescription: string;
    dataType: ViewTableClimatesDataType;
    unitId: number;
    unitName: string;
    unitDescription: string;
    overlays: number;
    unitAbbreviation: string;
    count: number;
}

export const enum ViewTableClimatesDataType {
    categorical = 'categorical',
    numeric = 'numeric',
    text = 'text',
    date = 'date',
}

export interface Exif {
    apertureValue: string;
    cameraMake: string;
    cameraModel: string;
    colorSpace: string;
    compression: string;
    contrast: string;
    dateTime: Date;
    dateTimeOriginal: Date;
    dateTimeDigitized: Date;
    digitalZoomRatio: string;
    exifImageHeight: string;
    exifImageWidth: string;
    exifVersion: string;
    exposure: string;
    exposureBiasValue: string;
    exposureMode: string;
    exposureProgram: string;
    exposureTime: string;
    fileSource: string;
    flash: string;
    focalLength: string;
    gainControl: string;
    gpsAltitude: number;
    gpsLatitude: number;
    gpsLongitude: number;
    gpsTimestamp: Date;
    imageHeight: string;
    imageWidth: string;
    isoSpeedRatings: string;
    lensMake: string;
    lensModel: string;
    meteringMode: string;
    orientation: string;
    orientationCode: number;
    photometricInterpretation: string;
    samplesPerPixel: string;
    saturation: string;
    sceneCaptureType: string;
    sceneType: string;
    sensingMethod: string;
    sharpness: string;
    shutterSpeedValue: string;
    userComment: string;
    whiteBalance: string;
    whiteBalanceMode: string;
    fNumber: string;
    yResolution: string;
    xResolution: string;
}

export interface ExportRequest {
    filters?: FilterGroup[];
    columnNameMapping?: { [index: string]: string };
    forcedFileExtension?: string;
}

export interface PedigreeRequest extends TrialsExportDatasetRequest {
    levelsUp?: number;
    levelsDown?: number;
    includeAttributes: boolean;
}

export interface AsyncExportResult {
    status: string;
    uuid: string;
}

export interface TrialsExportDatasetRequest extends PaginatedRequest {
    traitIds?: number[];
    germplasmIds?: number[];
    germplasmGroupIds?: number[];
    datasetIds: number[];
}

export interface ViewTableTrialsData {
    germplasmId: number;
    germplasmGid: string;
    germplasmName: string;
    germplasmDisplayName: string;
    germplasmSynonyms: string[];
    entityParentName: string;
    entityParentGeneralIdentifier: string;
    entityType: string;
    datasetId: number;
    datasetName: string;
    datasetDescription: string;
    locationName: string;
    countryName: string;
    countryCode2: string;
    traitId: number;
    traitName: string;
    traitNameShort: string;
    traitRestrictions: TraitRestrictions;
    traitDataType: PhenotypesDatatype;
    unitName: string;
    treatment: string;
    trialsetupId: number;
    rep: string;
    block: string;
    trialRow: number;
    trialColumn: number;
    groups: Groups[];
    latitude: number;
    longitude: number;
    elevation: number;
    recordingDate: Date;
    traitValue: string;
}

export interface SubsettedDatasetRequest extends PaginatedRequest {
    datasetIds: number[];
    xIds?: number[];
    yIds?: number[];
    yGroupIds?: number[];
    xGroupIds?: number[];
}

export interface ExperimentRequest extends DatasetRequest {
    experimentId: number;
}

export interface GermplasmUnificationRequest {
    preferredGermplasmId: number;
    otherGermplasmIds: number[];
    explanation: string;
}

export interface SgoneGermplasmUnificationRequest {
    unifications: SgoneGermplasmUnification[];
}

export interface Locations {
    id: number;
    locationtypeId: number;
    countryId: number;
    state: string;
    region: string;
    siteName: string;
    siteNameShort: string;
    elevation: number;
    latitude: number;
    longitude: number;
    coordinateUncertainty: number;
    coordinateDatum: string;
    georeferencingMethod: string;
    createdOn: Date;
    updatedOn: Date;
}

export interface SgoneGermplasmUnification {
    preferred: SgonePojo;
    others: SgonePojo[];
}

export interface SgonePojo {
    id: string;
    name: string;
}

export interface ExportJobDetails {
    baseFolder: string;
    fileTypes: AdditionalExportFormat[];
    subsetId: number;
    fileHeaders: string;
    binningConfig: BinningConfig;
    exportParams: string[];
    xIds: number[];
    yIds: number[];
    yGroupIds: number[];
    xGroupIds: number[];
}

export interface BinningConfig {
    binningMethod: string;
    binsLeft: number;
    binsRight: number;
    splitPoint: number;
}

export interface DataImportJobs {
    id: number;
    uuid: string;
    jobId: string;
    jobConfig: ImportJobDetails;
    userId: number;
    originalFilename: string;
    isUpdate: boolean;
    datasetstateId: number;
    datatype: DataImportJobsDatatype;
    status: DataImportJobsStatus;
    imported: boolean;
    visibility: boolean;
    feedback: ImportResult[];
    stats: ImportJobStats;
    errorStatus: string;
    createdOn: Date;
    updatedOn: Date;
}

export interface ImportJobDetails {
    baseFolder: string;
    dataFilename: string;
    deleteOnFail: boolean;
    targetDatasetId: number;
    runType: RunType;
    dataOrientation: DataOrientation;
}

export interface ImportJobStats {
    fileResourceId: number;
    datasetId: number;
    germplasm: number;
    markers: number;
    images: number;
    traits: number;
    locations: number;
    climates: number;
    groups: number;
}

export interface ViewMcpd {
    id: number;
    puid: string;
    instcode: string;
    accenumb: string;
    collnumb: string;
    collcode: string;
    collname: string;
    collinstaddress: string;
    collmissid: string;
    genus: string;
    species: string;
    spauthor: string;
    subtaxa: string;
    subtauthor: string;
    cropname: string;
    accename: string;
    acqdate: string;
    origcty: string;
    collsite: string;
    declatitude: number;
    latitude: any;
    declongitude: number;
    longitude: any;
    coorduncert: number;
    coorddatum: string;
    georefmeth: string;
    elevation: number;
    colldate: string;
    bredcode: string;
    bredname: string;
    sampstat: number;
    ancest: string;
    collsrc: number;
    donorcode: string;
    donorname: string;
    donornumb: string;
    othernumb: string;
    duplsite: string;
    duplinstname: string;
    storage: string;
    mlsstat: number;
    remarks: string;
    entitytype: string;
    entityparentid: number;
    entityparentaccenumb: string;
}

export interface Datawarnings {
    id: number;
    description: string;
    category: DatawarningsCategory;
    createdOn: Date;
    updatedOn: Date;
}

export interface ViewTableLinks {
    linkId: number;
    linkDescription: string;
    linkVisibility: boolean;
    linktypeId: number;
    linktypeDescription: string;
    linktypeTargetTable: string;
    linktypeTargetColumn: string;
    linkForeignId: number;
    hyperlink: string;
    placeholder: string;
    updatedOn: Date;
}

export const enum DataImportJobsDatatype {
    mcpd = 'mcpd',
    trial = 'trial',
    compound = 'compound',
    genotype = 'genotype',
    pedigree = 'pedigree',
    groups = 'groups',
    climate = 'climate',
    images = 'images',
    shapefile = 'shapefile',
    geotiff = 'geotiff',
}

export const enum AdditionalExportFormat {
    text = 'text',
    flapjack = 'flapjack',
    hapmap = 'hapmap',
}

export const enum DataExportJobsStatus {
    waiting = 'waiting',
    running = 'running',
    failed = 'failed',
    completed = 'completed',
    cancelled = 'cancelled',
}

export interface ImportResult {
    status: ImportStatus;
    rowIndex: number;
    message: string;
    type: StatusType;
}

export const enum DataImportJobsStatus {
    waiting = 'waiting',
    running = 'running',
    failed = 'failed',
    completed = 'completed',
    cancelled = 'cancelled',
}

export const enum GermplasminstitutionsType {
    collection = 'collection',
    maintenance = 'maintenance',
    breeding = 'breeding',
    duplicate = 'duplicate',
    donor = 'donor',
}

export const enum UserType {
    ADMIN = 'ADMIN',
    DATA_CURATOR = 'DATA_CURATOR',
    AUTH_USER = 'AUTH_USER',
    UNKNOWN = 'UNKNOWN',
}

export const enum RunType {
    CHECK = 'CHECK',
    IMPORT = 'IMPORT',
    CHECK_AND_IMPORT = 'CHECK_AND_IMPORT',
}

export const enum DataOrientation {
    GENOTYPE_GERMPLASM_BY_MARKER = 'GENOTYPE_GERMPLASM_BY_MARKER',
    GENOTYPE_MARKER_BY_GERMPLASM = 'GENOTYPE_MARKER_BY_GERMPLASM',
}

export const enum ImportStatus {
    GENERIC_DUPLICATE_COLUMN = 'GENERIC_DUPLICATE_COLUMN',
    GENERIC_IO_ERROR = 'GENERIC_IO_ERROR',
    GENERIC_MISSING_EXCEL_SHEET = 'GENERIC_MISSING_EXCEL_SHEET',
    GENERIC_MISSING_COLUMN = 'GENERIC_MISSING_COLUMN',
    GENERIC_MISSING_COUNTRY = 'GENERIC_MISSING_COUNTRY',
    GENERIC_MISSING_REQUIRED_VALUE = 'GENERIC_MISSING_REQUIRED_VALUE',
    GENERIC_MISSING_DB_ITEM_UPDATE = 'GENERIC_MISSING_DB_ITEM_UPDATE',
    GENERIC_VALUE_TOO_LONG = 'GENERIC_VALUE_TOO_LONG',
    GENERIC_INVALID_COUNTRY_CODE = 'GENERIC_INVALID_COUNTRY_CODE',
    GENERIC_INVALID_NUMBER = 'GENERIC_INVALID_NUMBER',
    GENERIC_INVALID_BOOLEAN = 'GENERIC_INVALID_BOOLEAN',
    GENERIC_INVALID_DATE = 'GENERIC_INVALID_DATE',
    GENERIC_INVALID_DATATYPE = 'GENERIC_INVALID_DATATYPE',
    GENERIC_INVALID_MARKER = 'GENERIC_INVALID_MARKER',
    GENERIC_INVALID_LOCATION = 'GENERIC_INVALID_LOCATION',
    GENERIC_INVALID_GERMPLASM = 'GENERIC_INVALID_GERMPLASM',
    GENERIC_DUPLICATE_VALUE = 'GENERIC_DUPLICATE_VALUE',
    GENERIC_INVALID_REFERENCE = 'GENERIC_INVALID_REFERENCE',
    GENERIC_DISPLAY_NAME_USED_BUT_NOT_UNIQUE = 'GENERIC_DISPLAY_NAME_USED_BUT_NOT_UNIQUE',
    GROUP_INVALID_GROUP_VISIBILITY = 'GROUP_INVALID_GROUP_VISIBILITY',
    GROUP_INVALID_CELL_VALUE = 'GROUP_INVALID_CELL_VALUE',
    GROUP_HEADER_MISMATCH = 'GROUP_HEADER_MISMATCH',
    MCPD_DUPLICATE_ACCENUMB = 'MCPD_DUPLICATE_ACCENUMB',
    MCPD_MISSING_FIELD = 'MCPD_MISSING_FIELD',
    MCPD_INVALID_SAMPSTAT = 'MCPD_INVALID_SAMPSTAT',
    MCPD_INVALID_COLLSRC = 'MCPD_INVALID_COLLSRC',
    MCPD_INVALID_DMS = 'MCPD_INVALID_DMS',
    MCPD_INVALID_MLSSTATUS = 'MCPD_INVALID_MLSSTATUS',
    MCPD_INVALID_STORAGE = 'MCPD_INVALID_STORAGE',
    MCPD_INVALID_ENTITY_TYPE = 'MCPD_INVALID_ENTITY_TYPE',
    MCPD_INVALID_ENTITY_PARENT_ACCENUMB = 'MCPD_INVALID_ENTITY_PARENT_ACCENUMB',
    MCPD_MISSING_ACCENUMB = 'MCPD_MISSING_ACCENUMB',
    MCPD_INVALID_DUPLINST_NAME_MAPPING = 'MCPD_INVALID_DUPLINST_NAME_MAPPING',
    TRIALS_INVALID_TRAIT_DATATYPE = 'TRIALS_INVALID_TRAIT_DATATYPE',
    TRIALS_INVALID_TRAIT_CATEGORIES = 'TRIALS_INVALID_TRAIT_CATEGORIES',
    TRIALS_MISSING_TRAIT_DECLARATION = 'TRIALS_MISSING_TRAIT_DECLARATION',
    TRIALS_DATA_DATE_HEADER_MISMATCH = 'TRIALS_DATA_DATE_HEADER_MISMATCH',
    TRIALS_DATA_DATE_IDENTIFIER_MISMATCH = 'TRIALS_DATA_DATE_IDENTIFIER_MISMATCH',
    TRIALS_DATA_VIOLATES_RESTRICTION = 'TRIALS_DATA_VIOLATES_RESTRICTION',
    TRIALS_ROW_COL_MISMATCH = 'TRIALS_ROW_COL_MISMATCH',
    TRIALS_DATA_REP_MISSING = 'TRIALS_DATA_REP_MISSING',
    COMPOUND_DATA_DATE_HEADER_MISMATCH = 'COMPOUND_DATA_DATE_HEADER_MISMATCH',
    COMPOUND_DATA_DATE_IDENTIFIER_MISMATCH = 'COMPOUND_DATA_DATE_IDENTIFIER_MISMATCH',
    COMPOUND_MISSING_COMPOUND_DECLARATION = 'COMPOUND_MISSING_COMPOUND_DECLARATION',
    CLIMATE_MISSING_CLIMATE_DECLARATION = 'CLIMATE_MISSING_CLIMATE_DECLARATION',
    CLIMATE_MISSING_LOCATION_DECLARATION = 'CLIMATE_MISSING_LOCATION_DECLARATION',
    GENOTYPE_MISSING_ROW = 'GENOTYPE_MISSING_ROW',
    GENOTYPE_HEADER_LENGTH_MISMATCH = 'GENOTYPE_HEADER_LENGTH_MISMATCH',
    GENOTYPE_HAPMAP_INCORRECT_HEADER = 'GENOTYPE_HAPMAP_INCORRECT_HEADER',
    GENOTYPE_HAPMAP_INCORRECT_ROW_LENGTH = 'GENOTYPE_HAPMAP_INCORRECT_ROW_LENGTH',
    IMAGE_TEMPLATE_MISSING = 'IMAGE_TEMPLATE_MISSING',
    IMAGE_IMAGE_MISSING = 'IMAGE_IMAGE_MISSING',
    IMAGE_DEFINITION_MISSING = 'IMAGE_DEFINITION_MISSING',
    SHAPEFILE_MISSING_SHP = 'SHAPEFILE_MISSING_SHP',
    SHAPEFILE_MISSING_FIELD = 'SHAPEFILE_MISSING_FIELD',
    SHAPEFILE_INVALID_ACCENUMB = 'SHAPEFILE_INVALID_ACCENUMB',
    SHAPEFILE_ROW_COL_GERMPLASM_CONFLICT = 'SHAPEFILE_ROW_COL_GERMPLASM_CONFLICT',
    SHAPEFILE_DUPLICATE_ROW_COL = 'SHAPEFILE_DUPLICATE_ROW_COL',
    SHAPEFILE_WARNING_MISSING_ACCENUMB = 'SHAPEFILE_WARNING_MISSING_ACCENUMB',
}

export const enum StatusType {
    WARNING = 'WARNING',
    ERROR = 'ERROR',
}

export const enum DatawarningsCategory {
    generic = 'generic',
    quality = 'quality',
    source = 'source',
    deprecated = 'deprecated',
    missing = 'missing',
    inaccuracy = 'inaccuracy',
}
