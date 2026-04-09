// ========================================
// HYDROFIT - COMPLETE APPLICATION (FIXED)
// ========================================

// Global variables
let currentUser = null;
let currentTab = "dashboard";
let isTeacherMode = false;
let slideInterval = null;

// ========================================
// INITIALIZATION
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    console.log("HYDROFIT Initializing...");
    
    // Check if teacher is logged in
    if (isTeacherLoggedIn()) {
        isTeacherMode = true;
        showTeacherApp();
    }
    // Check if user is logged in
    else if (isLoggedIn()) {
        currentUser = getCurrentUser();
        showApp();
    } else {
        showLoginModal();
    }
    
    // Setup event listeners
    setupEventListeners();
});

function setupEventListeners() {
    // Login button
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        loginBtn.addEventListener('click', handleLogin);
    }
    
    // Register button
    const registerBtn = document.getElementById('registerBtn');
    if (registerBtn) {
        registerBtn.addEventListener('click', handleRegister);
    }
    
    // Switch to Register
    const showRegisterLink = document.getElementById('showRegister');
    if (showRegisterLink) {
        showRegisterLink.addEventListener('click', function(e) {
            e.preventDefault();
            showRegisterModal();
        });
    }
    
    // Switch to Login
    const showLoginLink = document.getElementById('showLogin');
    if (showLoginLink) {
        showLoginLink.addEventListener('click', function(e) {
            e.preventDefault();
            showLoginModal();
        });
    }
    
    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            document.querySelector('.sidebar').classList.toggle('open');
        });
    }
    
    // Navigation buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const tab = this.getAttribute('data-tab');
            switchTab(tab);
            if (window.innerWidth <= 768) {
                document.querySelector('.sidebar').classList.remove('open');
            }
        });
    });
    
    // Close profile modal
    const closeProfileBtn = document.getElementById('closeProfileModal');
    if (closeProfileBtn) {
        closeProfileBtn.addEventListener('click', function() {
            document.getElementById('profileModal').style.display = 'none';
        });
    }
    
    // Click outside modal to close
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
    
    // Enter key press for login
    const loginPassword = document.getElementById('loginPassword');
    if (loginPassword) {
        loginPassword.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                handleLogin();
            }
        });
    }
}

// ========================================
// MODAL FUNCTIONS
// ========================================

function showLoginModal() {
    document.getElementById('loginModal').style.display = 'flex';
    document.getElementById('registerModal').style.display = 'none';
    document.getElementById('loginSchoolId').value = '';
    document.getElementById('loginPassword').value = '';
}

function showRegisterModal() {
    document.getElementById('loginModal').style.display = 'none';
    document.getElementById('registerModal').style.display = 'flex';
    
    document.getElementById('regFullName').value = '';
    document.getElementById('regSchoolId').value = '';
    document.getElementById('regSubject').value = '';
    document.getElementById('regProgram').value = '';
    document.getElementById('regYearLevel').value = '';
    document.getElementById('regSection').value = '';
    document.getElementById('regPassword').value = '';
    document.getElementById('regConfirmPassword').value = '';
}

function showApp() {
    document.querySelector('.app-container').style.display = 'flex';
    document.getElementById('loginModal').style.display = 'none';
    document.getElementById('registerModal').style.display = 'none';
    
    // Hide teacher-only button
    document.querySelectorAll('.teacher-only').forEach(btn => {
        btn.style.display = 'none';
    });
    
    switchTab('dashboard');
    updateUserDisplay();
}

function showTeacherApp() {
    document.querySelector('.app-container').style.display = 'flex';
    document.getElementById('loginModal').style.display = 'none';
    document.getElementById('registerModal').style.display = 'none';
    
    // Show teacher-only button
    document.querySelectorAll('.teacher-only').forEach(btn => {
        btn.style.display = 'flex';
    });
    
    isTeacherMode = true;
    switchTab('teacher-dashboard');
}

// ========================================
// AUTHENTICATION HANDLERS
// ========================================

