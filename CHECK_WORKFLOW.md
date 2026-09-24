# Samadhan Setu – Final Two-Portal AI Routing Workflow

## Required first-stage routing

1. **Citizen submits a problem.**
2. **Python backend AI analyzes the submitted title and description.**
   - The server re-analyzes the report; the browser AI preview is not authoritative.
   - AI categorizes the problem and determines whether it matches a local city-service category.
3. **Binary routing decision:**
   - **Local city problem → City Government Portal**
   - **Not a local city problem → Main Government Portal**
4. The destination is saved in `routing_decision`, `routing_scope`, `routing_reason`, and `stage`.
5. The **City Government Portal** handles normal local civic services such as roads, potholes, drains, waste, street lighting, local public spaces, sanitation, and similar municipal services.
6. The **Main Government Portal** handles all other categories, including education, healthcare, agriculture, state-level infrastructure, administration, and problems that are not classified as local city services.
7. After a problem reaches the Main Government Portal, it always follows the full downstream workflow in order: Government Review → Field Verification → University Solution → Industry/Investment → Government Execution → Resolved. (Previously the University and Industry stages were skipped when `requires_university`/`requires_investment` were false; this has been fixed so every non-city problem passes through all stages.)

## Example: local city problem

**Main Road Broken**

```text
Citizen submits "Main Road Broken"
        ↓
AI categorizes: Road & Transport
        ↓
AI checks local-city scope: YES
        ↓
CITY GOVERNMENT PORTAL
        ↓
Local city worker resolves the road problem
```

## Example: non-local-city problem

**Hospital equipment shortage**

```text
Citizen submits hospital equipment problem
        ↓
AI categorizes: Healthcare
        ↓
AI checks local-city scope: NO
        ↓
MAIN GOVERNMENT PORTAL
        ↓
Government review / verification / solution
```

## Important implementation rule

Research, funding, university, or investment keywords do **not** override the initial two-portal decision. They can affect the downstream Main Government workflow after the problem reaches that portal.
