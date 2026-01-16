
// Modal instance management to prevent backdrop issues
let modalInstances = {};

function getModalInstance(modalId) {
    // If modal instance exists, return it
    if (modalInstances[modalId]) {
        return modalInstances[modalId];
    }
    
    // Otherwise create new instance and store it
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
        modalInstances[modalId] = new bootstrap.Modal(modalElement, {
            backdrop: 'static' // Prevent clicking outside to close
        });
        return modalInstances[modalId];
    }
    return null;
}

function cleanupModalBackdrops() {
    // Remove any remaining modal backdrops
    const backdrops = document.querySelectorAll('.modal-backdrop');
    backdrops.forEach(backdrop => {
        backdrop.remove();
    });
    
    // Remove modal-open class from body if no modals are open
    const openModals = document.querySelectorAll('.modal.show');
    if (openModals.length === 0) {
        document.body.classList.remove('modal-open');
        document.body.style.paddingRight = '';
    }
}

// Function to show a specific section and hide others
function showSection(sectionId) {
    // Hide all content sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.style.display = 'none';
    });
    
    // Show the requested section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.style.display = 'block';
        
        // Scroll to top of page
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Load data based on section
        if (sectionId === 'profile') {
            loadProfileData();
        } else if (sectionId === 'requests') {
            loadRequests();
        }
    }
}

// Function to load and display profile data
function loadProfileData() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    if (currentUser) {
        const fullName = `${currentUser.firstName} ${currentUser.lastName}`;
        const profileFullName = document.getElementById('profileFullName');
        const profileEmailDisplay = document.getElementById('profileEmailDisplay');
        const profileRoleDisplay = document.getElementById('profileRoleDisplay');
        
        if (profileFullName) {
            profileFullName.textContent = fullName;
        }
        if (profileEmailDisplay) {
            profileEmailDisplay.textContent = currentUser.email || '-';
        }
        if (profileRoleDisplay) {
            profileRoleDisplay.textContent = currentUser.role === 'admin' ? 'Admin' : 'User';
        }
    }
}

// Function to update the navbar with user information
function updateNavbar(user) {
    const usernameDisplay = document.getElementById('usernameDisplay');
    if (usernameDisplay) {
        usernameDisplay.textContent = `${user.firstName} ${user.lastName}`;
    }
}

// Page initialization for user page
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication state
    checkAuthState();
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    
    if (!currentUser) {
        // Redirect to login if not authenticated
        window.location.href = 'login.html';
        return;
    }
    
    // Redirect to appropriate page based on user role
    const isAdminPage = window.location.pathname.includes('admin.html');
    if (currentUser.role === 'admin' && !isAdminPage) {
        window.location.href = 'admin.html';
        return;
    } else if (currentUser.role !== 'admin' && isAdminPage) {
        window.location.href = 'user.html';
        return;
    }
    
    // Handle dropdown menu navigation (Profile, Requests, etc.)
    document.querySelectorAll('[data-section]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const sectionId = this.getAttribute('data-section');
            showSection(sectionId);
            
            // Close dropdown menu
            const dropdown = bootstrap.Dropdown.getInstance(document.getElementById('userDropdown'));
            if (dropdown) {
                dropdown.hide();
            }
        });
    });
    
    // Handle hash navigation
    if (window.location.hash) {
        const sectionId = window.location.hash.substring(1); // Remove the #
        showSection(sectionId);
    } else {
        // Show profile section by default
        showSection('profile');
    }
    
    // Listen for hash changes
    window.addEventListener('hashchange', function() {
        if (window.location.hash) {
            const sectionId = window.location.hash.substring(1);
            showSection(sectionId);
        }
    });
    
    // Load profile data when profile section is shown
    loadProfileData();
    
    // Initialize request modal functionality
    const openRequestModalBtn = document.getElementById('openRequestModal');
    if (openRequestModalBtn) {
        openRequestModalBtn.addEventListener('click', function() {
            const itemsContainer = document.getElementById('itemsContainer');
            // Clear any existing items
            itemsContainer.innerHTML = '';
            // Add one item field by default
            addItem();
            
            const requestModal = getModalInstance('requestModal');
            if (requestModal) {
                requestModal.show();
            }
        });
    }
});