async function handleLogin() {
    const schoolId = document.getElementById('loginSchoolId').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    // Check for teacher login first (built-in account)
    if (schoolId === "Prof.David" && password === "instructor") {
        const result = loginTeacher(schoolId, password);
        if (result.success) {
            showToast(`Welcome Professor ${result.teacher.name}!`, 'success');
            showTeacherApp();
        }
        return;
    }
    
    if (!schoolId || !password) {
        showToast('Please enter School ID and Password', 'error');
        return;
    }
    
    const loginBtn = document.getElementById('loginBtn');
    const originalText = loginBtn.innerHTML;
    loginBtn.disabled = true;
    loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
    
    const result = await loginUser(schoolId, password);
    
    if (result.success) {
        currentUser = result.user;
        showToast(`Welcome back, ${currentUser.fullName}!`, 'success');
        showApp();
    } else {
        showToast(result.message, 'error');
        loginBtn.disabled = false;
        loginBtn.innerHTML = originalText;
    }
}

async function handleRegister() {
    const userData = {
        fullName: document.getElementById('regFullName').value.trim(),
        schoolId: document.getElementById('regSchoolId').value.trim(),
        subject: document.getElementById('regSubject').value.trim(),
        program: document.getElementById('regProgram').value,
        yearLevel: document.getElementById('regYearLevel').value,
        section: document.getElementById('regSection').value.trim(),
        password: document.getElementById('regPassword').value,
        confirmPassword: document.getElementById('regConfirmPassword').value
    };
    
    if (!userData.fullName || !userData.schoolId || !userData.password) {
        showToast('Please fill in all required fields', 'error');
        return;
    }
    
    if (userData.password !== userData.confirmPassword) {
        showToast('Passwords do not match', 'error');
        return;
    }
    
    if (userData.password.length < 4) {
        showToast('Password must be at least 4 characters', 'error');
        return;
    }
    
    if (!userData.program) {
        showToast('Please select your program', 'error');
        return;
    }
    
    if (!userData.yearLevel) {
        showToast('Please select your year level', 'error');
        return;
    }
    
    const registerBtn = document.getElementById('registerBtn');
    const originalText = registerBtn.innerHTML;
    registerBtn.disabled = true;
    registerBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating account...';
    
    const result = await registerUser(userData);
    
    if (result.success) {
        showToast('Account created successfully! Please login.', 'success');
        showLoginModal();
    } else {
        showToast(result.message, 'error');
        registerBtn.disabled = false;
        registerBtn.innerHTML = originalText;
    }
}

function handleLogout() {
    if (isTeacherMode) {
        logoutTeacher();
        isTeacherMode = false;
    } else {
        logoutUser();
        currentUser = null;
    }
    
    document.querySelector('.sidebar').classList.remove('open');
    showLoginModal();
    showToast('Logged out successfully', 'success');
}

// ========================================
// UI FUNCTIONS
// ========================================

function switchTab(tabName) {
    console.log("Switching to tab:", tabName);
    currentTab = tabName;
    
    // Update active nav button
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-tab') === tabName) {
            btn.classList.add('active');
        }
    });
    
    // Update title
    const titles = {
        dashboard: 'HYDROFIT Dashboard',
        profile: 'My Profile',
        activity: 'Activities',
        movement: 'Movement Library',
        'ai-assist': 'AI Exercise Guide',
        scheduler: 'Workout Scheduler',
        timer: 'Exercise Timer',
        warmup: 'Warmup Generator',
        injury: 'Injury Prevention Guide',
        attendance: 'Attendance',
        goals: 'Goal Planner',
        bodyparts: 'Body Focus',
        calorie: 'Calorie Tracker',
        bmi: 'BMI Tracker',
        recovery: 'Recovery & Rest',
        bodytype: 'Body Type Analysis',
        'teacher-dashboard': 'Teacher Dashboard'
    };
    
    document.getElementById('active-title').innerText = titles[tabName] || 'HYDROFIT';
    
    // Load tab content
    loadTabContent(tabName);
}

async function loadTabContent(tabName) {
    const container = document.getElementById('tab-content');
    container.innerHTML = '<div class="loading-placeholder"><i class="fas fa-spinner fa-spin"></i> Loading...</div>';
    
    if (isTeacherMode && tabName === 'teacher-dashboard') {
        await loadTeacherDashboard();
    } else if (tabName === 'dashboard') {
        await loadDashboard();
    } else if (tabName === 'profile') {
        await loadProfile();
    } else if (tabName === 'activity') {
        await loadActivitiesForStudents();
    } else if (tabName === 'attendance') {
        await loadAttendanceTracker();
    } else {
        await loadGenericTab(tabName);
    }
}

// ========================================
// DASHBOARD WITH SLIDESHOW (No QR Code)
// ========================================

