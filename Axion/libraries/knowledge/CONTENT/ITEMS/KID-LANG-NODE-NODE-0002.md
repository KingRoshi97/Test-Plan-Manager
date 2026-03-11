---
kid: "KID-LANG-NODE-NODE-0002"
title: "API Structure Pattern (routes/services/data)"
content_type: "pattern"
primary_domain: "["
secondary_domains:
  - "j"
  - "a"
  - "v"
  - "a"
  - "s"
  - "c"
  - "r"
  - "i"
  - "p"
  - "t"
  - "_"
  - "t"
  - "y"
  - "p"
  - "e"
  - "s"
  - "c"
  - "r"
  - "i"
  - "p"
  - "t"
  - ","
  - " "
  - "n"
  - "o"
  - "d"
  - "e"
  - "j"
  - "s"
  - "]"
industry_refs: []
stack_family_refs:
  - "nodejs"
pillar_refs:
  - "technology_knowledge"
status: "active"
authority_tier: "reviewed"
bundle_refs: []
tags:
  - "["
  - "n"
  - "o"
  - "d"
  - "e"
  - ","
  - " "
  - "a"
  - "p"
  - "i"
  - ","
  - " "
  - "r"
  - "o"
  - "u"
  - "t"
  - "e"
  - "s"
  - ","
  - " "
  - "s"
  - "e"
  - "r"
  - "v"
  - "i"
  - "c"
  - "e"
  - "s"
  - "]"
legacy_path: "PILLARS/LANGUAGES_AND_LIBRARIES/javascript_typescript/nodejs/frameworks/node/KID-LANG-NODE-NODE-0002.md"
created_at: "2025-01-01"
updated_at: "2025-01-01"
owner: "axion"
---

# API Structure Pattern (routes/services/data)

# API Structure Pattern (routes/services/data)

## Summary

The API Structure Pattern organizes backend code into three distinct layers: routes, services, and data. This separation of concerns improves maintainability, scalability, and readability in Node.js applications using JavaScript or TypeScript. By isolating routing logic, business logic, and data access logic, this pattern minimizes coupling and promotes clean, modular design.

---

## When to Use

- **RESTful APIs**: Ideal for applications with clearly defined endpoints and CRUD operations.
- **Microservices**: Useful in microservice architectures where APIs need to be independently scalable and maintainable.
- **Growing Codebases**: Recommended when an application’s backend codebase is becoming difficult to manage due to increasing complexity.
- **Team Collaboration**: Effective for teams where developers specialize in different layers (e.g., frontend, backend, database).

---

## Do / Don't

### Do:
1. **Do isolate routing logic**: Keep HTTP-specific logic (e.g., request validation, status codes) in the routes layer.
2. **Do centralize business logic**: Place core application logic in the services layer to make it reusable and testable.
3. **Do abstract database access**: Use the data layer to encapsulate database queries and ORM interactions.

### Don't:
1. **Don't mix layers**: Avoid placing business logic or database queries directly in route handlers.
2. **Don't hard-code dependencies**: Use dependency injection or configuration files for flexibility in the services and data layers.
3. **Don't skip error handling**: Implement consistent error handling across all layers to avoid leaking sensitive information or crashing the application.

---

## Core Content

### Problem
As applications grow, backend codebases often become difficult to maintain due to tightly coupled logic. Mixing routing, business logic, and database queries in route handlers leads to spaghetti code that is hard to debug, test, and scale. This lack of modularity also makes onboarding new developers challenging.

### Solution
The API Structure Pattern organizes backend code into three layers:

1. **Routes Layer**: Handles HTTP requests and responses. It validates inputs, calls the appropriate service methods, and returns responses to the client.
2. **Services Layer**: Contains business logic. It processes data, applies rules, and coordinates actions between the routes and data layers.
3. **Data Layer**: Manages database interactions, such as queries, updates, and schema definitions. It abstracts the persistence logic from the rest of the application.

This separation of concerns ensures modularity, improves testability, and simplifies debugging.

### Implementation Steps

1. **Set Up Project Structure**:
   Create directories for each layer:
   ```
   src/
   ├── routes/
   ├── services/
   ├── data/
   ├── utils/
   └── app.ts
   ```

2. **Define Routes**:
   In the `routes` folder, create route handlers that validate input and delegate logic to the services layer. Example:
   ```typescript
   import express from 'express';
   import { getUserService } from '../services/userService';

   const router = express.Router();

   router.get('/users/:id', async (req, res) => {
       const userId = req.params.id;
       try {
           const user = await getUserService(userId);
           res.status(200).json(user);
       } catch (err) {
           res.status(500).json({ error: err.message });
       }
   });

   export default router;
   ```

3. **Implement Services**:
   In the `services` folder, encapsulate business logic. Example:
   ```typescript
   import { getUserById } from '../data/userData';

   export const getUserService = async (userId: string) => {
       const user = await getUserById(userId);
       if (!user) {
           throw new Error('User not found');
       }
       return user;
   };
   ```

4. **Abstract Data Access**:
   In the `data` folder, centralize database queries. Example:
   ```typescript
   import { db } from '../utils/db';

   export const getUserById = async (userId: string) => {
       const query = 'SELECT * FROM users WHERE id = $1';
       const result = await db.query(query, [userId]);
       return result.rows[0];
   };
   ```

5. **Integrate Layers**:
   Import routes into the main application file (`app.ts`) and connect them to the Express app.
   ```typescript
   import express from 'express';
   import userRoutes from './routes/userRoutes';

   const app = express();
   app.use(express.json());
   app.use('/api', userRoutes);

   app.listen(3000, () => console.log('Server running on port 3000'));
   ```

### Tradeoffs
- **Advantages**:
  - Clear separation of concerns.
  - Easier to test individual layers.
  - Scalable and maintainable codebase.
- **Disadvantages**:
  - Slightly more boilerplate code.
  - Requires discipline to enforce separation.

---

## Links

- **Express.js Documentation**: Official guide for building APIs with Express.js.
- **SOLID Principles**: Design principles that align with modular API structures.
- **Node.js Best Practices**: Industry-standard practices for structuring Node.js applications.

---

## Proof / Confidence

This pattern is widely adopted in the industry, as evidenced by its use in frameworks like NestJS and popular libraries like Express.js. It aligns with the SOLID principles, particularly the Single Responsibility Principle, and is recommended in Node.js best practices guides.
