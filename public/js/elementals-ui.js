/**
 * Elementals UI Controller
 * Handles filtering, display, and interactions for the Summon Elemental comparison tool
 */

class ElementalsUI {
    constructor() {
        this.allElementals = [];
        this.filteredElementals = [];
        this.currentView = 'table';
        this.currentSort = 'name-asc';
        this.modal = null;

        this.init();
    }

    /**
     * Initialize the UI and set up event listeners
     */
    init() {
        console.log('Elementals page loaded');

        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.onDOMReady());
        } else {
            this.onDOMReady();
        }
    }

    /**
     * DOM ready handler - load initial data and bind events
     */
    onDOMReady() {
        console.log('DOM loaded, initializing...');

        // Load initial elementals from rendered cards
        this.loadInitialElementals();

        // Bind event listeners
        this.bindEvents();

        // Initialize Bootstrap modal
        this.modal = new bootstrap.Modal(document.getElementById('animalDetailModal'));

        console.log('Initialized with', this.allElementals.length, 'elementals');
    }

    /**
     * Load initial elemental data from pre-rendered cards
     */
    loadInitialElementals() {
        const elementalCards = document.querySelectorAll('.animal-card');
        console.log('Found', elementalCards.length, 'elemental cards');

        elementalCards.forEach(card => {
            const id = card.dataset.animalId;
            if (id) {
                this.allElementals.push({ id: id });
            }
        });

        this.filteredElementals = [...this.allElementals];
    }

    /**
     * Bind all event listeners
     */
    bindEvents() {
        const form = document.getElementById('filterForm');

        // Prevent default form submission
        form.addEventListener('submit', (e) => e.preventDefault());

        // Auto-filter on select/checkbox change
        form.querySelectorAll('select, input[type="checkbox"]').forEach(el => {
            el.addEventListener('change', () => this.applyFilters());
        });

        // Clickable table headers
        document.querySelectorAll('.sortable-header').forEach(th => {
            th.addEventListener('click', () => this.handleHeaderSort(th));
        });

        // Auto-filter on text/number input with debounce
        this._inputDebounce = null;
        form.querySelectorAll('input[type="number"], input[type="text"]').forEach(el => {
            el.addEventListener('input', () => {
                clearTimeout(this._inputDebounce);
                this._inputDebounce = setTimeout(() => this.applyFilters(), 400);
            });
        });

        // Reset filters
        document.getElementById('resetFilters').addEventListener('click', (e) => {
            e.preventDefault();
            this.resetFilters();
        });

        // View toggle buttons
        document.querySelectorAll('[data-view]').forEach(btn => {
            btn.addEventListener('click', (e) => this.toggleView(e));
        });
    }

    /**
     * Build filter params from current form state and apply
     */
    async applyFilters() {
        console.log('Filters changed, applying...');

        const params = new URLSearchParams();

        // Keyword search
        const keyword = document.getElementById('keywordSearch').value.trim();
        if (keyword) params.append('keyword', keyword);

        // Level filter
        const level = document.getElementById('levelFilter').value;
        if (level) params.append('level', level);

        // Size filter
        const size = document.getElementById('sizeFilter').value;
        if (size) params.append('size', size);

        // Collect selected traits
        const selectedTraits = [];
        document.querySelectorAll('.trait-checkbox:checked').forEach(cb => {
            selectedTraits.push(cb.value);
        });
        if (selectedTraits.length > 0) {
            params.append('trait', selectedTraits.join(','));
        }

        // Movement checkboxes
        if (document.getElementById('flyingFilter').checked) params.append('hasFlying', 'true');
        if (document.getElementById('climbingFilter').checked) params.append('hasClimbing', 'true');
        if (document.getElementById('burrowingFilter').checked) params.append('hasBurrowing', 'true');
        if (document.getElementById('swimmingFilter').checked) params.append('hasSwimming', 'true');


        this.showLoading(true);

        try {
            const url = `/elementals/api/list?${params.toString()}`;
            console.log('Fetching:', url);

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            console.log('Received:', data.count, 'elementals');

            this.filteredElementals = data.elementals;
            this.updateResults();
            this.sortResults();
            this.updateStats(data.count);
            this.updateVersionButtons(level);
        } catch (error) {
            console.error('Error fetching filtered elementals:', error);
            alert('Failed to filter elementals. Please try again.');
        } finally {
            this.showLoading(false);
        }
    }

    /**
     * Reset all filters and show all elementals
     */
    resetFilters() {
        console.log('Reset filters clicked');
        this.filteredElementals = [...this.allElementals];
        this.updateResults();
        this.sortResults();
        this.updateStats(this.allElementals.length);
        this.updateVersionButtons(null);
    }

    /**
     * Gray out version buttons that don't match the filtered level
     * @param {string|null} level - The filtered level, or null to reset all
     */
    updateVersionButtons(level) {
        document.querySelectorAll('.version-btn').forEach(btn => {
            if (level && btn.dataset.versionLevel !== level) {
                btn.classList.add('disabled');
                btn.style.opacity = '0.35';
            } else {
                btn.classList.remove('disabled');
                btn.style.opacity = '';
            }
        });
    }

    /**
     * Toggle between card and table view
     * @param {Event} e - Click event
     */
    toggleView(e) {
        const view = e.currentTarget.dataset.view;
        console.log('View toggle clicked:', view);
        this.currentView = view;

        // Update active button
        document.querySelectorAll('[data-view]').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');

        // Toggle views
        const cardsContainer = document.getElementById('resultsContainer');
        const tableContainer = document.getElementById('tableContainer');

        if (view === 'cards') {
            cardsContainer.style.display = '';
            tableContainer.style.display = 'none';
        } else {
            cardsContainer.style.display = 'none';
            tableContainer.style.display = '';
        }
    }

    /**
     * Handle clicking a sortable table header
     * @param {HTMLElement} th - The clicked header element
     */
    handleHeaderSort(th) {
        const field = th.dataset.sort;
        const [currentField, currentDir] = this.currentSort.split('-');

        let newDir;
        if (currentField === field) {
            newDir = currentDir === 'asc' ? 'desc' : 'asc';
        } else {
            newDir = field === 'name' ? 'asc' : 'desc';
        }

        this.currentSort = `${field}-${newDir}`;
        this.sortResults();
        this.updateHeaderIcons();
    }

    /**
     * Update sort direction icons on table headers
     */
    updateHeaderIcons() {
        const sortValue = this.currentSort;
        const [field, direction] = sortValue.split('-');

        document.querySelectorAll('.sortable-header').forEach(th => {
            const icon = th.querySelector('i');
            if (th.dataset.sort === field) {
                icon.className = direction === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down';
            } else {
                icon.className = 'fas fa-sort';
            }
        });
    }

    /**
     * Get the relevant speed value based on selected movement filter
     * Falls back to land speed if no movement filter is checked
     */
    getSpeedKey() {
        if (document.getElementById('flyingFilter').checked) return 'speedFly';
        if (document.getElementById('climbingFilter').checked) return 'speedClimb';
        if (document.getElementById('burrowingFilter').checked) return 'speedBurrow';
        if (document.getElementById('swimmingFilter').checked) return 'speedSwim';
        return 'speedLand';
    }

    /**
     * Sort the displayed cards and table rows based on sort selection
     */
    sortResults() {
        const sortValue = this.currentSort;
        const [field, direction] = sortValue.split('-');
        const asc = direction === 'asc';
        const speedKey = this.getSpeedKey();

        const getSortVal = (el) => {
            if (field === 'name') return (el.dataset.name || '').toLowerCase();
            if (field === 'level') return parseInt(el.dataset.level) || 0;
            if (field === 'hp') return parseInt(el.dataset.hp) || 0;
            if (field === 'ac') return parseInt(el.dataset.ac) || 0;
            if (field === 'speed') return parseInt(el.dataset[speedKey]) || 0;
            return 0;
        };

        const compare = (a, b) => {
            const va = getSortVal(a);
            const vb = getSortVal(b);
            if (field === 'name') {
                return asc ? va.localeCompare(vb) : vb.localeCompare(va);
            }
            return asc ? va - vb : vb - va;
        };

        // Sort cards
        const cardsContainer = document.getElementById('resultsContainer');
        const cards = Array.from(cardsContainer.querySelectorAll('.animal-card'));
        cards.sort(compare);
        cards.forEach(card => cardsContainer.appendChild(card));

        // Sort table rows
        const table = document.getElementById('elementalsTable');
        if (table) {
            const tbody = table.querySelector('tbody');
            const rows = Array.from(tbody.querySelectorAll('tr'));
            rows.sort(compare);
            rows.forEach(row => tbody.appendChild(row));
        }
    }

    /**
     * Show or hide loading spinner
     * @param {boolean} show - Whether to show loading state
     */
    showLoading(show) {
        const spinner = document.getElementById('loadingSpinner');
        const cardsContainer = document.getElementById('resultsContainer');
        const tableContainer = document.getElementById('tableContainer');

        if (show) {
            spinner.style.display = '';
            cardsContainer.style.display = 'none';
            tableContainer.style.display = 'none';
        } else {
            spinner.style.display = 'none';
            if (this.currentView === 'table') {
                cardsContainer.style.display = 'none';
                tableContainer.style.display = '';
            } else {
                cardsContainer.style.display = '';
                tableContainer.style.display = 'none';
            }
        }
    }

    /**
     * Update the displayed results based on filtered elementals
     */
    updateResults() {
        console.log('Updating results, showing', this.filteredElementals.length, 'elementals');

        // Build a map of id -> creature data (with matchedVersion if present)
        const filteredMap = {};
        this.filteredElementals.forEach(e => { filteredMap[e.id] = e; });

        const versionColors = { elite: '#4caf50', weak: '#e57373' };

        // Update cards
        document.querySelectorAll('.animal-card').forEach(card => {
            const id = card.dataset.animalId;
            card.style.display = filteredMap[id] ? '' : 'none';
        });

        // Update table rows
        const table = document.getElementById('elementalsTable');
        if (table) {
            table.querySelectorAll('tbody tr').forEach(row => {
                const id = row.dataset.animalId;
                const creature = filteredMap[id];
                if (!creature) {
                    row.style.display = 'none';
                    return;
                }
                row.style.display = '';

                const mv = creature.matchedVersion;
                const hpCell = row.children[2]; // HP column
                const acCell = row.children[3]; // AC column
                const nameCell = row.children[0]; // Name column (has eye button)
                const eyeBtn = nameCell.querySelector('button');

                if (mv && mv !== 'normal' && creature.versions[mv]) {
                    const vData = creature.versions[mv];
                    const color = versionColors[mv];
                    const label = mv.charAt(0).toUpperCase() + mv.slice(1);
                    hpCell.innerHTML = `<span style="color: ${color};" title="${label}">${vData.hp}</span>`;
                    acCell.innerHTML = `<span style="color: ${color};" title="${label}">${vData.ac}</span>`;
                    // Update eye button to open matched version
                    if (eyeBtn) {
                        eyeBtn.setAttribute('onclick', `showAnimalDetail('${id}', '${mv}')`);
                    }
                } else {
                    // Reset to normal values
                    hpCell.textContent = row.dataset.hp;
                    hpCell.style.color = '';
                    acCell.textContent = row.dataset.ac;
                    acCell.style.color = '';
                    if (eyeBtn) {
                        eyeBtn.setAttribute('onclick', `showAnimalDetail('${id}', 'normal')`);
                    }
                }
            });
        }
    }

    /**
     * Update the stats display
     * @param {number} count - Number of filtered elementals
     */
    updateStats(count) {
        console.log('Updating stats, count:', count);

        document.getElementById('resultCount').textContent = count;
        document.getElementById('resultSummary').textContent =
            count === this.allElementals.length
                ? 'Showing all creatures'
                : `Filtered from ${this.allElementals.length} total`;
    }

    /**
     * Show elemental detail modal
     * @param {string} elementalId - ID of the elemental to display
     * @param {string} version - Version to display (always 'normal' for elementals)
     */
    async showElementalDetail(elementalId, version) {
        console.log('Showing detail for:', elementalId, version);

        const titleEl = document.getElementById('animalDetailTitle');
        const bodyEl = document.getElementById('animalDetailBody');

        // Show loading spinner in modal
        bodyEl.innerHTML = '<div class="text-center py-5"><div class="spinner-border text-primary"></div></div>';
        this.modal.show();

        try {
            const response = await fetch(`/elementals/api/detail/${elementalId}`);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const elemental = await response.json();
            const data = elemental.versions[version || 'normal'];

            // Update modal title
            titleEl.textContent = `${data.name} (Level ${data.level})`;

            // Build modal body HTML
            bodyEl.innerHTML = this.buildModalContent(elemental, data);
        } catch (error) {
            console.error('Error loading elemental details:', error);
            bodyEl.innerHTML = '<div class="alert alert-danger">Failed to load elemental details.</div>';
        }
    }

    /**
     * Build the HTML content for the elemental detail modal
     * @param {Object} elemental - Full elemental data
     * @param {Object} data - Version-specific data
     * @returns {string} HTML content
     */
    buildModalContent(elemental, data) {
        const aonprdBaseUrl = document.querySelector('.animal-card a')?.href.split('/Monsters')[0] || 'https://2e.aonprd.com';

        let html = `
            <div class="row">
                <div class="col-md-6">
                    <h6>Stats</h6>
                    <table class="table table-sm table-dark">
                        <tr><th>HP</th><td>${data.hp}</td></tr>
                        <tr><th>AC</th><td>${data.ac}</td></tr>
                        <tr><th>Perception</th><td>${data.perception}</td></tr>
                        <tr><th>Fort</th><td>+${data.saves.fortitude}</td></tr>
                        <tr><th>Reflex</th><td>+${data.saves.reflex}</td></tr>
                        <tr><th>Will</th><td>+${data.saves.will}</td></tr>
                    </table>
                </div>
                <div class="col-md-6">
                    <h6>Movement</h6>
                    <ul class="list-unstyled">
                        ${data.speed.land ? `<li>Land: ${data.speed.land}ft</li>` : ''}
                        ${data.speed.fly ? `<li>Fly: ${data.speed.fly}ft</li>` : ''}
                        ${data.speed.swim ? `<li>Swim: ${data.speed.swim}ft</li>` : ''}
                        ${data.speed.climb ? `<li>Climb: ${data.speed.climb}ft</li>` : ''}
                        ${data.speed.burrow ? `<li>Burrow: ${data.speed.burrow}ft</li>` : ''}
                    </ul>

                    <h6 class="mt-3">Traits</h6>
                    <div>
                        ${data.traits.map(t => `<span class="badge bg-secondary me-1">${t}</span>`).join('')}
                    </div>
                </div>
            </div>

            ${data.summary ? `
            <div class="mt-3">
                <h6>Description</h6>
                <p>${data.summary}</p>
            </div>
            ` : ''}

            ${data.skills ? `
            <div class="mt-3">
                <h6>Skills</h6>
                <p>${data.skills}</p>
            </div>
            ` : ''}

            ${data.senses && data.senses.length > 0 ? `
            <div class="mt-3">
                <h6>Senses</h6>
                <p>${data.senses.join(', ')}</p>
            </div>
            ` : ''}

            ${data.immunities && data.immunities.length > 0 ? `
            <div class="mt-3">
                <h6>Immunities</h6>
                <p>${data.immunities.join(', ')}</p>
            </div>
            ` : ''}

            ${data.weaknesses && data.weaknesses.length > 0 ? `
            <div class="mt-3">
                <h6>Weaknesses</h6>
                <p>${data.weaknesses.join(', ')}</p>
            </div>
            ` : ''}

            ${data.resistances && data.resistances.length > 0 ? `
            <div class="mt-3">
                <h6>Resistances</h6>
                <p>${data.resistances.join(', ')}</p>
            </div>
            ` : ''}

            ${data.spell && data.spell.length > 0 ? `
            <div class="mt-3">
                <h6>Spells</h6>
                <p>${data.spell.join(', ')}${data.spell_attack_bonus ? ` (attack +${data.spell_attack_bonus})` : ''}</p>
            </div>
            ` : ''}

            ${data.abilities && data.abilities.length > 0 ? `
            <div class="mt-3">
                <h6>Special Abilities</h6>
                ${data.ability_descriptions ? `
                <dl>
                    ${data.abilities.map(a => `
                        <dt>${a}</dt>
                        <dd style="margin-bottom: 0.75rem; color: #bbb;">${data.ability_descriptions[a] || '<em>No description available.</em>'}</dd>
                    `).join('')}
                </dl>
                ` : `
                <ul>
                    ${data.abilities.map(a => `<li>${a}</li>`).join('')}
                </ul>
                `}
            </div>
            ` : ''}

            <div class="mt-3">
                <h6>Source</h6>
                <p>${data.source}</p>
                <a href="${aonprdBaseUrl}${data.url}" target="_blank" class="btn btn-sm btn-outline-primary">
                    View on Archives of Nethys <i class="fas fa-external-link-alt"></i>
                </a>
            </div>
        `;

        return html;
    }
}

// Global function for onclick handlers in shared partials (uses same name as animals)
function showAnimalDetail(animalId, version) {
    if (window.elementalsUI) {
        window.elementalsUI.showElementalDetail(animalId, version);
    }
}

// Initialize when script loads
window.elementalsUI = new ElementalsUI();
