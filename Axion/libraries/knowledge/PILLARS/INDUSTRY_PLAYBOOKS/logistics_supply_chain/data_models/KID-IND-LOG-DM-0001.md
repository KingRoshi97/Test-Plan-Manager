---
kid: "KID-IND-LOG-DM-0001"
title: "Shipment / SKU / Location Entity Map"
type: "concept"
pillar: "INDUSTRY_PLAYBOOKS"
domains:
  - "logistics_supply_chain"
subdomains: []
tags:
  - "logistics"
  - "data-model"
  - "shipment"
  - "sku"
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

# Shipment / SKU / Location Entity Map

# Shipment / SKU / Location Entity Map

## Summary
The Shipment / SKU / Location Entity Map is a foundational data model in logistics and supply chain management. It represents the relationships between shipments, stock-keeping units (SKUs), and physical or virtual locations within a supply chain. This model enables businesses to track inventory, optimize fulfillment, and streamline operations by providing a structured way to manage and query data across these key entities.

---

## When to Use
- **Inventory Management**: To track the quantity and location of SKUs across warehouses, distribution centers, and retail outlets.
- **Shipment Tracking**: To monitor the movement of shipments and their associated SKUs across the supply chain.
- **Fulfillment Optimization**: To determine the best location to source SKUs for customer orders based on proximity, stock levels, and shipping constraints.
- **Supply Chain Analytics**: To analyze trends, bottlenecks, and inefficiencies in the movement of goods.
- **System Integration**: When integrating ERP, WMS, or TMS systems that require a shared data model for shipments, SKUs, and locations.

---

## Do / Don't

### Do
1. **Normalize Data**: Ensure that each entity (Shipment, SKU, Location) is uniquely identified and well-defined to avoid redundancy.
2. **Use Hierarchical Location Models**: Represent locations hierarchically (e.g., country > warehouse > aisle > bin) for granular tracking and scalability.
3. **Design for Scalability**: Anticipate high transaction volumes and design the entity map to handle large datasets efficiently.

### Don't
1. **Hardcode Relationships**: Avoid hardcoding relationships between shipments, SKUs, and locations, as this limits flexibility and adaptability.
2. **Ignore Real-Time Updates**: Do not rely solely on static data; ensure the model supports real-time updates for accurate tracking.
3. **Overcomplicate the Model**: Avoid excessive granularity or unnecessary attributes that can make the model difficult to maintain and query.

---

## Core Content
The Shipment / SKU / Location Entity Map is a conceptual framework that connects three critical entities in the logistics domain:

1. **Shipment**: Represents a physical or virtual consignment of goods, typically identified by a unique shipment ID. Attributes may include:
   - Shipment ID
   - Origin and destination locations
   - Carrier information
   - Shipment status (e.g., in transit, delivered)

2. **SKU (Stock-Keeping Unit)**: Represents a unique identifier for a specific product or item. Attributes may include:
   - SKU ID
   - Product description
   - Quantity
   - Dimensions and weight

3. **Location**: Represents a physical or virtual point in the supply chain. Locations can range from warehouses and distribution centers to retail stores and customer addresses. Attributes may include:
   - Location ID
   - Location type (e.g., warehouse, store, bin)
   - Geographic coordinates
   - Hierarchical relationships (e.g., warehouse > aisle > bin)

### Relationships
The entity map defines relationships between these entities:
- **Shipment → SKU**: A shipment can contain multiple SKUs, each with a specific quantity.
- **SKU → Location**: An SKU can exist in multiple locations, with quantities tracked per location.
- **Shipment → Location**: A shipment has an origin and destination location, enabling tracking of goods in transit.

### Why It Matters
The Shipment / SKU / Location Entity Map is essential for managing the complexity of modern supply chains. It provides a structured way to answer critical questions, such as:
- Where is a specific SKU located?
- What SKUs are included in a shipment, and where is the shipment now?
- How can fulfillment be optimized based on SKU availability and location?

### Example
Consider an e-commerce company with the following scenario:
- A shipment (ID: SH123) contains 100 units of SKU A and 50 units of SKU B.
- The shipment originates from Warehouse 1 (Location ID: WH1) and is destined for Retail Store 5 (Location ID: RS5).
- SKU A is stored in Warehouse 1 (Bin 101) and Warehouse 2 (Bin 202), while SKU B is stored only in Warehouse 1 (Bin 102).

Using the entity map, the company can track:
- The current location of SH123 (e.g., in transit, delivered).
- The stock levels of SKU A and SKU B across all warehouses.
- The fulfillment status of Retail Store 5's order.

---

## Links
- **Data Modeling in Logistics**: Overview of best practices for designing scalable data models in the supply chain domain.
- **Warehouse Management Systems (WMS)**: Explanation of how WMS software leverages SKU and location data for inventory management.
- **Transportation Management Systems (TMS)**: Insights into how TMS solutions track shipments and optimize routing.
- **GS1 Standards**: Industry standards for unique identification of shipments, SKUs, and locations.

---

## Proof / Confidence
This content is based on established industry practices and standards:
- **GS1 Standards**: Widely adopted for unique identification of products, shipments, and locations.
- **SCOR Model**: The Supply Chain Operations Reference model emphasizes the importance of tracking shipments, inventory, and locations.
- **Case Studies**: Leading logistics providers like FedEx and Amazon use similar data models to manage complex supply chains effectively.
