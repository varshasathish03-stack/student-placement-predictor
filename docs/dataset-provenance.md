# Dataset Provenance

## Source Overview
- **Dataset Platform**: Kaggle
- **Source Identifier**: `benroshan/factors-affecting-campus-placement` / `Student Placement Prediction`
- **Source URL**: `https://www.kaggle.com/datasets/benroshan/factors-affecting-campus-placement`
- **Competition Context**: `https://www.kaggle.com/competitions/binary-classification-of-student-placement-outcomes`
- **Download Date**: 2026-09-16
- **Raw Data Path**: `ml/data/raw/Placement_Data_Full_Class.csv`

## Dataset Characteristics
- **Rows**: 215
- **Columns**: 15
- **Target Column**: `status` (`Placed`: 148, `Not Placed`: 67)
- **ID Column**: `sl_no` (to be removed during preprocessing)
- **Leakage Columns**: `salary` (populated only when `status` == `Placed`; must be removed prior to model training)

## Columns & Data Types
1. `sl_no` (int64): Serial Number / ID
2. `gender` (object): Gender ('M', 'F')
3. `ssc_p` (float64): Secondary Education percentage (10th grade)
4. `ssc_b` (object): Board of Education ('Central', 'Others')
5. `hsc_p` (float64): Higher Secondary Education percentage (12th grade)
6. `hsc_b` (object): Board of Education ('Central', 'Others')
7. `hsc_s` (object): Specialization in Higher Secondary ('Commerce', 'Science', 'Arts')
8. `degree_p` (float64): Degree percentage
9. `degree_t` (object): Undergraduation degree type ('Sci&Tech', 'Comm&Mgmt', 'Others')
10. `workex` (object): Work Experience ('No', 'Yes')
11. `etest_p` (float64): Employability test percentage (conducted by college)
12. `specialisation` (object): Post Graduation MBA Specialization ('Mkt&HR', 'Mkt&Fin')
13. `mba_p` (float64): MBA percentage
14. `status` (object): Placement Status ('Placed', 'Not Placed') - **TARGET**
15. `salary` (float64): Salary offered by company to placed candidates (**TARGET LEAKAGE - EXCLUDED FROM TRAINING**)
