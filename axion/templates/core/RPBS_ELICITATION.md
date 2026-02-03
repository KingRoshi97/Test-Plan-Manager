<!-- AXION:TEMPLATE_CONTRACT:v1 -->
<!-- AXION:ELICITATION:RPBS -->
# RPBS Elicitation Pack — Question Set for Missing Input

## Purpose
When filling RPBS_Product.md from user input, use this question set to elicit missing required information. Each question maps to a specific RPBS section.

---

## 1) Product Vision (RPBS §1)

**If vision/goals are unclear:**
- "In one sentence, what problem does this product solve for users?"
- "What are the top 3 things this product must accomplish to be considered successful?"
- "How would you measure if this product is working?"

---

## 2) Feature Scope (RPBS §2)

**If features are vague:**
- "What are the 3-5 features that absolutely must be in the first version?"
- "What features have you seen in competitors that you explicitly do NOT want?"
- "What features would be nice to have but can wait for a later version?"

---

## 3) Users & Permissions (RPBS §3)

**If actors are unclear:**
- "Who are the different types of users? (e.g., admins, regular users, guests)"
- "What can each user type do? What are they NOT allowed to do?"
- "Is there a concept of 'teams' or 'organizations' with their own permissions?"

---

## 4) Core Objects (RPBS §4)

**If entities are unclear:**
- "What are the main 'things' your app manages? (e.g., posts, orders, projects)"
- "How do these things relate to each other? (e.g., a user has many orders)"
- "Which user type owns or manages each thing?"

---

## 5) User Journeys (RPBS §5)

**If journeys are unclear:**
- "Walk me through what a new user does from signup to first value moment."
- "What is the most important action a user takes in your app?"
- "What are 2-3 common scenarios where things could go wrong for a user?"

---

## 6) Navigation (RPBS §6)

**If navigation is unclear:**
- "What are the main sections/tabs of your app?"
- "Where should users land when they first log in?"
- "Do users need to access the app via direct links (deep links)?"

---

## 7) Scale & Performance (RPBS §7)

**If scale is unclear:**
- "How many users do you expect in the first year? (10s, 100s, 1000s, 10000s+)"
- "Does performance need to be instant or can users wait a few seconds?"
- "Is this a critical business system or more of a utility tool?"

**If compliance is unclear:**
- "Does your app handle health data (HIPAA), payment data (PCI), or European users (GDPR)?"
- "Are there any industry regulations you need to follow?"

---

## 8) Data Sensitivity (RPBS §8)

**If data classification is unclear:**
- "What personal information do you collect? (names, emails, addresses, SSN, etc.)"
- "Do you handle financial data like credit cards or bank accounts?"
- "How long should user data be kept? Any legal requirements?"

---

## 9) Integrations (RPBS §9)

**If integrations are unclear:**
- "Does your app need to connect to any external services? (payment, email, analytics, etc.)"
- "Do you need to import data from or export data to other systems?"
- "Are any of these integrations critical for the app to work?"

---

## 10) Copywriting Scope (RPBS §10)

**If copywriting is unclear:**
- "Do you need help writing the text that appears in the app? (buttons, errors, empty states)"
- "What tone should the app have? (professional, casual, friendly, technical)"
- "Will the app send emails or notifications that need written content?"

---

## 11) Technical Constraints (RPBS §11)

**If tech constraints are unclear:**
- "Are there any technologies you MUST use? (specific language, database, hosting)"
- "Are there any technologies you CANNOT use? (company policy, team skills)"
- "Any preferences for tools/frameworks if there's flexibility?"

---

## Usage Protocol

1. **Before asking:** Check if information exists in user input
2. **When asking:** Choose 1-2 most critical questions per section
3. **After asking:** Record answer or mark as UNKNOWN
4. **If UNKNOWN:** Add to OPEN_QUESTIONS with impact statement

---

## Question Priority (If Time-Limited)

| Priority | Section | Why Critical |
|----------|---------|--------------|
| P0 | §5 Journeys | Drives all other design |
| P0 | §4 Objects | Drives data model |
| P0 | §3 Actors | Drives auth system |
| P1 | §2 Features | Defines scope |
| P1 | §7 Scale/Compliance | Affects architecture |
| P2 | §9 Integrations | May block features |
| P2 | §8 Data | Affects security design |
| P3 | §6 Navigation | Can be inferred |
| P3 | §10 Copy | Can defer |
| P3 | §11 Tech | Use defaults |
