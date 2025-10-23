// Search Functionality
class SearchManager {
    constructor() {
        this.currentResults = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.showTab(e.target.dataset.tab));
        });

        // Search buttons
        document.querySelector('.search-btn')?.addEventListener('click', () => {
            const activeTab = document.querySelector('.search-tab-content.active');
            if (activeTab.id === 'face-search') {
                this.searchByFace();
            } else if (activeTab.id === 'id-search') {
                this.searchById();
            } else if (activeTab.id === 'time-search') {
                this.searchByTime();
            }
        });
    }

    showTab(tabId) {
        // Hide all tabs
        document.querySelectorAll('.search-tab-content').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // Show selected tab
        document.getElementById(tabId).classList.add('active');
        event.target.classList.add('active');
    }

    async searchByFace() {
        const imageFile = document.getElementById('faceImage').files[0];
        if (!imageFile) {
            this.showError('Please upload an image first');
            return;
        }

        this.showLoading('Searching for face matches...');
        this.clearResults();

        try {
            // In a real app, this would send the image to backend
            const results = await this.simulateFaceSearch(imageFile);
            this.displayResults(results, 'face');
        } catch (error) {
            this.showError('Error searching by face: ' + error.message);
        }
    }

    async searchById() {
        const personId = document.getElementById('personIdInput').value.trim();
        if (!personId) {
            this.showError('Please enter a Person ID');
            return;
        }

        this.showLoading('Searching for ID...');
        this.clearResults();

        try {
            const results = await this.simulateIdSearch(personId);
            this.displayResults(results, 'id');
        } catch (error) {
            this.showError('Error searching by ID: ' + error.message);
        }
    }

    async searchByTime() {
        const timeFrom = document.getElementById('timeFrom').value;
        const timeTo = document.getElementById('timeTo').value;
        const camera = document.getElementById('timeCamera').value;

        if (!timeFrom || !timeTo) {
            this.showError('Please select both time ranges');
            return;
        }

        this.showLoading('Searching by time...');
        this.clearResults();

        try {
            const results = await this.simulateTimeSearch(timeFrom, timeTo, camera);
            this.displayResults(results, 'time');
        } catch (error) {
            this.showError('Error searching by time: ' + error.message);
        }
    }

    async simulateFaceSearch(imageFile) {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Mock results
        return [
            {
                id: 'PERSON_001',
                image: '/static/images/bg-login.jpg',
                camera: 'CAM_1',
                time: '2025-10-23 14:30:22',
                confidence: 95,
                duration: 300,
                match_type: 'face'
            },
            {
                id: 'PERSON_007',
                image: '/static/images/bg-login.jpg',
                camera: 'CAM_2',
                time: '2025-10-23 14:25:10',
                confidence: 87,
                duration: 725,
                match_type: 'face'
            },
            {
                id: 'PERSON_012',
                image: '/static/images/bg-login.jpg',
                camera: 'CAM_3',
                time: '2025-10-23 14:35:45',
                confidence: 92,
                duration: 165,
                match_type: 'face'
            }
        ];
    }

    async simulateIdSearch(personId) {
        await new Promise(resolve => setTimeout(resolve, 1000));

        return [
            {
                id: personId,
                image: '/static/images/bg-login.jpg',
                camera: 'CAM_1',
                time: '2025-10-23 14:30:22',
                confidence: 100,
                duration: 300,
                match_type: 'id'
            }
        ];
    }

    async simulateTimeSearch(timeFrom, timeTo, camera) {
        await new Promise(resolve => setTimeout(resolve, 1500));

        return [
            {
                id: 'PERSON_001',
                image: '/static/images/bg-login.jpg',
                camera: 'CAM_1',
                time: '2025-10-23 14:30:22',
                confidence: 95,
                duration: 300,
                match_type: 'time'
            },
            {
                id: 'PERSON_002',
                image: '/static/images/bg-login.jpg',
                camera: 'CAM_2',
                time: '2025-10-23 14:25:10',
                confidence: 87,
                duration: 725,
                match_type: 'time'
            }
        ];
    }

    displayResults(results, searchType) {
        const resultsGrid = document.getElementById('resultsGrid');
        if (!resultsGrid) return;

        resultsGrid.innerHTML = results.map(result => `
            <div class="result-card" onclick="openSearchResult('${result.id}', '${result.match_type}')">
                <img src="${result.image}" alt="${result.id}" class="result-image">
                <div class="result-info">
                    <h4>${result.id}</h4>
                    <div class="result-meta">
                        <span class="camera-tag">${result.camera}</span>
                        <span class="time-tag">${result.time}</span>
                        <span class="duration-tag">${this.formatDuration(result.duration)}</span>
                    </div>
                    <div class="result-confidence">
                        <span class="confidence">
                            <i class="fas fa-star"></i> ${result.confidence}% match
                        </span>
                    </div>
                </div>
            </div>
        `).join('');

        this.hideLoading();
    }

    formatDuration(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        if (hours > 0) return `${hours}h ${minutes}m`;
        if (minutes > 0) return `${minutes}m ${secs}s`;
        return `${secs}s`;
    }

    showLoading(message) {
        const resultsGrid = document.getElementById('resultsGrid');
        if (resultsGrid) {
            resultsGrid.innerHTML = `<div class="loading">${message}</div>`;
        }
    }

    hideLoading() {
        const loading = document.querySelector('.loading');
        if (loading) {
            loading.remove();
        }
    }

    clearResults() {
        const resultsGrid = document.getElementById('resultsGrid');
        if (resultsGrid) {
            resultsGrid.innerHTML = '';
        }
    }

    showError(message) {
        alert(message);
    }
}

// Initialize search manager when page loads
document.addEventListener('DOMContentLoaded', function() {
    window.searchManager = new SearchManager();
});

// Global functions for HTML
function openSearchResult(personId, matchType) {
    alert(`Opening details for ${personId} (${matchType} match). In a real app, this would show detailed tracking information.`);
}

function previewImage(input, previewId) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById(previewId).style.display = 'block';
            document.getElementById(`${previewId}Img`).src = e.target.result;
        };
        reader.readAsDataURL(input.files[0]);
    }
}

function clearPreview(previewId) {
    document.getElementById(previewId).style.display = 'none';
    document.getElementById(`${previewId}Img`).src = '';
}