async function loadDashboard() {
    const container = document.getElementById('tab-content');
    
    const slideshowHtml = `
        <div class="slideshow-wrapper">
            <div class="slideshow-container" id="slideshowContainer">
                <div class="slideshow-overlay">
                    <div class="school-badge">
                        <img src="https://ik.imagekit.io/0sf7uub8b/HydroFit/images%20(4).jpg?updatedAt=1775655891511" alt="MinSU" class="minsu-logo">
                        <div class="school-text">
                            <strong>Mindoro State University</strong>
                            <span>Calapan City Campus</span>
                        </div>
                    </div>
                </div>
                <div class="slide" style="background-image: url('https://ik.imagekit.io/0sf7uub8b/HydroFit/slides_1.jpg?updatedAt=1775652185255'); background-size: cover; background-position: center;"></div>
                <div class="slide" style="background-image: url('https://ik.imagekit.io/0sf7uub8b/HydroFit/slides_2.jpg?updatedAt=1775652283140'); background-size: cover; background-position: center;"></div>
                <div class="slide" style="background-image: url('https://ik.imagekit.io/0sf7uub8b/HydroFit/slides_3.jpg?updatedAt=1775652127029'); background-size: cover; background-position: center;"></div>
            </div>
            <div class="slide-dots" id="slideDots"></div>
        </div>
    `;
    
    const statsHtml = `
        <div class="card-grid">
            <div class="card">
                <h3><i class="fas fa-user-graduate"></i> Student Info</h3>
                <div style="font-size: 1.2rem; font-weight: 600;">${escapeHtml(currentUser.fullName)}</div>
                <p>${currentUser.program} - Year ${currentUser.yearLevel}</p>
                <p>Section: ${currentUser.section}</p>
            </div>
            
            <div class="card">
                <h3><i class="fas fa-calendar-check"></i> Attendance</h3>
                <div style="font-size: 2rem; font-weight: 800;">${currentUser.attendanceCount || 0}</div>
                <p>Total classes attended</p>
                <button class="btn btn-sm mt-4" onclick="switchTab('attendance')">View Details →</button>
            </div>
            
            <div class="card">
                <h3><i class="fas fa-tasks"></i> Activities</h3>
                <p>Check your pending tasks</p>
                <button class="btn btn-sm mt-4" onclick="switchTab('activity')">View Activities →</button>
            </div>
        </div>
    `;
    
    container.innerHTML = slideshowHtml + statsHtml;
    
    // Initialize slideshow
    initSlideshow();
}

function initSlideshow() {
    let slideIndex = 0;
    const slides = document.querySelectorAll('.slide');
    const dotsContainer = document.querySelector('.slide-dots');
    
    if (!slides.length) return;
    
    // Clear existing dots
    if (dotsContainer) {
        dotsContainer.innerHTML = '';
        
        // Create dots
        slides.forEach((_, i) => {
            const dot = document.createElement('div');
            dot.className = 'dot' + (i === 0 ? ' active' : '');
            dot.onclick = () => showSlide(i);
            dotsContainer.appendChild(dot);
        });
    }
    
    function showSlide(n) {
        slides.forEach(slide => slide.classList.remove('active'));
        if (dotsContainer) {
            document.querySelectorAll('.dot').forEach(dot => dot.classList.remove('active'));
        }
        slideIndex = n;
        if (slides[slideIndex]) slides[slideIndex].classList.add('active');
        if (dotsContainer && document.querySelectorAll('.dot')[slideIndex]) {
            document.querySelectorAll('.dot')[slideIndex].classList.add('active');
        }
    }
    
    function nextSlide() {
        slideIndex = (slideIndex + 1) % slides.length;
        showSlide(slideIndex);
    }
    
    // Show first slide
    if (slides[0]) slides[0].classList.add('active');
    
    // Auto-advance every 5 seconds
    if (slideInterval) clearInterval(slideInterval);
    slideInterval = setInterval(nextSlide, 5000);
}

// ========================================
// PROFILE
// ========================================

