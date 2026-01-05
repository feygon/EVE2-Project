# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.1.0] - 2025-01-XX

### Fixed
- **Illusion Spell Formatting**
  - Fixed sustained duration logic to follow Pathfinder 2E rules
  - "sustained" alone or "sustained up to 10 min" now correctly classified as long duration
  - "sustained up to 1 min" or "sustained up to X rounds" now correctly classified as short duration
  - Added "unlimited" to long duration classification
  - Fixed area formatting to preserve hyphenated forms (e.g., "30-foot" ? "30-ft.", not "30'")

- **Duplicate Header**
  - Removed duplicate "Subjective Categorizations" header on illusion page

- **Spell URLs**
  - Corrected 45 incorrect Archive of Nethys URLs in illusion spell database
  - All spell links now point to correct pages

### Added
- **Test Coverage**
  - Added comprehensive test suite for Handlebars helpers (124 tests)
  - Achieved 100% branch coverage for helper functions
  - Tests cover all spell formatting edge cases

### Changed
- **Test Configuration**
  - Added `.nyc_output/` and `coverage/` to `.gitignore`
  - Istanbul coverage artifacts no longer committed

---

## [1.0.0] - Initial Release

### Added
- Illusion spell categorization system
- 14 subjective categories for spell organization
- Archive of Nethys integration
- Handlebars helper utilities
- EVE2 space station management system
- Animal breeding system
