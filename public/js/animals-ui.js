/**
 * Animals UI Controller
 * Handles filtering, display, and interactions for the Summon Animal comparison tool
 */

class AnimalsUI {
    constructor() {
        this.allAnimals = [];
        this.filteredAnimals = [];
        this.currentView = 'cards';
        this.modal = null;
        
        this.init();
    }

    /**
     * Initialize the UI and set up event listeners
     */
    init() {
        console.log('Animals page loaded');
        
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
        
        // Load initial animals from rendered cards
        this.loadInitialAnimals();
        
        // Bind event listeners
        this.bindEvents();
        
        // Initialize Bootstrap modal
        this.modal = new bootstrap.Modal(document.getElementById('animalDetailModal'));
        
        console.log('Initialized with', this.allAnimals.length, 'animals');
    }

    /**
     * Load initial animal data from pre-rendered cards
     */
    loadInitialAnimals() {
        const animalCards = document.querySelectorAll('.animal-card');
        console.log('Found', animalCards.length, 'animal cards');
        
        animalCards.forEach(card => {
            const id = card.dataset.animalId;
            if (id) {
                this.allAnimals.push({ id: id });
            }
        });
        
        this.filteredAnimals = [...this.allAnimals];
    }

    /**
     * Bind all event listeners
     */
    bindEvents() {
        // Filter form submission
        document.getElementById('filterForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.applyFilters(e);
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
     * Apply filters based on form input
     * @param {Event} e - Form submit event
     */
    async applyFilters(e) {
        console.log('Filter form submitted');
        
        const formData = new FormData(e.target);
        const params = new URLSearchParams();
        
        // Add form values (skip checkboxes)
        for (const [key, value] of formData.entries()) {
            if (key === 'hasFlying' || key === 'hasSwimming') {
                continue;
            }
            if (value) {
                params.append(key, value);
                console.log('Filter param:', key, '=', value);
            }
        }
        
        // Add checkbox values explicitly
        if (document.getElementById('flyingFilter').checked) {
            params.append('hasFlying', 'true');
            console.log('Filter: hasFlying = true');
        }
        if (document.getElementById('swimmingFilter').checked) {
            params.append('hasSwimming', 'true');
            console.log('Filter: hasSwimming = true');
        }
        
        this.showLoading(true);
        
        try {
            const url = `/animals/api/list?${params.toString()}`;
            console.log('Fetching:', url);
            
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log('Received:', data.count, 'animals');
            
            this.filteredAnimals = data.animals;
            this.updateResults();
            this.updateStats(data.count);
        } catch (error) {
            console.error('Error fetching filtered animals:', error);
            alert('Failed to filter animals. Please try again.');
        } finally {
            this.showLoading(false);
        }
    }

    /**
     * Reset all filters and show all animals
     */
    resetFilters() {
        console.log('Reset filters clicked');
        this.filteredAnimals = [...this.allAnimals];
        this.updateResults();
        this.updateStats(this.allAnimals.length);
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
     * Show or hide loading spinner
     * @param {boolean} show - Whether to show loading state
     */
    showLoading(show) {
        const spinner = document.getElementById('loadingSpinner');
        const cardsContainer = document.getElementById('resultsContainer');
        const tableContainer = document.getElementById('tableContainer');
        
        spinner.style.display = show ? '' : 'none';
        cardsContainer.style.display = show ? 'none' : '';
        tableContainer.style.display = show ? 'none' : '';
    }

    /**
     * Update the displayed results based on filtered animals
     */
    updateResults() {
        console.log('Updating results, showing', this.filteredAnimals.length, 'animals');
        
        const filteredIds = new Set(this.filteredAnimals.map(a => a.id));
        
        // Update cards
        document.querySelectorAll('.animal-card').forEach(card => {
            const id = card.dataset.animalId;
            card.style.display = filteredIds.has(id) ? '' : 'none';
        });
        
        // Update table rows
        document.querySelectorAll('#animalsTable tbody tr').forEach(row => {
            const id = row.dataset.animalId;
            row.style.display = filteredIds.has(id) ? '' : 'none';
        });
    }

    /**
     * Update the stats display
     * @param {number} count - Number of filtered animals
     */
    updateStats(count) {
        console.log('Updating stats, count:', count);
        
        document.getElementById('resultCount').textContent = count;
        document.getElementById('resultSummary').textContent = 
            count === this.allAnimals.length 
                ? 'Showing all creatures' 
                : `Filtered from ${this.allAnimals.length} total`;
    }

    /**
     * Show animal detail modal
     * @param {string} animalId - ID of the animal to display
     * @param {string} version - Version to display (normal, weak, elite)
     */
    async showAnimalDetail(animalId, version) {
        console.log('Showing detail for:', animalId, version);
        
        const titleEl = document.getElementById('animalDetailTitle');
        const bodyEl = document.getElementById('animalDetailBody');
        
        // Show loading spinner in modal
        bodyEl.innerHTML = '<div class="text-center py-5"><div class="spinner-border text-primary"></div></div>';
        this.modal.show();
        
        try {
            const response = await fetch(`/animals/api/detail/${animalId}`);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const animal = await response.json();
            const data = animal.versions[version];
            
            // Update modal title
            titleEl.textContent = `${data.name} (${version.charAt(0).toUpperCase() + version.slice(1)} - Level ${data.level})`;
            
            // Build modal body HTML
            bodyEl.innerHTML = this.buildModalContent(animal, data);
        } catch (error) {
            console.error('Error loading animal details:', error);
            bodyEl.innerHTML = '<div class="alert alert-danger">Failed to load animal details.</div>';
        }
    }

    /**
     * Build the HTML content for the animal detail modal
     * @param {Object} animal - Full animal data
     * @param {Object} data - Version-specific data
     * @returns {string} HTML content
     */
    buildModalContent(animal, data) {
        return `
            <div class="row">
                <div class="col-md-6">
                    <h6>Stats</h6>
                    <table class="table table-sm">
                        <tr><th>HP</th><td>${data.hp}</td></tr>
                        <tr><th>AC</th><td>${data.ac}</td></tr>
                        <tr><th>Perception</th><td>${data.perception}</td></tr>
                        <tr><th>Fort</th><td>${data.saves.fortitude}</td></tr>
                        <tr><th>Reflex</th><td>${data.saves.reflex}</td></tr>
                        <tr><th>Will</th><td>${data.saves.will}</td></tr>
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
            
            ${data.senses.length > 0 ? `
            <div class="mt-3">
                <h6>Senses</h6>
                <p>${data.senses.join(', ')}</p>
            </div>
            ` : ''}
            
            ${data.abilities.length > 0 ? `
            <div class="mt-3">
                <h6>Special Abilities</h6>
                <ul>
                    ${data.abilities.map(a => `<li>${a}</li>`).join('')}
                </ul>
            </div>
            ` : ''}
            
            ${data.immunities.length > 0 ? `
            <div class="mt-3">
                <h6>Immunities</h6>
                <p>${data.immunities.join(', ')}</p>
            </div>
            ` : ''}
            
            ${data.resistances.length > 0 ? `
            <div class="mt-3">
                <h6>Resistances</h6>
                <p>${data.resistances.join(', ')}</p>
            </div>
            ` : ''}
            
            ${data.weaknesses.length > 0 ? `
            <div class="mt-3">
                <h6>Weaknesses</h6>
                <p>${data.weaknesses.join(', ')}</p>
            </div>
            ` : ''}
            
            <div class="mt-3">
                <h6>Source</h6>
                <p>${data.source}</p>
                <a href="${animal.url}" target="_blank" class="btn btn-sm btn-outline-primary">
                    View on Archives of Nethys <i class="fas fa-external-link-alt"></i>
                </a>
            </div>
        `;
    }
}

// Global function for onclick handlers in HTML
function showAnimalDetail(animalId, version) {
    if (window.animalsUI) {
        window.animalsUI.showAnimalDetail(animalId, version);
    }
}

// Initialize when script loads
window.animalsUI = new AnimalsUI();