async function loadProfile() {
    const container = document.getElementById('tab-content');
    
    const profileHtml = `
        <div class="profile-card">
            <div class="profile-avatar">
                <i class="fas fa-user-circle"></i>
            </div>
            <h2>${escapeHtml(currentUser.fullName)}</h2>
            <p>${currentUser.program} - Year ${currentUser.yearLevel}</p>
            <p>Section: ${currentUser.section} | Subject: ${currentUser.subject}</p>
        </div>
        
        <div class="profile-info-grid">
            <div class="info-item">
                <label>School ID</label>
                <p>${currentUser.schoolId}</p>
            </div>
            <div class="info-item">
                <label>Program</label>
                <p>${currentUser.program}</p>
            </div>
            <div class="info-item">
                <label>Year Level</label>
                <p>${currentUser.yearLevel}</p>
            </div>
            <div class="info-item">
                <label>Section</label>
                <p>${currentUser.section}</p>
            </div>
            <div class="info-item">
                <label>Subject</label>
                <p>${currentUser.subject}</p>
            </div>
            <div class="info-item">
                <label>Total Attendance</label>
                <p>${currentUser.attendanceCount || 0}</p>
            </div>
        </div>
    `;
    
    container.innerHTML = profileHtml;
}

// ========================================
// ACTIVITIES FOR STUDENTS (from professor)
// ========================================

async function loadActivitiesForStudents() {
    const container = document.getElementById('tab-content');
    const activities = await getActivities();
    
    if (activities.length === 0) {
        container.innerHTML = `
            <div class="card">
                <h3><i class="fas fa-tasks"></i> Activities</h3>
                <p style="padding: 40px; text-align: center;">No activities posted yet. Check back later!</p>
            </div>
        `;
        return;
    }
    
    let activitiesHtml = `
        <div class="card">
            <h3><i class="fas fa-tasks"></i> Posted Activities & Assignments</h3>
            <p style="margin-bottom: 20px; color: var(--primary);">Complete these tasks on time</p>
    `;
    
    activities.forEach(activity => {
        activitiesHtml += `
            <div style="padding: 15px; border-bottom: 1px solid var(--gray);">
                <div class="flex-between">
                    <strong style="font-size: 1.1rem;">${escapeHtml(activity.title)}</strong>
                    <small style="color: var(--danger);">Due: ${activity.dueDate || 'No due date'}</small>
                </div>
                <p style="margin-top: 10px;">${escapeHtml(activity.description)}</p>
                <small style="color: var(--primary);">Posted: ${new Date(activity.timestamp).toLocaleDateString()}</small>
            </div>
        `;
    });
    
    activitiesHtml += `</div>`;
    container.innerHTML = activitiesHtml;
}

// ========================================
// ATTENDANCE TRACKER (View only, no record button)
// ========================================

async function loadAttendanceTracker() {
    const container = document.getElementById('tab-content');
    
    const attendanceHtml = `
        <div class="card">
            <h3><i class="fas fa-user-check"></i> My Attendance Record</h3>
            <div style="text-align: center; padding: 20px;">
                <div style="font-size: 4rem; font-weight: 800;">${currentUser.attendanceCount || 0}</div>
                <p>Total Classes Attended</p>
                <p class="mt-4" style="font-size: 0.9rem; color: var(--primary);">
                    <i class="fas fa-info-circle"></i> Attendance is recorded by scanning your QR code
                </p>
            </div>
        </div>
        <div class="card mt-4">
            <h3><i class="fas fa-chart-line"></i> Attendance Progress</h3>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${Math.min((currentUser.attendanceCount / 20) * 100, 100)}%"></div>
            </div>
            <p class="mt-4">Target: 20 attendances per semester</p>
            <p class="mt-4">🎯 ${20 - (currentUser.attendanceCount || 0)} more to reach target!</p>
        </div>
    `;
    
    container.innerHTML = attendanceHtml;
}

// ========================================
// TEACHER DASHBOARD (No delay on tab switching)
// ========================================

