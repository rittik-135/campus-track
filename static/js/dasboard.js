// Dashboard Interactivity
class DashboardManager {
    constructor() {
        this.currentFilters = {};
        this.personsData = [];
        this.camerasData = [];
        this.isRealTimeUpdating = true;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadInitialData();
        this.startRealTimeUpdates();
        this.setupCameraHoverEffects();
    }

    setupEventListeners() {
        // Camera hover effects
        document.querySelectorAll('.camera-feed').forEach(feed => {
            feed.addEventListener('mouseenter', () => this.focusCamera(feed));
            feed.addEventListener('mouseleave', () => this.blurCamera(feed));
        });

        // Filter events
        const filterElements = [
            document.getElementById('dateFrom'),
            document.getElementById('dateTo'),
            document.getElementById('cameraFilter'),
            document.getElementById('durationFilter'),
            document.getElementById('personIdFilter')
        ];
        
        filterElements.forEach(element => {
            if (element) {
                element.addEventListener('change', () => this.applyFilters());
                element.addEventListener('input', () => this.applyFilters());
            }
        });

        // Filter button
        document.querySelector('.filter-btn')?.addEventListener('click', () => this.applyFilters());
    }

    setupCameraHoverEffects() {
        // Add smooth transitions to camera feeds
        document.querySelectorAll('.camera-feed').forEach(feed => {
            feed.style.transition = 'all 0.3s ease';
        });
    }

    focusCamera(cameraElement) {
        cameraElement.classList.remove('blurred');
        cameraElement.style.transform = 'scale(1.05)';
        cameraElement.style.zIndex = '10';
        cameraElement.style.boxShadow = '0 10px 30px rgba(230, 0, 0, 0.3)';
    }

    blurCamera(cameraElement) {
        cameraElement.classList.add('blurred');
        cameraElement.style.transform = 'scale(1)';
        cameraElement.style.zIndex = '1';
        cameraElement.style.boxShadow = 'none';
    }

    applyFilters() {
        this.currentFilters = {
            dateFrom: document.getElementById('dateFrom')?.value,
            dateTo: document.getElementById('dateTo')?.value,
            camera: document.getElementById('cameraFilter')?.value,
            duration: document.getElementById('durationFilter')?.value,
            personId: document.getElementById('personIdFilter')?.value?.toLowerCase()
        };

        this.filterPersons();
    }

    async loadInitialData() {
        try {
            // Show loading state
            this.showLoadingState();
            
            // Simulate API call delay for demo
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Mock data for demo
            this.personsData = [
                {
                    id: 'PERSON_001',
                    image: '/static/images/bg-login.jpg',
                    camera: 'CAM_1',
                    first_seen: '2025-10-23 14:30:22',
                    last_seen: '2025-10-23 14:35:22',
                    duration: 300,
                    total_cameras: 1,
                    status: 'active',
                    confidence: 95,
                    display_image: '/static/images/bg-login.jpg'
                },
                {
                    id: 'PERSON_002',
                    image: '/static/images/bg-login.jpg',
                    camera: 'CAM_2',
                    first_seen: '2025-10-23 14:25:10',
                    last_seen: '2025-10-23 14:37:15',
                    duration: 725,
                    total_cameras: 2,
                    status: 'inactive',
                    confidence: 87,
                    display_image: '/static/images/bg-login.jpg'
                },
                {
                    id: 'PERSON_003',
                    image: '/static/images/bg-login.jpg',
                    camera: 'CAM_3',
                    first_seen: '2025-10-23 14:35:45',
                    last_seen: '2025-10-23 14:38:30',
                    duration: 165,
                    total_cameras: 1,
                    status: 'active',
                    confidence: 92,
                    display_image: '/static/images/bg-login.jpg'
                },
                {
                    id: 'PERSON_004',
                    image: '/static/images/bg-login.jpg',
                    camera: 'DEMO_CAM',
                    first_seen: '2025-10-23 14:40:10',
                    last_seen: '2025-10-23 14:42:25',
                    duration: 135,
                    total_cameras: 1,
                    status: 'active',
                    confidence: 89,
                    display_image: '/static/images/bg-login.jpg'
                }
            ];

            // Load camera data
            this.camerasData = [
                { id: 'CAM_1', status: 'active', persons: 12, last_seen: '2 min ago' },
                { id: 'CAM_2', status: 'active', persons: 8, last_seen: '5 min ago' },
                { id: 'CAM_3', status: 'active', persons: 15, last_seen: '1 min ago' },
                { id: 'DEMO_CAM', status: 'demo', persons: 'live', last_seen: 'now' }
            ];

            this.updateStats();
            this.renderPersons();
            this.hideLoadingState();
        } catch (error) {
            console.error('Error loading initial data', error);
            this.hideLoadingState();
            this.showError('Failed to load dashboard data');
        }
    }

