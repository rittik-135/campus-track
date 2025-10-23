// Dashboard Interactivity
class DashboardManager {
    constructor() {
        this.currentFilters = {};
        this.personsData = [];
        this.camerasData = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadInitialData();
        this.startRealTimeUpdates();
    }

    setupEventListeners() {
        // Camera hover effects
        document.querySelectorAll('.camera-feed').forEach(feed => {
            feed.addEventListener('mouseenter', () => this.focusCamera(feed));
            feed.addEventListener('mouseleave', () => this.blurCamera(feed));
        });

        // Filter events
        document.getElementById('dateFrom')?.addEventListener('change', () => this.applyFilters());
        document.getElementById('dateTo')?.addEventListener('change', () => this.applyFilters());
        document.getElementById('cameraFilter')?.addEventListener('change', () => this.applyFilters());
        document.getElementById('durationFilter')?.addEventListener('change', () => this.applyFilters());
        document.getElementById('personIdFilter')?.addEventListener('input', () => this.applyFilters());

        // Camera control buttons
        document.querySelector('.blur-all-btn')?.addEventListener('click', () => this.blurAllCameras());
        document.querySelector('.play-all-btn')?.addEventListener('click', () => this.playAllCameras());
    }

    focusCamera(cameraElement) {
        cameraElement.classList.remove('blurred');
        cameraElement.style.transform = 'scale(1.05)';
        cameraElement.style.zIndex = '10';
    }

    blurCamera(cameraElement) {
        cameraElement.classList.add('blurred');
        cameraElement.style.transform = 'scale(1)';
        cameraElement.style.zIndex = '1';
    }

    blurAllCameras() {
        document.querySelectorAll('.camera-feed').forEach(feed => {
            feed.classList.add('blurred');
            feed.style.transform = 'scale(1)';
        });
    }

    playAllCameras() {
        document.querySelectorAll('.camera-feed').forEach(feed => {
            feed.classList.remove('blurred');
            feed.style.transform = 'scale(1)';
        });
    }

    applyFilters() {
        this.currentFilters = {
            dateFrom: document.getElementById('dateFrom')?.value,
            dateTo: document.getElementById('dateTo')?.value,
            camera: document.getElementById('cameraFilter')?.value,
            duration: document.getElementById('durationFilter')?.value,
            personId: document.getElementById('personIdFilter')?.value
        };

        this.filterPersons();
    }

    async loadInitialData() {
        try {
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
                    confidence: 95
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
                    confidence: 87
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
                    confidence: 92
                }
            ];

            this.updateStats();
            this.renderPersons();
        } catch (error) {
            console.error('Error loading initial data:', error);
        }
    }

    updateStats() {
        document.getElementById('totalPersons').textContent = this.personsData.length;
        document.getElementById('activeCameras').textContent = 4;
        document.getElementById('totalDuration').textContent = this.getTotalDuration();
        document.getElementById('recentSearches').textContent = 23;
    }

    getTotalDuration() {
        const totalSeconds = this.personsData.reduce((sum, person) => sum + person.duration, 0);
        const hours = Math.floor(totalSeconds / 3600);
        return `${hours}h`;
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

        if (this.currentFilters.camera) {
            filtered = filtered.filter(person => 
                person.camera === this.currentFilters.camera
            );
        }

        if (this.currentFilters.duration) {
            const durationSeconds = parseInt(this.currentFilters.duration) * 60;
            filtered = filtered.filter(person => 
                person.duration >= durationSeconds
            );
        }

        if (this.currentFilters.personId) {
            filtered = filtered.filter(person => 
                person.id.toLowerCase().includes(this.currentFilters.personId.toLowerCase())
            );
        }

        this.renderPersons(filtered);
    }

    renderPersons(persons = this.personsData) {
        const grid = document.getElementById('personsGrid');
        if (!grid) return;

        grid.innerHTML = persons.map(person => `
            <div class="person-card" onclick="openPersonDetails('${person.id}')">
                <img src="${person.image}" alt="${person.id}" class="person-image">
                <div class="person-info">
                    <h4>${person.id}</h4>
                    <div class="person-meta">
                        <span class="camera-tag">${person.camera}</span>
                        <span class="time-tag">${person.first_seen}</span>
                    </div>
                    <div class="person-stats">
                        <span><i class="fas fa-clock"></i> ${this.formatDuration(person.duration)}</span>
                        <span class="status ${person.status}">${person.status}</span>
                        <span class="cameras"><i class="fas fa-video"></i> ${person.total_cameras}</span>
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
            this.updateRealTimeStats();
        }, 5000);
    }

    updateRealTimeStats() {
        // Update person count in real-time
        const newPersonCount = Math.floor(Math.random() * 10) + this.personsData.length;
        document.getElementById('totalPersons').textContent = newPersonCount;
        
        // Update recent searches
        const newSearches = Math.floor(Math.random() * 5) + 23;
        document.getElementById('recentSearches').textContent = newSearches;
    }
}

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', function() {
    window.dashboardManager = new DashboardManager();
});

// Global functions for HTML
function openPersonDetails(personId) {
    alert(`Opening details for ${personId}. In a real app, this would show detailed tracking information.`);
}

function openCamera(cameraId) {
    alert(`Opening ${cameraId} in focus mode. In a real app, this would show live feed.`);
}