async function loadTeacherDashboard() {
    const container = document.getElementById('tab-content');
    const teacher = getCurrentTeacher();
    
    // Load all data in parallel for faster display
    const [students, activities, handouts, announcements] = await Promise.all([
        getAllStudents(),
        getActivities(),
        getHandouts(),
        getAnnouncements()
    ]);
    
    const dashboardHtml = `
        <div class="profile-card" style="margin-bottom: 30px;">
            <div class="profile-avatar">
                <i class="fas fa-chalkboard-teacher"></i>
            </div>
            <h2>${teacher.name}</h2>
            <p>Professor of ${teacher.subject}</p>
            <p>${teacher.program}</p>
        </div>
        
        <div class="teacher-tabs" style="display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap;">
            <button class="btn teacher-tab-btn active" data-teacher-tab="attendance">📋 QR Scanner & Attendance</button>
            <button class="btn btn-secondary teacher-tab-btn" data-teacher-tab="activities">📝 Activities</button>
            <button class="btn btn-secondary teacher-tab-btn" data-teacher-tab="handouts">📚 Handouts</button>
            <button class="btn btn-secondary teacher-tab-btn" data-teacher-tab="announcements">📢 Announcements</button>
        </div>
        
        <div id="teacherAttendanceTab" class="teacher-tab-content active">
            <div class="card">
                <h3><i class="fas fa-qrcode"></i> QR Code Scanner for Attendance</h3>
                <div style="text-align: center; padding: 20px;">
                    <div id="qr-reader" style="width: 100%; max-width: 300px; margin: 0 auto;"></div>
                    <div id="qr-result" style="margin-top: 20px;"></div>
                    <button class="btn mt-4" id="startScannerBtn">Start Scanner</button>
                    <button class="btn btn-secondary mt-4" id="stopScannerBtn" style="display: none;">Stop Scanner</button>
                    <p class="mt-4" style="font-size: 0.8rem; color: var(--primary);">
                        <i class="fas fa-info-circle"></i> Students must show their QR code to record attendance
                    </p>
                </div>
            </div>
            
            <div class="card mt-4">
                <h3><i class="fas fa-users"></i> Student Attendance Records</h3>
                ${renderStudentAttendanceTable(students)}
            </div>
        </div>
        
        <div id="teacherActivitiesTab" class="teacher-tab-content" style="display: none;">
            <div class="card">
                <h3><i class="fas fa-plus-circle"></i> Publish Activity/Assignment</h3>
                <div class="form-group">
                    <label>Activity Title</label>
                    <input type="text" id="activityTitle" class="modal-input" placeholder="Enter activity title">
                </div>
                <div class="form-group">
                    <label>Description</label>
                    <textarea id="activityDesc" class="modal-input" rows="3" placeholder="Enter activity description"></textarea>
                </div>
                <div class="form-group">
                    <label>Due Date</label>
                    <input type="date" id="activityDueDate" class="modal-input">
                </div>
                <button class="btn" id="publishActivityBtn">Publish Activity</button>
            </div>
            
            <div class="card mt-4">
                <h3><i class="fas fa-list"></i> Published Activities</h3>
                <div id="activitiesList">${renderActivitiesList(activities)}</div>
            </div>
        </div>
        
        <div id="teacherHandoutsTab" class="teacher-tab-content" style="display: none;">
            <div class="card">
                <h3><i class="fas fa-upload"></i> Upload Learning Handout</h3>
                <div class="form-group">
                    <label>Handout Title</label>
                    <input type="text" id="handoutTitle" class="modal-input" placeholder="Enter handout title">
                </div>
                <div class="form-group">
                    <label>Description</label>
                    <textarea id="handoutDesc" class="modal-input" rows="3" placeholder="Enter handout description"></textarea>
                </div>
                <div class="form-group">
                    <label>File URL (Google Drive or Direct Link)</label>
                    <input type="url" id="handoutUrl" class="modal-input" placeholder="https://...">
                </div>
                <button class="btn" id="uploadHandoutBtn">Upload Handout</button>
            </div>
            
            <div class="card mt-4">
                <h3><i class="fas fa-download"></i> Available Handouts</h3>
                <div id="handoutsList">${renderHandoutsList(handouts)}</div>
            </div>
        </div>
        
        <div id="teacherAnnouncementsTab" class="teacher-tab-content" style="display: none;">
            <div class="card">
                <h3><i class="fas fa-bullhorn"></i> Make Announcement</h3>
                <div class="form-group">
                    <label>Announcement Title</label>
                    <input type="text" id="announcementTitle" class="modal-input" placeholder="Enter announcement title">
                </div>
                <div class="form-group">
                    <label>Content</label>
                    <textarea id="announcementContent" class="modal-input" rows="4" placeholder="Enter announcement content"></textarea>
                </div>
                <button class="btn" id="publishAnnouncementBtn">Publish Announcement</button>
            </div>
            
            <div class="card mt-4">
                <h3><i class="fas fa-history"></i> Previous Announcements</h3>
                <div id="announcementsList">${renderAnnouncementsList(announcements)}</div>
            </div>
        </div>
    `;
    
    container.innerHTML = dashboardHtml;
    
    // Setup QR Scanner
    setupQRScanner();
    
    // Setup buttons with direct event listeners (no delay)
    const publishBtn = document.getElementById('publishActivityBtn');
    if (publishBtn) {
        publishBtn.onclick = async () => {
            const title = document.getElementById('activityTitle').value.trim();
            const description = document.getElementById('activityDesc').value.trim();
            const dueDate = document.getElementById('activityDueDate').value;
            
            if (!title) {
                showToast('Please enter activity title', 'error');
                return;
            }
            
            const result = await publishActivity({ title, description, dueDate });
            if (result.success) {
                showToast('Activity published successfully!', 'success');
                document.getElementById('activityTitle').value = '';
                document.getElementById('activityDesc').value = '';
                document.getElementById('activityDueDate').value = '';
                // Refresh activities list
                const newActivities = await getActivities();
                document.getElementById('activitiesList').innerHTML = renderActivitiesList(newActivities);
            } else {
                showToast(result.message || 'Failed to publish activity', 'error');
            }
        };
    }
    
    const uploadBtn = document.getElementById('uploadHandoutBtn');
    if (uploadBtn) {
        uploadBtn.onclick = async () => {
            const title = document.getElementById('handoutTitle').value.trim();
            const description = document.getElementById('handoutDesc').value.trim();
            const fileUrl = document.getElementById('handoutUrl').value.trim();
            
            if (!title || !fileUrl) {
                showToast('Please enter title and file URL', 'error');
                return;
            }
            
            const result = await uploadHandout({ title, description, fileUrl });
            if (result.success) {
                showToast('Handout uploaded successfully!', 'success');
                document.getElementById('handoutTitle').value = '';
                document.getElementById('handoutDesc').value = '';
                document.getElementById('handoutUrl').value = '';
                const newHandouts = await getHandouts();
                document.getElementById('handoutsList').innerHTML = renderHandoutsList(newHandouts);
            } else {
                showToast(result.message || 'Failed to upload handout', 'error');
            }
        };
    }
    
    const announceBtn = document.getElementById('publishAnnouncementBtn');
    if (announceBtn) {
        announceBtn.onclick = async () => {
            const title = document.getElementById('announcementTitle').value.trim();
            const content = document.getElementById('announcementContent').value.trim();
            
            if (!title || !content) {
                showToast('Please enter title and content', 'error');
                return;
            }
            
            const result = await publishAnnouncement({ title, content });
            if (result.success) {
                showToast('Announcement published successfully!', 'success');
                document.getElementById('announcementTitle').value = '';
                document.getElementById('announcementContent').value = '';
                const newAnnouncements = await getAnnouncements();
                document.getElementById('announcementsList').innerHTML = renderAnnouncementsList(newAnnouncements);
            } else {
                showToast(result.message || 'Failed to publish announcement', 'error');
            }
        };
    }
    
    // Setup teacher tab switching (instant, no delay)
    document.querySelectorAll('.teacher-tab-btn').forEach(btn => {
        btn.onclick = function() {
            const tab = this.getAttribute('data-teacher-tab');
            document.querySelectorAll('.teacher-tab-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            document.querySelectorAll('.teacher-tab-content').forEach(content => {
                content.style.display = 'none';
            });
            
            document.getElementById(`teacher${tab.charAt(0).toUpperCase() + tab.slice(1)}Tab`).style.display = 'block';
        };
    });
}

