# ICHRA Benefit Bundler UI

A React-based user interface for optimizing Individual Coverage Health Reimbursement Arrangement (ICHRA) plan bundles using CMS marketplace data.

## Overview

This application provides a comprehensive interface for employers to configure employee demographics and optimization constraints, then receive optimal health plan recommendations based on real CMS (Centers for Medicare & Medicaid Services) marketplace data.

## Features

### Employee Demographics Configuration
- **Age Ranges**: Uses actual age brackets from CMS Rate PUF data (0-20, 21, 22, ..., 64, Family Option)
- **State Selection**: All 50 US states plus DC
- **Tobacco Preferences**: No Preference, Tobacco, Non-Tobacco (matching CMS data)
- **Budget Caps**: Monthly budget limits per employee group
- **Employee Counts**: Number of employees in each group

### Optimization Constraints
- **Maximum Monthly Premium**: Based on IndividualRate from Rate PUF
- **Minimum Actuarial Value**: Percentage from Plan Attributes PUF
- **Preferred Metal Level**: Low (Bronze) or High (Gold/Platinum)
- **Preferred Plan Type**: PPO, HMO, EPO, POS
- **Required Benefits**: Based on actual benefit names from Benefits Cost Sharing PUF
- **Maximum Deductible**: Optional constraint
- **HSA Eligibility**: Filter for HSA-eligible plans only

### Plan Display
- **Plan Details**: PlanMarketingName, PlanType, MetalLevel from Plan Attributes PUF
- **Cost Information**: IndividualRate (monthly premium) from Rate PUF
- **Coverage Details**: ActuarialValue, HSA eligibility, deductibles, MOOP amounts
- **Network Information**: NetworkId and ServiceAreaId
- **Covered Benefits**: Actual benefit names from Benefits Cost Sharing PUF
- **Copay/Coinsurance**: Real cost-sharing data from CMS

## Data Sources

The UI is designed to work with the following CMS Public Use Files:

1. **Rate_PUF.csv**: Premium rates by age, state, and tobacco status
2. **Plan_Attributes_PUF.csv**: Plan characteristics, metal levels, actuarial values
3. **Benefits_Cost_Sharing_PUF.csv**: Coverage details, copays, coinsurance
4. **Service_Area_PUF.csv**: Geographic coverage areas

## Technical Stack

- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Vite** for build tooling

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open your browser to the displayed URL (typically http://localhost:5173)

## Usage

1. **Configure Employee Groups**: Add employee demographics including age ranges, state, tobacco preferences, and budget caps
2. **Set Constraints**: Define optimization parameters like maximum premiums, minimum actuarial values, and required benefits
3. **Run Optimization**: Click "Start Optimization" to generate plan recommendations
4. **Review Results**: View recommended plans with detailed cost breakdowns and alternative options

## Key Design Decisions

- **Data-Driven**: All parameters are based on actual CMS CSV fields, no fictional data
- **Realistic Constraints**: Uses real benefit names, age brackets, and plan types from CMS
- **Comprehensive Display**: Shows all relevant plan information available in the data
- **User-Friendly**: Step-by-step wizard interface for easy configuration

## Future Enhancements

- Integration with actual backend optimization engine
- Real-time data loading from CMS APIs
- Advanced filtering and sorting options
- Export functionality for optimization results
- Comparison charts and visualizations
