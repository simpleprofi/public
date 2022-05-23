--name: ConditionOccurrenceAchilles
--connection: Mdolotov:PPSCDM_1
SELECT
  concept_hierarchy.concept_id AS conceptId,
    COALESCE(concept_hierarchy.level4_concept_name, 'NA') || '||' ||
    COALESCE(concept_hierarchy.level3_concept_name, 'NA') || '||' ||
    COALESCE(concept_hierarchy.level2_concept_name, 'NA') || '||' ||
    COALESCE(concept_hierarchy.level2_concept_name, 'NA') || '||' ||
    COALESCE(concept_hierarchy.concept_name, 'NA')
  AS conceptPathFull,
  COALESCE(concept_hierarchy.concept_name, 'NA') AS conceptPath,
  ar1.count_value                                     AS numPersons,
  round(1.0 * ar1.count_value / denom.count_value, 5) AS percentPersons,
  round(1.0 * ar2.count_value / ar1.count_value, 5)   AS recordsPerPerson
FROM (SELECT *
      FROM results_pps_prostate_cancer_v2038.achilles_results WHERE analysis_id = 400) ar1
  INNER JOIN
  (SELECT *
   FROM results_pps_prostate_cancer_v2038.achilles_results WHERE analysis_id = 401) ar2
    ON ar1.stratum_1 = ar2.stratum_1
  INNER JOIN
  results_pps_prostate_cancer_v2038.concept_hierarchy concept_hierarchy
    ON CAST(ar1.stratum_1 AS INT) = concept_hierarchy.concept_id
    AND concept_hierarchy.treemap='Condition'
,
  (SELECT count_value
   FROM results_pps_prostate_cancer_v2038.achilles_results WHERE analysis_id = 1) denom

ORDER BY ar1.count_value DESC