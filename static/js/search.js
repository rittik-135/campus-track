// Search Functionality
class SearchManager {
    constructor() {
        this.currentResults = [];
        this.searchHistory = [];
        this.currentSearchType = 'face';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupTabNavigation();
        this.setupDragAndDrop();
    }

    setupEventListeners() {
        // Search buttons
        document.querySelectorAll('.login-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const activeTab = document.querySelector('.search-tab-content.active');
                if (activeTab.id === 'face-search') {
                    this.searchByFace();
                } else if (activeTab.id === 'id-search') {
                    this.searchById();
                } else if (activeTab.id === 'time-search') {
                    this.searchByTime();
                }
            });
        });

        // Input events for real-time search
        document.getElementById('personIdInput')?.addEventListener('input', (e) => {
            if (e.target.value.length >= 3) {
                this.debounce(() => this.searchById(), 500)();
            }
        });
    }

    setupTabNavigation() {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.showTab(e.target.dataset.tab);
            });
        });
    }

    setupDragAndDrop() {
        const uploadArea = document.getElementById('faceUploadArea');
        if (!uploadArea) return;

        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, preventDefaults, false);
        });

        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }

        ['dragenter', 'dragover'].forEach(eventName => {
            uploadArea.addEventListener(eventName, highlight, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, unhighlight, false);
        });

        function highlight(e) {
            uploadArea.style.borderColor = '#e60000';
            uploadArea.style.backgroundColor = 'rgba(230, 0, 0, 0.1)';
        }

        function unhighlight(e) {
            uploadArea.style.borderColor = '#e0e0e0';
            uploadArea.style.backgroundColor = 'rgba(248, 249, 250, 0.5)';
        }

        uploadArea.addEventListener('drop', handleDrop, false);

        function handleDrop(e) {
            const dt = e.dataTransfer;
            const files = dt.files;
            handleFiles(files);
        }

        function handleFiles(files) {
            if (files.length) {
                const file = files[0];
                if (file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        document.getElementById('facePreview').style.display = 'block';
                        document.getElementById('facePreviewImg').src = e.target.result;
                    };
                    reader.readAsDataURL(file);
                }
            }
        }
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
        
        this.currentSearchType = tabId.replace('-search', '');
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
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 2000));

            const results = await this.simulateFaceSearch(imageFile);
            this.displayResults(results, 'face');
            this.addToSearchHistory('face', imageFile.name, results.length);
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
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            const results = await this.simulateIdSearch(personId);
            this.displayResults(results, 'id');
            this.addToSearchHistory('id', personId, results.length);
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
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            const results = await this.simulateTimeSearch(timeFrom, timeTo, camera);
            this.displayResults(results, 'time');
            this.addToSearchHistory('time', `${timeFrom} to ${timeTo}`, results.length);
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
                match_type: 'face',
                first_seen: '2025-10-23 14:30:22',
                last_seen: '2025-10-23 14:35:22',
                total_cameras: 1
            },
            {
                id: 'PERSON_007',
                image: '/static/images/bg-login.jpg',
                camera: 'CAM_2',
                time: '2025-10-23 14:25:10',
                confidence: 87,
                duration: 725,
                match_type: 'face',
                first_seen: '2025-10-23 14:25:10',
                last_seen: '2025-10-23 14:37:15',
                total_cameras: 2
            },
            {
                id: 'PERSON_012',
                image: '/static/images/bg-login.jpg',
                camera: 'CAM_3',
                time: '2025-10-23 14:35:45',
                confidence: 92,
                duration: 165,
                match_type: 'face',
                first_seen: '2025-10-23 14:35:45',
                last_seen: '2025-10-23 14:38:30',
                total_cameras: 1
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
                match_type: 'id',
                first_seen: '2025-10-23 14:30:22',
                last_seen: '2025-10-23 14:35:22',
                total_cameras: 1
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
                match_type: 'time',
                first_seen: '2025-10-23 14:30:22',
                last_seen: '2025-10-23 14:35:22',
                total_cameras: 1
            },
            {
                id: 'PERSON_002',
                image: '/static/images/bg-login.jpg',
                camera: 'CAM_2',
                time: '2025-10-23 14:25:10',
                confidence: 87,
                duration: 725,
                match_type: 'time',
                first_seen: '2025-10-23 14:25:10',
                last_seen: '2025-10-23 14:37:15',
                total_cameras: 2
            }
        ];
    }

    displayResults(results, searchType) {
        const resultsGrid = document.getElementById('resultsGrid');
        if (!resultsGrid) return;

        if (results.length === 0) {
            resultsGrid.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-search"></i>
                    <h3>No results found</h3>
                    <p>Try adjusting your search criteria</p>
                </div>
            `;
            this.hideLoading();
            return;
        }

        resultsGrid.innerHTML = results.map(result => `
            <div class="result-card fade-in" onclick="openSearchResult('${result.id}', '${result.match_type}')">
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
                    <div class="result-details">
                        <span><i class="fas fa-clock"></i> ${result.first_seen}</span>
                        <span><i class="fas fa-video"></i> ${result.total_cameras} cams</span>
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
            resultsGrid.innerHTML = `
                <div class="loading">
                    <i class="fas fa-spinner fa-spin"></i>
                    ${message}
                </div>
            `;
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

    addToSearchHistory(type, query, resultsCount) {
        const historyItem = {
            type,
            query,
            resultsCount,
            timestamp: new Date().toLocaleString(),
            id: Date.now()
        };
        
        this.searchHistory.unshift(historyItem);
        
        // Keep only last 10 searches
        if (this.searchHistory.length > 10) {
            this.searchHistory = this.searchHistory.slice(0, 10);
        }
    }

    showError(message) {
        // Remove any existing error notifications
        document.querySelectorAll('.notification.error').forEach(el => el.remove());
        
        const notification = document.createElement('div');
        notification.className = 'notification error';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #dc3545;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            z-index: 1000;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            animation: fadeIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }

    // Debounce function for real-time search
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

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

// Initialize search manager when page loads
document.addEventListener('DOMContentLoaded', function() {
    window.searchManager = new SearchManager();
});