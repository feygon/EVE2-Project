# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Planned
- **MERN Migration** - Transition from Handlebars to React frontend
  - See `docs/learning/` for migration planning documentation
  - Express backend remains, routes will become REST API endpoints
  - Business logic in callbacks preserved as API controllers

---

## [2.1.1] - 2025-01-07

### Verified
- **Production Deployment**
  - All v2.1.0 fixes verified in production environment
  - Spell URL corrections confirmed working
  - Sustained duration logic validated
  - Test coverage maintained at 100%

### Changed
- **Version Numbering**
  - Incremented to 2.1.1 for future changes
  - Preparing codebase for MERN migration (v3.0.0)

---

## [2.1.0] - 2025-01-07

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
  - Added Istanbul ignore directives for unreachable error handling code

- **Documentation**
  - Added CHANGELOG.md to track version history
  - Added learning documentation in `docs/learning/`:
    - MERN stack migration guides
    - Animals system analysis
    - Neuro-accessibility audit

### Changed
- **Test Configuration**
  - Added `.nyc_output/` and `coverage/` to `.gitignore`
  - Istanbul coverage artifacts no longer committed
  - Coverage reports generated locally for development

### Technical Details
- **Files Modified:**
  - `views/helpers/helpers.js` - Core formatting logic fixes
  - `test/unit/helpers.test.js` - Comprehensive test coverage
  - `views/partials/category_block.handlebars` - Removed duplicate header
  - `scripts/sql/illusions DDQ.sql` - Updated with corrected spell URLs
  - `.gitignore` - Added coverage directories

- **Database Updates:**
  - Created `scripts/sql/UPDATE_spell_urls.sql` for production database updates
  - Fixed 45 spell URLs in production database

---

## [2.0.0] - Previous Release

### Added
- Illusion spell categorization system with 14 subjective categories
- Archive of Nethys integration for spell details
- Handlebars helper utilities for spell formatting
- EVE2 space station management system
- Animal breeding system

---

## [1.0.0] - Initial Release

### Added
- Core EVE2 space station mechanics
- Basic database structure
- Player management system
- Cargo space and object tracking