function renderStudentAttendanceTable(students) {
    // Extract surname from full name (last name)
    const studentsWithSurname = students.map(student => {
        let surname = student.fullName;
        // Check if name has comma (Last, First format)
        if (student.fullName.includes(',')) {
            surname = student.fullName.split(',')[0].trim();
        } else {
            // Try to get last word as surname
            const nameParts = student.fullName.trim().split(' ');
            surname = nameParts[nameParts.length - 1];
        }
        return { ...student, surname: surname.toLowerCase(), originalSurname: surname };
    });
    
    // Sort alphabetically by surname
    studentsWithSurname.sort((a, b) => a.surname.localeCompare(b.surname));
    
    // Group by program
    const programs = {};
    studentsWithSurname.forEach(student => {
        if (!programs[student.program]) {
            programs[student.program] = {};
        }
        if (!programs[student.program][student.yearLevel]) {
            programs[student.program][student.yearLevel] = {};
        }
        if (!programs[student.program][student.yearLevel][student.section]) {
            programs[student.program][student.yearLevel][student.section] = [];
        }
        programs[student.program][student.yearLevel][student.section].push(student);
    });
    
    let html = '';
    for (const [program, years] of Object.entries(programs)) {
        html += `<h4 style="margin-top: 20px; color: var(--primary);">${program}</h4>`;
        for (const [year, sections] of Object.entries(years)) {
            html += `<h5 style="margin-top: 15px; margin-left: 10px;">Year ${year}</h5>`;
            for (const [section, studentsList] of Object.entries(sections)) {
                html += `<h6 style="margin-top: 10px; margin-left: 20px; color: var(--dark);">Section: ${section}</h6>`;
                html += `<div style="overflow-x: auto; margin-left: 30px; margin-bottom: 20px;">
                    <table class="ranking-table">
                        <thead>
                            <tr><th>Student Name</th><th>School ID</th><th>Attendance Count</th></tr>
                        </thead>
                        <tbody>`;
                studentsList.forEach(s => {
                    html += `<tr>
                        <td>${escapeHtml(s.originalSurname)}, ${escapeHtml(s.fullName.split(',')[1] || '')}</td>
                        <td>${s.schoolId}</td>
                        <td><strong>${s.attendanceCount}</strong> classes</td>
                    </tr>`;
                });
                html += `</tbody>
                    </table>
                </div>`;
            }
        }
    }
    
    return html || '<p>No students found.</p>';
}

