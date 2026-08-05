# CHANGELOG - InterviewAI Platform

## Release v1.2.1 - Core Infrastructure & Interactive UX Refinements

### Highlights & Enhancements
- **Interactive Feedback Page**: Added Recommended Learning Roadmap and Resume Impact Suggestion breakdown cards.
- **Enhanced Configuration Audit**: Added `is_production()` and `validate_configuration()` helper methods to `config.py` for automated environment auditing.
- **Enriched Health Check Endpoint**: Updated `/api/health` and `/health` routes with runtime metadata, version info, and setting health diagnostics.
- **Interactive 404 Experience**: Redesigned `NotFoundPage.tsx` with glassmorphic styling, Lucide icons, and quick navigation actions.
- **Automated API Test Suite**: Updated `test_health.py` unit tests with automated validation of health check response structures.
- **Frontend Utility Suite**: Extended `utils.ts` with `formatScore`, `formatDuration`, and `truncateText` string helpers.
- **Badge Component Upgrades**: Expanded `Badge.tsx` primitive with small/medium/large sizes and customizable glow effects.

---

## Release v1.2.0 - Complete UI & AI Accuracy Upgrade

### Highlights & Features
- **Design System Primitives**: Added reusable `Button`, `Card`, `Badge`, and `Modal` components with Tailwind CSS glassmorphic aesthetics.
- **Navbar & Navigation**: Integrated live Gemini connection indicators, user profile modals, and responsive glass header.
- **Interactive Dashboards**: Upgraded Candidate & Administrator dashboards with search/filter toolbars, real-time scorecards, and multi-field Excel exports.
- **AI Interview Engine**: Implemented zero-hallucination resume grounding prompts, 14-category evaluation rubrics, and response depth probing.
- **Speech & Proctoring**: Added STT phonetic dictionary correction (PyTorch, Kubernetes, React) and tab-switch anti-cheat focus tracking.

