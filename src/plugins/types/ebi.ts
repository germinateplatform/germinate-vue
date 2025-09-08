export interface EbiRecord {
  result_id: string
  description: string
  entry_cnt: number
}

export interface EbiStudy {
  study_accession: string
  study_title: string
  study_description: string
  center_name: string
}

export interface EbiGenomyAssembly {
  accession: string
  scientific_name: string
  cultivar: string
  assembly_name: string
  assembly_level: string
  assembly_quality: string
  assembly_software: string
}