function renderActivitiesList(activities) {
    if (activities.length === 0) return '<p>No activities published yet.</p>';
    
    return activities.map(act => `
        <div style="padding: 15px; border-bottom: 1px solid var(--gray);">
            <strong>${escapeHtml(act.title)}</strong>
            <small style="color: var(--primary); display: block;">Due: ${act.dueDate || 'No due date'}</small>
            <p style="margin-top: 8px;">${escapeHtml(act.description)}</p>
            <small>Posted: ${new Date(act.timestamp).toLocaleDateString()}</small>
        </div>
    `).join('');
}

function renderHandoutsList(handouts) {
    if (handouts.length === 0) return '<p>No handouts uploaded yet.</p>';
    
    return handouts.map(h => `
        <div style="padding: 15px; border-bottom: 1px solid var(--gray);">
            <strong>${escapeHtml(h.title)}</strong>
            <p>${escapeHtml(h.description)}</p>
            <a href="${h.fileUrl}" target="_blank" class="btn btn-sm">Download Handout →</a>
            <small style="display: block; margin-top: 5px;">Uploaded: ${new Date(h.timestamp).toLocaleDateString()}</small>
        </div>
    `).join('');
}

function renderAnnouncementsList(announcements) {
    if (announcements.length === 0) return '<p>No announcements yet.</p>';
    
    return announcements.map(a => `
        <div style="padding: 15px; border-bottom: 1px solid var(--gray);">
            <strong>${escapeHtml(a.title)}</strong>
            <small style="color: var(--primary); display: block;">Posted: ${new Date(a.timestamp).toLocaleDateString()}</small>
            <p style="margin-top: 8px;">${escapeHtml(a.content)}</p>
        </div>
    `).join('');
}

// ========================================
// QR SCANNER FOR ATTENDANCE
// ========================================

