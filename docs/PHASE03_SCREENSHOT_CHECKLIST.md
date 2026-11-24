# Phase 03 screenshot and journey checklist

Capture each route at desktop (1440×900), tablet (1024×768), and mobile (390×844). Use synthetic data only and confirm no horizontal overflow, clipped text, or inaccessible controls.

## Student journey

- [ ] `/preview/student`: switch Student/Faculty/Admin preview; KPI values and mini chart update; status text is announced.
- [ ] `/student/dashboard`: confirm all ten navigation labels are visible through desktop nav and mobile menu.
- [ ] Student `Learning`: open the DKT prerequisite graph, inspect a concept, and return to the planner.
- [ ] Student `Attendance`, `Grades`, `Schedule`, `Opportunities`, `Wellbeing`, `Fees`, `Library`, `Announcements`, and `Settings`: each target section has a heading, empty/error boundary, and visible focus state.

## Faculty journey

- [ ] `/preview/faculty`: open the preview and verify the review queue filter, pending/reviewed state, marks import correction, paper-audit context, and schedule review context.
- [ ] `/faculty/dashboard`: verify role-specific review copy and that demo actions announce their result without claiming persistence.

## Admin journey

- [ ] `/preview/admin`: verify ticket/SLA, equipment forecast, restricted grievance, event approval, and roles/settings review cards.
- [ ] `/admin/dashboard`: verify the operational queue and privacy boundary copy.

## Responsive/accessibility pass

- [ ] Mobile header opens/closes with a labelled button and closes after selecting a link.
- [ ] Every interactive control has a name, visible focus ring, and keyboard path.
- [ ] Loading/empty/error states are understandable without colour alone.
- [ ] Screenshot captions record route, viewport, browser, commit, and whether the API was reachable.