// Request modal functionality for user page
document.addEventListener('DOMContentLoaded', function() {
    // Initialize request modal
    const requestModalElement = document.getElementById('requestModal');
    if (requestModalElement) {
        const requestModal = new bootstrap.Modal(requestModalElement);
        
        // Handle "Request New Item" button click
        const openRequestModalBtn = document.getElementById('openRequestModal');
        if (openRequestModalBtn) {
            openRequestModalBtn.addEventListener('click', function() {
                const itemsContainer = document.getElementById('itemsContainer');
                // Clear any existing items
                itemsContainer.innerHTML = '';
                // Add one item field by default
                addItem();
                requestModal.show();
            });
        }
    }
});

// Function to add item fields to the request form
function addItem() {
    const itemsContainer = document.getElementById('itemsContainer');
    const itemDiv = document.createElement('div');
    itemDiv.className = 'mb-2 d-flex';
    itemDiv.innerHTML = `
        <input type="text" class="form-control me-2" placeholder="Items">
        <button type="button" class="btn btn-sm btn-outline-danger" onclick="this.parentElement.remove()">Remove</button>
    `;
    itemsContainer.appendChild(itemDiv);
}

// Function to handle request form submission
function submitRequest() {
    const type = document.getElementById('requestType').value.trim();
    const itemsContainer = document.getElementById('itemsContainer');
    const itemInputs = itemsContainer.querySelectorAll('input[type="text"]');
    const items = Array.from(itemInputs).map(input => input.value.trim()).filter(val => val);
    
    if (!type) {
        alert('❌ Please enter a request type (e.g., Equipment, Software, Supplies)');
        return;
    }
    
    if (items.length === 0) {
        alert('❌ Please add at least one item and fill in the item name');
        return;
    }
    
    // Check if any item fields are empty
    let hasEmptyItems = false;
    itemInputs.forEach(input => {
        if (input.value.trim() === '') {
            hasEmptyItems = true;
        }
    });
    
    if (hasEmptyItems) {
        alert('❌ Please fill in all item names or remove empty item fields');
        return;
    }
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    if (!currentUser) {
        alert('❌ You must be logged in to submit a request');
        window.location.href = 'login.html';
        return;
    }
    
    const requests = JSON.parse(localStorage.getItem('requests') || '[]');
    const newRequest = {
        id: 'req_' + Date.now(),
        type,
        items,
        status: 'Pending',
        userEmail: currentUser.email,
        userName: `${currentUser.firstName} ${currentUser.lastName}`,
        date: new Date().toISOString()
    };
    
    requests.push(newRequest);
    localStorage.setItem('requests', JSON.stringify(requests));
    
    // Hide the modal
    const requestModal = getModalInstance('requestModal');
    if (requestModal) {
        requestModal.hide();
    }
    cleanupModalBackdrops();
    
    // Refresh the requests table
    loadRequests();
    
    alert('✅ Request submitted successfully! Your request is now pending approval.');
}

