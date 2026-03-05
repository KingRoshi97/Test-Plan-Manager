---
kid: "KID-IND-LOG-KPI-0001"
title: "On-time Delivery + Delay KPIs"
type: "reference"
pillar: "INDUSTRY_PLAYBOOKS"
domains:
  - "logistics_supply_chain"
subdomains: []
tags:
  - "logistics"
  - "kpi"
  - "delivery"
  - "on-time"
maturity: "reviewed"
use_policy: "pattern_only"
executor_access: "internal_and_external"
license: "internal_owned"
allowed_excerpt:
  max_words: 0
  max_lines: 0
created_at: "2025-01-01"
updated_at: "2025-01-01"
owner: "axion-system"
---

# On-time Delivery + Delay KPIs

# On-time Delivery + Delay KPIs

## Summary
On-time Delivery and Delay KPIs are critical metrics in logistics and supply chain management used to measure the efficiency and reliability of delivery operations. These KPIs track the percentage of deliveries completed within the promised timeframe and identify delays to improve operational performance and customer satisfaction.

## When to Use
- Monitoring delivery performance for B2B or B2C shipments.
- Evaluating carrier or vendor reliability in meeting delivery deadlines.
- Identifying bottlenecks or inefficiencies in transportation and fulfillment processes.
- Benchmarking against industry standards to improve service levels.

## Do / Don't

### Do:
1. **Define clear delivery timeframes:** Ensure promised delivery windows are realistic and account for potential disruptions (e.g., weather, customs).
2. **Use automated tracking systems:** Integrate real-time tracking tools to monitor delivery status and delays efficiently.
3. **Segment KPIs by delivery type:** Separate metrics for express, standard, and international deliveries for more actionable insights.

### Don't:
1. **Ignore root causes of delays:** Avoid focusing solely on metrics without investigating operational issues causing delays.
2. **Overlook customer communication:** Do not neglect notifying customers about delays or changes in delivery schedules.
3. **Apply KPIs uniformly across regions:** Avoid assuming identical benchmarks for different geographies with varying logistics challenges.

## Core Content

### Key Definitions:
- **On-time Delivery Rate:** The percentage of shipments delivered within the promised timeframe. Formula:  
  \[
  \text{On-time Delivery Rate} = \left(\frac{\text{On-time Deliveries}}{\text{Total Deliveries}}\right) \times 100
  \]
- **Delay Rate:** The percentage of shipments delayed beyond the promised timeframe. Formula:  
  \[
  \text{Delay Rate} = \left(\frac{\text{Delayed Deliveries}}{\text{Total Deliveries}}\right) \times 100
  \]

### Parameters:
- **Delivery Window:** The agreed-upon timeframe for delivery (e.g., 2 business days, 5-7 days).
- **Delay Threshold:** The maximum allowable deviation from the delivery window before a shipment is considered delayed.
- **Exclusions:** Factors outside operational control (e.g., natural disasters, government-imposed restrictions).

### Configuration Options:
1. **Tracking Systems:** Integrate GPS, RFID, or IoT-enabled devices for real-time shipment monitoring.
2. **Data Segmentation:** Configure KPIs by region, carrier, product type, or customer tier for granular analysis.
3. **Alerts:** Set automated notifications for shipments at risk of delay to enable proactive interventions.

### Lookup Values:
| **Delivery Type** | **Standard Delivery Window** | **Delay Threshold** |
|--------------------|------------------------------|----------------------|
| Domestic Standard  | 3-5 business days           | +1 day              |
| Domestic Express   | 1-2 business days           | +0.5 day            |
| International      | 7-14 business days          | +2 days             |

### Practical Example:
A logistics company tracks 1,000 shipments in a month. Of these, 920 are delivered on time, and 80 are delayed.  
- **On-time Delivery Rate:** \((920 / 1000) \times 100 = 92\%\)  
- **Delay Rate:** \((80 / 1000) \times 100 = 8\%\)

By analyzing delays, the company identifies that 60% of delays occur due to customs clearance issues, prompting process improvements.

## Links
- **Delivery Performance Benchmarks:** Industry standards for on-time delivery rates by region and sector.  
- **Carrier Evaluation Framework:** Guidelines for assessing carrier reliability and performance.  
- **Supply Chain Analytics Tools:** Software solutions for tracking and analyzing logistics KPIs.  
- **Customer Communication Best Practices:** Strategies for managing delivery expectations and delay notifications.

## Proof / Confidence
- **Industry Standards:** Benchmarks from the Council of Supply Chain Management Professionals (CSCMP) indicate average on-time delivery rates of 95% for domestic shipments.  
- **Case Studies:** Leading logistics companies (e.g., DHL, FedEx) report improved customer satisfaction with proactive delay management.  
- **Operational Best Practices:** Gartner research highlights the importance of segmented KPIs for actionable insights in supply chain optimization.  
