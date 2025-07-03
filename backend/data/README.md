# CMS PUF Data Directory

This directory should contain CMS Public Use Files (PUF) in CSV format.

## Required PUF Files

The ICHRA Benefit Bundler expects the following CMS PUF files for optimal functionality:

### Primary Files (Required)
1. **Plan-Attributes-PUF-{YEAR}.csv** - Contains deductibles, out-of-pocket maximums, HSA eligibility
2. **Rate-PUF-{YEAR}.csv** - Contains monthly premiums and rate information

### Secondary Files (Optional but Recommended)
3. **Benefits-and-Cost-Sharing-PUF-{YEAR}.csv** - Contains actuarial values and coverage details
4. **Service-Area-PUF-{YEAR}.csv** - Contains geographic service areas

## Expected Column Mappings

### Plan Attributes PUF
- `StandardComponentId` - Unique plan identifier
- `IndividualMedicalDeductible` - Annual medical deductible
- `IndividualMedicalMaximumOutofPocket` - Maximum out-of-pocket cost
- `HSAOrHRAEmployerContribution` - HSA/HRA employer contribution amount
- `HSAEligible` - HSA eligibility indicator

### Rate PUF
- `StandardComponentId` - Unique plan identifier
- `IndividualRate21` - Monthly premium for 21-year-old individual

### Benefits PUF
- `StandardComponentId` - Unique plan identifier
- `AVCalculatorOutputNumber` - Actuarial value (0-1)

### Service Area PUF
- `StandardComponentId` - Unique plan identifier
- `StateCode` - State abbreviation
- `CountyName` - County name
- `ZipCode` - ZIP code

## Data Sources

CMS PUF files can be downloaded from:
- [CMS.gov Public Use Files](https://www.cms.gov/marketplace/resources/data/public-use-files)
- Healthcare.gov Public Use Files

## File Naming Convention

The loader expects files named with the pattern:
- `Plan-Attributes-PUF-2025.csv`
- `Rate-PUF-2025.csv`
- `Benefits-and-Cost-Sharing-PUF-2025.csv`
- `Service-Area-PUF-2025.csv`

## Fallback Support

If PUF files are not found, the system will fall back to generic CSV files with the original column format.

## Usage

```python
# Load latest PUF data (2025)
plans = data_service.load_cms_data("data", "2025")

# Load specific year
plans = data_service.load_cms_data("data", "2024")
``` 