    showLoadingState() {
        const personsGrid = document.getElementById('personsGrid');
        if (personsGrid) {
            personsGrid.innerHTML = `
                <div class="loading">
                    <i class="fas fa-spinner fa-spin"></i>
                    Loading dashboard data...
                </div>
            `;
        }
    }

    hideLoadingState() {
        const loading = document.querySelector('.loading');
        if (loading) {
            loading.remove();
        }
    }

    updateStats() {
        document.getElementById('totalPersons').textContent = this.personsData.length;
        document.getElementById('activeCameras').textContent = this.camerasData.length;
        document.getElementById('totalDuration').textContent = this.getTotalDuration();
        document.getElementById('recentSearches').textContent = 23;
    }

    getTotalDuration() {
        const totalSeconds = this.personsData.reduce((sum, person) => sum + person.duration, 0);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        return `${hours}h ${minutes}m`;
    }

    filterPersons() {
        let filtered = this.personsData;

        // Apply filters
        if (this.currentFilters.dateFrom) {
            filtered = filtered.filter(person => 
                person.first_seen >= this.currentFilters.dateFrom
            );
        }

        if (this.currentFilters.dateTo) {
            filtered = filtered.filter(person => 
                person.last_seen <= this.currentFilters.dateTo
            );
        }

        if (this.currentFilters.camera && this.currentFilters.camera !== '') {
            filtered = filtered.filter(person => 
                person.camera === this.currentFilters.camera
            );
        }

        if (this.currentFilters.duration && this.currentFilters.duration !== '') {
            const durationSeconds = parseInt(this.currentFilters.duration) * 60;
            filtered = filtered.filter(person => 
                person.duration >= durationSeconds
            );
        }

        if (this.currentFilters.personId) {
            filtered = filtered.filter(person => 
                person.id.toLowerCase().includes(this.currentFilters.personId)
            );
        }

        this.renderPersons(filtered);
    }

    renderPersons(persons = this.personsData) {
        const grid = document.getElementById('personsGrid');
        if (!grid) return;

        if (persons.length === 0) {
            grid.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-search"></i>
                    <h3>No persons found</h3>
                    <p>Try adjusting your filters</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = persons.map(person => `
            <div class="person-card fade-in" onclick="openPersonDetails('${person.id}')">
                <img src="${person.display_image || person.image}" alt="${person.id}" class="person-image">
                <div class="person-info">
                    <h4>${person.id}</h4>
                    <div class="person-meta">
                        <span class="camera-tag">${person.camera}</span>
                        <span class="time-tag">${person.first_seen}</span>
                    </div>
                    <div class="person-stats">
                        <span><i class="fas fa-clock"></i> ${this.formatDuration(person.duration)}</span>
                        <span class="status ${person.status}">${person.status}</span>
                        <span><i class="fas fa-video"></i> ${person.total_cameras}</span>
                    </div>
                    <div class="person-confidence">
                        <span class="confidence">
                            <i class="fas fa-star"></i> ${person.confidence}% confidence
                        </span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    formatDuration(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        if (hours > 0) return `${hours}h ${minutes}m`;
        if (minutes > 0) return `${minutes}m ${secs}s`;
        return `${secs}s`;
    }

    startRealTimeUpdates() {
        // Simulate real-time updates
        setInterval(() => {
            if (this.isRealTimeUpdating) {
                this.updateRealTimeStats();
            }
        }, 5000);
    }

    updateRealTimeStats() {
        // Update person count in real-time
        const newPersonCount = Math.floor(Math.random() * 5) + this.personsData.length;
        document.getElementById('totalPersons').textContent = newPersonCount;
        
        // Update recent searches
        const newSearches = Math.floor(Math.random() * 3) + 23;
        document.getElementById('recentSearches').textContent = newSearches;
    }

    showError(message) {
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
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }
}

// Global functions for HTML
function openPersonDetails(personId) {
    alert(`Opening details for ${personId}. In a real app, this would show detailed tracking information.`);
}

function openCamera(cameraId) {
    alert(`Opening ${cameraId} in focus mode. In a real app, this would show live feed.`);
}

function applyFilters() {
    window.dashboardManager?.applyFilters();
}

function blurAllCameras() {
    document.querySelectorAll('.camera-feed').forEach(feed => {
        feed.classList.add('blurred');
        feed.style.transform = 'scale(1)';
        feed.style.boxShadow = 'none';
    });
}

function playAllCameras() {
    document.querySelectorAll('.camera-feed').forEach(feed => {
        feed.classList.remove('blurred');
        feed.style.transform = 'scale(1)';
        feed.style.boxShadow = 'none';
    });
}

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', function() {
    window.dashboardManager = new DashboardManager();
});