function setupQRScanner() {
    let html5QrCode = null;
    const startBtn = document.getElementById('startScannerBtn');
    const stopBtn = document.getElementById('stopScannerBtn');
    const resultDiv = document.getElementById('qr-result');
    
    if (!startBtn) return;
    
    startBtn.onclick = async () => {
        if (html5QrCode) {
            await html5QrCode.stop();
        }
        
        html5QrCode = new Html5Qrcode("qr-reader");
        
        try {
            const devices = await Html5Qrcode.getCameras();
            if (devices && devices.length) {
                const cameraId = devices[0].id;
                await html5QrCode.start(
                    cameraId,
                    {
                        fps: 10,
                        qrbox: { width: 250, height: 250 }
                    },
                    async (decodedText) => {
                        // Process QR code for attendance
                        try {
                            const qrData = JSON.parse(decodedText);
                            if (qrData.schoolId && qrData.name) {
                                // Record attendance
                                const result = await recordAttendance(qrData.schoolId);
                                if (result.success) {
                                    resultDiv.innerHTML = `<div style="color: green; padding: 10px; background: #d4edda; border-radius: 8px;">
                                        ✅ Attendance recorded for ${escapeHtml(qrData.name)}!<br>
                                        Total: ${result.attendanceCount} classes
                                    </div>`;
                                    showToast(`Attendance recorded for ${qrData.name}!`, 'success');
                                    
                                    // Refresh attendance table
                                    const students = await getAllStudents();
                                    const attendanceTable = document.querySelector('#teacherAttendanceTab .card.mt-4');
                                    if (attendanceTable) {
                                        attendanceTable.innerHTML = `
                                            <h3><i class="fas fa-users"></i> Student Attendance Records</h3>
                                            ${renderStudentAttendanceTable(students)}
                                        `;
                                    }
                                } else {
                                    resultDiv.innerHTML = `<div style="color: red; padding: 10px; background: #f8d7da; border-radius: 8px;">
                                        ❌ ${result.message}
                                    </div>`;
                                    showToast(result.message, 'error');
                                }
                            } else {
                                resultDiv.innerHTML = `<div style="color: red; padding: 10px; background: #f8d7da; border-radius: 8px;">
                                    ❌ Invalid QR code format
                                </div>`;
                            }
                        } catch (e) {
                            resultDiv.innerHTML = `<div style="color: red; padding: 10px; background: #f8d7da; border-radius: 8px;">
                                ❌ Invalid QR code
                            </div>`;
                        }
                        
                        // Auto stop after successful scan
                        setTimeout(async () => {
                            if (html5QrCode) {
                                await html5QrCode.stop();
                                html5QrCode = null;
                                startBtn.style.display = 'inline-block';
                                stopBtn.style.display = 'none';
                            }
                        }, 3000);
                    },
                    (error) => {
                        console.log("Scan error:", error);
                    }
                );
                startBtn.style.display = 'none';
                stopBtn.style.display = 'inline-block';
            } else {
                resultDiv.innerHTML = `<div style="color: red;">❌ No cameras found</div>`;
            }
        } catch (err) {
            resultDiv.innerHTML = `<div style="color: red;">❌ Camera error: ${err}</div>`;
        }
    };
    
    stopBtn.onclick = async () => {
        if (html5QrCode) {
            await html5QrCode.stop();
            html5QrCode = null;
            startBtn.style.display = 'inline-block';
            stopBtn.style.display = 'none';
            resultDiv.innerHTML = '';
        }
    };
}

// ========================================
// GENERIC TAB
// ========================================

async function loadGenericTab(tabName) {
    const container = document.getElementById('tab-content');
    
    const titles = {
        movement: 'Movement Library',
        'ai-assist': 'AI Exercise Guide',
        scheduler: 'Workout Scheduler',
        timer: 'Exercise Timer',
        warmup: 'Warmup Generator',
        injury: 'Injury Prevention Guide',
        goals: 'Goal Planner',
        bodyparts: 'Body Focus',
        calorie: 'Calorie Tracker',
        bmi: 'BMI Tracker',
        recovery: 'Recovery & Rest',
        bodytype: 'Body Type Analysis'
    };
    
    container.innerHTML = `
        <div class="card">
            <h3><i class="fas fa-construction"></i> Coming Soon</h3>
            <p style="padding: 40px; text-align: center;">The <strong>${titles[tabName]}</strong> feature is currently under development.</p>
            <p style="text-align: center;">Stay tuned for updates!</p>
            <div style="text-align: center; margin-top: 20px;">
                <i class="fas fa-water" style="font-size: 3rem; color: var(--primary);"></i>
            </div>
        </div>
    `;
}

// ========================================
// HELPER FUNCTIONS
// ========================================

function updateUserDisplay() {
    localStorage.setItem("hydrofit_user", JSON.stringify(currentUser));
}

function showToast(message, type = 'info') {
    const existingToast = document.querySelector('.toast-notification');
    if (existingToast) {
        existingToast.remove();
    }
    
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
        <span>${message}</span>
    `;
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: ${type === 'success' ? '#00b894' : type === 'error' ? '#d63031' : '#00b4d8'};
        color: white;
        padding: 12px 20px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        gap: 10px;
        z-index: 9999;
        animation: slideInRight 0.3s ease;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        font-size: 0.9rem;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// Make functions global for HTML onclick handlers
window.switchTab = switchTab;
window.showToast = showToast;