// Function to load and display user requests
function loadRequests() {
    const requests = JSON.parse(localStorage.getItem('requests') || '[]');
    const tbody = document.getElementById('requestsTableBody');
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    
    tbody.innerHTML = '';
    
    if (requests.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center">No requests found</td></tr>';
        return;
    }
    
    // Filter requests - users only see their own requests
    let requestsToShow = requests;
    
    if (currentUser && currentUser.role !== 'admin') {
        // Regular users only see their own requests
        requestsToShow = requests.filter(request => request.userEmail === currentUser.email);
    }
    
    if (requestsToShow.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center">No requests found</td></tr>';
        return;
    }
    
    requestsToShow.forEach((request) => {
        const row = document.createElement('tr');
        const requestId = request.id || '';
        const escapedId = requestId.replace(/'/g, "\'");
        const itemsText = Array.isArray(request.items) ? request.items.join(', ') : (request.items || '-');
        const status = request.status || 'Pending';
        const statusClass = status === 'Approved' ? 'success' : status === 'Pending' ? 'warning' : 'secondary';
        
        // Format date if available
        const requestDate = request.date ? new Date(request.date).toLocaleString() : 'Unknown';
        
        row.innerHTML = `
            <td>${request.type || '-'}</td>
            <td>${itemsText}</td>
            <td><span class="badge bg-${statusClass}">${status}</span></td>
            <td>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteRequest('${escapedId}')">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Function to delete a request
let requestIdToDelete = null;

function deleteRequest(requestId) {
    requestIdToDelete = requestId;
    const modal = getModalInstance('deleteRequestModal');
    if (modal) {
        modal.show();
    }
}

// Handle delete confirmation
document.addEventListener('DOMContentLoaded', function() {
    const confirmDeleteRequestBtn = document.getElementById('confirmDeleteRequestBtn');
    if (confirmDeleteRequestBtn) {
        confirmDeleteRequestBtn.addEventListener('click', function() {
            if (requestIdToDelete) {
                const requests = JSON.parse(localStorage.getItem('requests') || '[]');
                const requestIndex = requests.findIndex(r => r.id === requestIdToDelete);
                if (requestIndex !== -1) {
                    requests.splice(requestIndex, 1);
                    localStorage.setItem('requests', JSON.stringify(requests));
                    loadRequests();
                }
                requestIdToDelete = null;
            }
            const modalInstance = getModalInstance('deleteRequestModal');
            if (modalInstance) {
                modalInstance.hide();
            }
            cleanupModalBackdrops();
        });
    }
    
    // Initialize profile modal
    const editProfileBtn = document.getElementById('editProfileBtn');
    
    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', function () {
            // Pre-fill the form with current user data
            const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
            if (currentUser) {
                const nameInput = document.querySelector('#profileForm input[type="text"]');
                const emailInput = document.querySelector('#profileForm input[type="email"]');
                
                if (nameInput) {
                    nameInput.value = `${currentUser.firstName} ${currentUser.lastName}`;
                }
                if (emailInput) {
                    emailInput.value = currentUser.email || '';
                }
                // Password field should be empty for security
                const passwordInput = document.querySelector('#profileForm input[type="password"]');
                if (passwordInput) {
                    passwordInput.value = '';
                }
            }
            
            const editProfileModal = getModalInstance('editProfileModal');
            if (editProfileModal) {
                editProfileModal.show();
            }
        });
    }
    
    // Handle profile form submission
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', function(e) {
            e.preventDefault(); 
            
            const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
            if (!currentUser) {
                alert('❌ You must be logged in to edit your profile');
                return;
            }
            
            const nameInput = this.querySelector('input[type="text"]');
            const emailInput = this.querySelector('input[type="email"]');
            const passwordInput = this.querySelector('input[type="password"]');
            
            const fullName = nameInput ? nameInput.value.trim() : '';
            const email = emailInput ? emailInput.value.trim() : '';
            const password = passwordInput ? passwordInput.value : '';
            
            // Validate inputs
            if (!fullName) {
                alert('❌ Please enter your name');
                return;
            }
            
            if (!email) {
                alert('❌ Please enter your email');
                return;
            }
            
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                alert('❌ Please enter a valid email address');
                return;
            }
            
            // Parse name into first and last name
            const nameParts = fullName.split(' ');
            const firstName = nameParts[0] || '';
            const lastName = nameParts.slice(1).join(' ') || '';
            
            // Update user data
            const updatedUser = {
                ...currentUser,
                firstName: firstName,
                lastName: lastName,
                email: email
            };
            
            // Update password if provided
            if (password) {
                if (password.length < 6) {
                    alert('❌ Password must be at least 6 characters long');
                    return;
                }
                updatedUser.password = password;
            }
            
            // Update users array in localStorage
            let users = JSON.parse(localStorage.getItem('users') || '[]');
            const userIndex = users.findIndex(u => u.email === currentUser.email);
            
            if (userIndex !== -1) {
                users[userIndex] = updatedUser;
                localStorage.setItem('users', JSON.stringify(users));
            }
            
            // Update current user in localStorage
            localStorage.setItem('currentUser', JSON.stringify(updatedUser));
            
            // Update the UI
            updateNavbar(updatedUser);
            loadProfileData();
            
            editProfileModal.hide();
            cleanupModalBackdrops();
            alert('✅ Profile updated successfully!');
        });
    }
});