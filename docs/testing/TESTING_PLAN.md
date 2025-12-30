# ?? Testing Plan for RealFeygon.com

**Created:** December 28, 2025  
**Status:** Planning Phase  
**Node.js Version:** 10.x (Production) | 18.x (Development)

---

## ?? Table of Contents

1. [Unit Tests Needed](#unit-tests-needed)
2. [Integration Tests Needed](#integration-tests-needed)
3. [Acceptance Tests Needed](#acceptance-tests-needed)
4. [Testing Tools & Framework](#testing-tools--framework)
5. [Testing Priority](#testing-priority)
6. [Coverage Goals](#coverage-goals)

---

## ?? Unit Tests Needed

### **1. Handlebars Helpers (`views/helpers/helpers.js`)**

#### **Critical Helpers:**

**`range(start, end)`** - ? PRIORITY HIGH
- Test: Returns empty array when parameters are undefined
- Test: Returns correct range [1,2,3] for range(1,3)
- Test: Returns empty array for invalid range (start > end)
- Test: Handles string inputs by parsing to integers
- Test: Works as inline helper with Handlebars `{{#each (range 1 10)}}`

**`compare(lvalue, rvalue, options)`** - ?? PRIORITY MEDIUM
- Test: All operators work correctly (==, ===, !=, <, >, <=, >=, typeof)
- Test: Throws error when < 3 arguments
- Test: Returns correct truthy/falsy for options.fn() and options.inverse()
- Test: Invalid operator throws descriptive error

**`formatGreen(spell, categoryName)`** - ?? PRIORITY MEDIUM
- Test: Correctly formats rank (0 ? Cantrip, 1 ? 1st, 2 ? 2nd, 3 ? 3rd, 4+ ? 4th)
- Test: Includes rarity when present
- Test: Formats area correctly (feet ? ft., 30-ft. ? 30')
- Test: Formats range correctly (touch ? Touch, feet ? ')
- Test: Classifies duration correctly (daily/hour/day ? long, minute/round/sustained ? short)
- Test: Adds "damaging" only for "2. Damage Spells" category

**`eq(lvalue, rvalue)`** - ? PRIORITY LOW
- Test: Returns true for strict equality
- Test: Returns false for non-equal values

**`or(...args)`** - ? PRIORITY LOW
- Test: Returns true if any argument is truthy
- Test: Returns false if all arguments are falsy
- Test: Ignores options object (last argument)

**`json(context)`** - ? PRIORITY HIGH
- Test: Correctly stringifies JavaScript objects
- Test: Handles null and undefined
- Test: Handles nested objects
- Test: Handles circular references gracefully

**`and(var1, var2, options)`** - ?? PRIORITY MEDIUM
- Test: Returns true only if all arguments are truthy
- Test: Throws error when called without arguments
- Test: Works with multiple arguments

**`compare2same(lvalue1, rvalue1, lvalue2, rvalue2, options)`** - ?? PRIORITY LOW
- Test: Performs two comparisons with same operator
- Test: Returns true only if both comparisons are true
- Test: Short-circuits on first false comparison

**`compare2customString(...)`** - ?? PRIORITY LOW
- Test: Uses different operators for each comparison
- Test: Both comparisons must pass for true result
- Test: Handles all valid operator combinations

---

### **2. Animals Callbacks (`scripts/animalsCallbacks.js`)**

#### **Critical Functions:**

**`loadAnimalsData(forceReload)`** - ? PRIORITY HIGH
- Test: Loads and parses JSON data correctly
- Test: Returns cached data when cache is valid
- Test: Forces reload when forceReload=true
- Test: Validates data structure (animals array exists)
- Test: Throws error after max retry attempts
- Test: Returns stale cache as fallback on error
- Test: Implements exponential backoff on retry
- Test: Handles concurrent load requests (isLoading flag)

**`_loadWithRetry()`** - ? PRIORITY HIGH
- Test: Retries up to MAX_RETRY_ATTEMPTS times
- Test: Implements exponential backoff (RETRY_DELAY * attempt)
- Test: Updates cache on successful load
- Test: Falls back to stale cache if available
- Test: Throws descriptive error after all retries fail

**`clearCache()`** - ? PRIORITY LOW
- Test: Clears animalsCache
- Test: Clears lastLoadTime

**`filterAnimals(req, res)`** - ? PRIORITY HIGH
- Test: Filters by level (checks all versions: normal, weak, elite)
- Test: Filters by trait
- Test: Filters by size
- Test: Filters by HP range (minHp, maxHp)
- Test: Filters by flying capability
- Test: Filters by swimming capability
- Test: Returns correct count in response
- Test: Handles multiple filters simultaneously
- Test: Returns 500 status on error

**`getAnimalDetail(req, res)`** - ? PRIORITY MEDIUM
- Test: Finds animal by ID
- Test: Returns 404 when animal not found
- Test: Returns complete animal object
- Test: Returns 500 status on error

**`getAnimalsPage(res, context, complete)`** - ? PRIORITY HIGH
- Test: Loads data successfully
- Test: Populates context with metadata
- Test: Populates context with animals array
- Test: Extracts unique traits for filtering
- Test: Calculates correct min/max level range
- Test: Calls complete() callback
- Test: Returns 500 error on failure

---

### **3. EVE2 Callbacks (Legacy) (`scripts/callbacks.js`)**

**Status:** ?? NEEDS AUDIT - Large legacy module

**Priority Functions to Test:**
- `session.checkSession()` - Session validation
- `session.setSession()` - Session initialization
- `pre.session.copySessionObjToContext()` - Context population
- `monolithic.getCargo_Deep()` - Complex cargo space retrieval

**Recommendation:** Start with session management tests first.

---

### **4. Configuration (`scripts/animals-config.js`)**

**`validateConfig()`** - ? PRIORITY MEDIUM
- Test: Validates all required fields exist
- Test: Validates numeric fields are numbers
- Test: Throws descriptive errors for invalid config

---

## ?? Integration Tests Needed

### **1. Animals Tool API Endpoints**

**GET `/animals`** - ? PRIORITY HIGH
- Test: Returns 200 status
- Test: Renders animals.handlebars template
- Test: Includes all necessary context (metadata, animals, traits, levels)
- Test: Handles data loading errors gracefully

**GET `/animals/api/list`** - ? PRIORITY HIGH
- Test: Returns JSON with filtered animals
- Test: Respects all query parameters
- Test: Returns correct animal count
- Test: Handles invalid parameters gracefully

**GET `/animals/api/detail/:id`** - ? PRIORITY MEDIUM
- Test: Returns animal details for valid ID
- Test: Returns 404 for invalid ID
- Test: Returns complete animal object

---

### **2. Handlebars Template Rendering**

**`views/animals.handlebars`** - ?? PRIORITY MEDIUM
- Test: Renders without errors when data is present
- Test: Shows loading state initially
- Test: Handles empty animals array

**`views/partials/filter-panel.handlebars`** - ? PRIORITY HIGH
- Test: Renders level dropdown using range helper
- Test: Renders trait options
- Test: Form submission works correctly

**`views/partials/creature-card.handlebars`** - ?? PRIORITY MEDIUM
- Test: Renders all animal properties correctly
- Test: Handles missing optional fields (weak version, etc.)

**`views/partials/creature-detail-modal.handlebars`** - ?? PRIORITY LOW
- Test: Modal renders correctly
- Test: Shows all animal details

---

### **3. Database Operations (EVE2)**

**Session Management** - ?? PRIORITY HIGH
- Test: Player session creation
- Test: Session validation
- Test: Session expiration

**Cargo Space Operations** - ?? PRIORITY MEDIUM
- Test: Docking/undocking
- Test: Object movement between cargo spaces
- Test: Cargo space naming

**Industry Operations** - ?? PRIORITY LOW
- Test: Item structure creation
- Test: Item use design
- Test: Object production

---

## ? Acceptance Tests Needed

### **Animals Tool User Flows**

#### **1. Basic Browsing** - ? PRIORITY HIGH
- [ ] User visits `/animals` and sees creature list
- [ ] Default view shows all 354 animals
- [ ] Cards display creature name, level, HP, AC
- [ ] Loading state appears briefly then shows content

#### **2. Level Filtering** - ? PRIORITY HIGH
- [ ] User selects "Level 3" from dropdown
- [ ] Only level 3 creatures are shown
- [ ] Result count updates correctly
- [ ] "All Levels" option clears filter

#### **3. Trait Filtering** - ? PRIORITY HIGH
- [ ] User selects "Animal" trait
- [ ] Only creatures with Animal trait are shown
- [ ] Combining level + trait filters works

#### **4. Size Filtering** - ?? PRIORITY MEDIUM
- [ ] User selects "Large" size
- [ ] Only Large creatures are shown
- [ ] Size filter works with other filters

#### **5. Movement Filters** - ?? PRIORITY MEDIUM
- [ ] User checks "Can Fly"
- [ ] Only flying creatures are shown
- [ ] User checks "Can Swim"
- [ ] Only swimming AND flying creatures shown

#### **6. HP Range Filtering** - ?? PRIORITY MEDIUM
- [ ] User enters Min HP: 50, Max HP: 100
- [ ] Only creatures with HP 50-100 are shown
- [ ] Invalid ranges handled gracefully

#### **7. Creature Details** - ?? PRIORITY MEDIUM
- [ ] User clicks "View Details" on a card
- [ ] Modal opens with full creature stats
- [ ] All versions (Weak/Normal/Elite) are visible
- [ ] Modal closes correctly

#### **8. Reset Filters** - ? PRIORITY HIGH
- [ ] User applies multiple filters
- [ ] User clicks "Reset" button
- [ ] All filters clear and full list shows

#### **9. Mobile Responsiveness** - ?? PRIORITY LOW
- [ ] Filters collapse into mobile menu
- [ ] Cards stack properly on mobile
- [ ] Modal is usable on mobile

---

### **EVE2 User Flows**

#### **1. Player Login** - ?? PRIORITY HIGH
- [ ] User visits `/eve2/player`
- [ ] User selects existing player
- [ ] Session is created
- [ ] User is redirected to operations

#### **2. Space Navigation** - ?? PRIORITY MEDIUM
- [ ] Player in space sees ship inventory
- [ ] Player travels to linked location
- [ ] Location changes correctly
- [ ] Session updates

#### **3. Docking/Undocking** - ?? PRIORITY MEDIUM
- [ ] Player docks at station
- [ ] Ship appears in station inventory
- [ ] Player undocks
- [ ] Ship leaves station

#### **4. Industry Operations** - ?? PRIORITY LOW
- [ ] Player invents new item structure
- [ ] Player designs item use
- [ ] Player produces objects

---

## ??? Testing Tools & Framework

### **Recommended Stack:**

#### **Unit Testing:**
- **Framework:** Mocha or Jest
- **Assertions:** Chai (for Mocha) or Jest built-in
- **Mocking:** Sinon.js for callbacks/DB
- **Coverage:** NYC (Istanbul) or Jest built-in

#### **Integration Testing:**
- **HTTP Testing:** Supertest
- **Template Testing:** Handlebars test renderer

#### **Acceptance Testing:**
- **E2E Framework:** Playwright or Cypress
- **Browser:** Chrome/Firefox/Safari

#### **Node.js 10 Compatibility:**
- ?? Jest may have issues with Node 10
- ? Mocha + Chai is more compatible
- ? Use older versions of testing tools

---

## ?? Testing Priority

### **Phase 1: Critical Unit Tests (Week 1)**
1. ? `range` helper (already caused production bug)
2. ? `json` helper (data serialization - upgraded to HIGH)
3. ? `loadAnimalsData` and `_loadWithRetry`
4. ? `filterAnimals` (core API functionality)
5. ? `getAnimalsPage` (main page load)

### **Phase 2: Integration Tests (Week 2)**
1. ? Animals API endpoints (`/animals`, `/animals/api/list`)
2. ? Filter panel rendering with range helper
3. ?? Session management (EVE2)

### **Phase 3: Acceptance Tests (Week 3)**
1. ? Basic browsing flow
2. ? All filter combinations
3. ? Creature details modal

### **Phase 4: Legacy EVE2 Tests (Week 4)**
1. ?? Session validation
2. ?? Cargo space operations
3. ?? Industry operations

---

## ?? Coverage Goals

### **Minimum Acceptable:**
- **Unit Tests:** 60% code coverage
- **Integration Tests:** All critical endpoints (80%)
- **Acceptance Tests:** All primary user flows (100%)

### **Target Goals:**
- **Unit Tests:** 80% code coverage
- **Integration Tests:** All endpoints (100%)
- **Acceptance Tests:** All user flows including edge cases

### **Critical Modules (Must be 100%):**
- `views/helpers/helpers.js` - Already caused production bugs
- `scripts/animalsCallbacks.js` - Core business logic
- Session management functions

---

## ?? Known Issues to Address

### **?? Recently Fixed:**
1. ? `multiply` helper - **REMOVED** (dead code from legacy schema refactor)
2. ? `compare2same` and `compare2customString` - **FIXED** typo in error messages (`operator1` ? `operator`)

### **?? Active Bugs (Acceptance Testing Failures):**
1. ? **Animal URL Domain Prefix Error** - **FIXED & TESTED**
   - **Issue:** Animal name hyperlinks used wrong domain
   - **Expected:** `https://2e.aonprd.com/Monsters.aspx?ID=2359`
   - **Root Cause:** 
     1. Relative URLs in JSON data were being resolved by browser to current domain
     2. Route handler (`animals.js`) was not passing config value to template
   - **Fix Applied:** 
     - Added `AONPRD_BASE_URL` constant to `scripts/animals-config.js`
     - Updated `animalsCallbacks.getAnimalsPage()` to set `context.aonprdBaseUrl`
     - Updated `animals.js` router to use spread operator (`...context`)
     - Modified `views/partials/creature-card.handlebars` to use `{{@root.aonprdBaseUrl}}{{url}}`
     - Modified `views/partials/creature-table-row.handlebars` to use `{{@root.aonprdBaseUrl}}{{url}}`
   - **Date Fixed:** 2025-12-29
   - **Date Tested:** 2025-12-29
   - **Status:** ? Verified working in localhost:3000

2. ? **Animal Detail Modal Not Opening** - **FIXED & TESTED**
   - **Issue:** Clicking elite/normal/weak buttons produced `showAnimalDetail is not defined` error
   - **Expected:** Modal opens showing creature details
   - **Root Cause:** JavaScript file path incorrect (`/js/animals-ui.js` instead of `/static/js/animals-ui.js`)
   - **Fix Applied:**
     - Updated `views/animals.handlebars` script src to `/static/js/animals-ui.js`
     - Fixed modal URL construction in `public/js/animals-ui.js` to use AONPRD base URL
   - **Date Fixed:** 2025-12-29
   - **Date Tested:** 2025-12-29
   - **Status:** ? Verified working in localhost:3000

### **Code Quality Improvements:**
1. ? **Router Context Passing Pattern** - **IMPROVED**
   - **Before:** Manual property picking (verbose, error-prone)
   - **After:** Spread operator (`...context`) - cleaner, maintainable
   - **Files:** `animals.js`
   - **Benefit:** New properties automatically pass through without router changes
   - **Date:** 2025-12-29

### **Technical Debt:**
1. ?? EVE2 callbacks need refactoring before comprehensive testing
2. ?? SQL queries module needs security audit (SQL injection risks)
3. ?? No input validation on many endpoints
4. ?? EVE2 forms don't parse numeric inputs (packaged/unpackaged volumes)

---

## ?? Next Steps

1. **Immediate:** Set up Mocha + Chai + Supertest
2. **Day 1:** Write unit tests for `range` helper (regression prevention)
3. **Day 2:** Write unit tests for `json` helper (data handling)
4. **Day 3-4:** Write unit tests for animals callbacks
5. **Week 1:** Complete Phase 1 critical unit tests
6. **Week 2:** Add integration tests for Animals tool
7. **Week 3:** Add E2E acceptance tests with Playwright
8. **Week 4:** Begin EVE2 legacy module testing

---

## ?? Related Documentation

- `docs/ANIMALS_BUGS_FIXED.md` - Historical bug fixes
- `docs/deployment/CI_CD_SETUP.md` - Deployment pipeline
- `.github/workflows/deploy.yml` - CI/CD configuration

---

**End of Testing Plan**

**Testing Scope:** Option B - Animals Tool + Shared Helpers (benefits all SPAs)

**Priority Order:**
1. ? Clean up dead code (multiply helper removed)
2. ? Fix helper bugs (compare2same/compare2customString typos fixed)
3. Set up testing framework
4. Write critical unit tests (Phase 1)
5. Add integration tests (Phase 2)
6. Implement E2E tests (Phase 3)
7. Legacy module tests (Phase 4)
