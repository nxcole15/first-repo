
function showSection(sectionId) {
    // Hide all content sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.style.display = 'none';
    });
    
    // Show the requested section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.style.display = 'block';
        
        // Update URL hash if on admin.html
        if (window.location.pathname.includes('admin.html')) {
            window.location.hash = sectionId;
        }
        
        // Scroll to top of page
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Load data based on section
        if (sectionId === 'profile') {
            loadProfileData();
        } else if (sectionId === 'departments') {
            loadDepartments();
        } else if (sectionId === 'accounts') {
            loadAccounts();
        } else if (sectionId === 'employees') {
            loadEmployees();
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

// Page initialization (works for both admin.html and user.html)
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication state and set body classes (including is-admin)
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
    
    // Handle dropdown menu navigation (Profile, Employees, etc.)
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
    
    // Initialize request modal
    const requestModal = new bootstrap.Modal(document.getElementById('requestModal'));
    
    // Initialize request modal with at least one item field
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
});

//profilemodal
var editProfileModal = new bootstrap.Modal(document.getElementById('editProfileModal'));
var editProfileBtn = document.getElementById('editProfileBtn');

editProfileBtn.addEventListener('click', function () {
    editProfileModal.show();
});

document.getElementById('profileForm').addEventListener('submit', function(e) {
    e.preventDefault(); 
    var name = this.querySelector('input[type="text"]').value;
    var email = this.querySelector('input[type="email"]').value;
    var password = this.querySelector('input[type="password"]').value;

    console.log('Name:', name, 'Email:', email, 'Password:', password);

    editProfileModal.hide();
});




const requestModal = new bootstrap.Modal(document.getElementById('requestModal'));

// Requests functionality
let requestIdToDelete = null;

function loadRequests() {
    const requests = JSON.parse(localStorage.getItem('requests') || '[]');
    const tbody = document.getElementById('requestsTableBody');
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    
    // Update section title based on user role
    const sectionTitle = document.getElementById('requestsSectionTitle');
    if (sectionTitle) {
        if (currentUser && currentUser.role === 'admin') {
            sectionTitle.textContent = 'All User Requests';
        } else {
            sectionTitle.textContent = 'My Requests';
        }
    }
    
    tbody.innerHTML = '';
    
    if (requests.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center">No requests found</td></tr>';
        return;
    }
    
    // Filter requests based on user role
    let requestsToShow = requests;
    
    if (currentUser && currentUser.role !== 'admin') {
        // Regular users only see their own requests
        requestsToShow = requests.filter(request => request.userEmail === currentUser.email);
    }
    // Admins see all requests
    
    if (requestsToShow.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center">No requests found</td></tr>';
        return;
    }
    
    requestsToShow.forEach((request) => {
        const row = document.createElement('tr');
        const requestId = request.id || '';
        const escapedId = requestId.replace(/'/g, "\\'");
        const itemsText = Array.isArray(request.items) ? request.items.join(', ') : (request.items || '-');
        const status = request.status || 'Not Approved';
        const statusClass = status === 'Approved' ? 'success' : 'warning';
        const userEmail = request.userEmail || 'Unknown';
        
        // Format date if available
        const requestDate = request.date ? new Date(request.date).toLocaleString() : 'Unknown';
        
        row.innerHTML = `
            <td>${request.type || '-'}</td>
            <td>${itemsText}</td>
            <td><span class="badge bg-${statusClass}">${status}</span></td>
            <td>
                ${currentUser && currentUser.role === 'admin' ? `
                    <div class="mb-2">
                        <small class="d-block">User: ${request.userName || userEmail}</small>
                        <small class="d-block text-muted">${requestDate}</small>
                    </div>
                ` : ''}
                <button class="btn btn-sm btn-outline-${status === 'Approved' ? 'warning' : 'success'} me-1" onclick="toggleRequestStatus('${escapedId}')">
                    ${status === 'Approved' ? 'Not Approved' : 'Approved'}
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteRequest('${escapedId}')">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function toggleRequestStatus(requestId) {
    const requests = JSON.parse(localStorage.getItem('requests') || '[]');
    const requestIndex = requests.findIndex(r => r.id === requestId);
    
    if (requestIndex !== -1) {
        const currentStatus = requests[requestIndex].status || 'Not Approved';
        requests[requestIndex].status = currentStatus === 'Approved' ? 'Not Approved' : 'Approved';
        localStorage.setItem('requests', JSON.stringify(requests));
        loadRequests();
    }
}

function deleteRequest(requestId) {
    requestIdToDelete = requestId;
    const modal = new bootstrap.Modal(document.getElementById('deleteRequestModal'));
    modal.show();
}

document.getElementById('confirmDeleteRequestBtn').addEventListener('click', function() {
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
    const modalInstance = bootstrap.Modal.getInstance(document.getElementById('deleteRequestModal'));
    if (modalInstance) {
        modalInstance.hide();
    }
});

// Handle request form submission (if submitRequest function exists, update it)
if (typeof submitRequest === 'function') {
    const originalSubmitRequest = submitRequest;
    window.submitRequest = function() {
        originalSubmitRequest();
        loadRequests();
    };
} else {
    // If submitRequest doesn't exist, create a basic one
    window.submitRequest = function() {
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
        
        requestModal.hide();
        loadRequests();
        alert('✅ Request submitted successfully! Your request is now pending approval.');
    };
}

// Handle addItem function (if it doesn't exist, create a basic one)
if (typeof addItem !== 'function') {
    window.addItem = function() {
        const itemsContainer = document.getElementById('itemsContainer');
        const itemDiv = document.createElement('div');
        itemDiv.className = 'mb-2 d-flex';
        itemDiv.innerHTML = `
            <input type="text" class="form-control me-2" placeholder="Item name">
            <button type="button" class="btn btn-sm btn-outline-danger" onclick="this.parentElement.remove()">Remove</button>
        `;
        itemsContainer.appendChild(itemDiv);
    };
}

// Employees functionality
let currentEditingEmployeeId = null;
let employeeIdToDelete = null;

function loadEmployees() {
    const employees = JSON.parse(localStorage.getItem('employees') || '[]');
    const tbody = document.getElementById('employeesTableBody');
    tbody.innerHTML = '';
    
    if (employees.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">No employees found</td></tr>';
        return;
    }
    
    employees.forEach((employee) => {
        const row = document.createElement('tr');
        const employeeId = employee.id || '';
        const escapedId = employeeId.replace(/'/g, "\\'");
        row.innerHTML = `
            <td>${employeeId}</td>
            <td>${employee.name || '-'}</td>
            <td>${employee.position || '-'}</td>
            <td>${employee.department || '-'}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary me-1" onclick="editEmployee('${escapedId}')">Edit</button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteEmployee('${escapedId}')">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function editEmployee(employeeId) {
    currentEditingEmployeeId = employeeId;
    const employees = JSON.parse(localStorage.getItem('employees') || '[]');
    const employee = employees.find(e => e.id === employeeId);
    
    if (!employee) {
        alert('Employee not found');
        return;
    }
    
    const employeeIdField = document.getElementById('employeeId');
    employeeIdField.value = employee.id || '';
    employeeIdField.readOnly = true; // Make ID read-only during edit
    
    document.getElementById('employeeName').value = employee.name || '';
    document.getElementById('employeeEmail').value = employee.email || '';
    document.getElementById('employeePosition').value = employee.position || '';
    document.getElementById('employeeDepartment').value = employee.department || '';
    document.getElementById('employeeHiringDate').value = employee.hiringDate || '';
    
    const modalEl = document.getElementById('addEmployeeModal');
    modalEl.querySelector('.modal-title').innerText = 'Edit Employee';
    
    const modal = getModalInstance('addEmployeeModal');
    if (modal) {
        modal.show();
    }
}

function deleteEmployee(employeeId) {
    employeeIdToDelete = employeeId;
    const modal = getModalInstance('deleteConfirmModal');
    if (modal) {
        modal.show();
    }
}

document.getElementById('confirmDeleteBtn').addEventListener('click', function() {
    if (employeeIdToDelete) {
        const employees = JSON.parse(localStorage.getItem('employees') || '[]');
        const employeeIndex = employees.findIndex(e => e.id === employeeIdToDelete);
        if (employeeIndex !== -1) {
            employees.splice(employeeIndex, 1);
            localStorage.setItem('employees', JSON.stringify(employees));
            loadEmployees();
        }
        employeeIdToDelete = null;
    }
    const modalInstance = getModalInstance('deleteConfirmModal');
    if (modalInstance) {
        modalInstance.hide();
    }
    cleanupModalBackdrops();
});

// Update add employee button and form submission
document.getElementById('addEmployeeBtn').addEventListener('click', function() {
    currentEditingEmployeeId = null;
    document.getElementById('employeeForm').reset();
    const employeeIdField = document.getElementById('employeeId');
    employeeIdField.readOnly = false; // Enable ID field for new employees
    const modalEl = document.getElementById('addEmployeeModal');
    modalEl.querySelector('.modal-title').innerText = 'Add Employee';
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
});

document.getElementById('employeeForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const id = document.getElementById('employeeId').value.trim();
    const name = document.getElementById('employeeName').value.trim();
    const email = document.getElementById('employeeEmail').value.trim();
    const position = document.getElementById('employeePosition').value.trim();
    const department = document.getElementById('employeeDepartment').value.trim();
    const hiringDate = document.getElementById('employeeHiringDate').value;
    
    if (!id || !name) {
        alert('Please fill in Employee ID and Name');
        return;
    }
    
    let employees = JSON.parse(localStorage.getItem('employees') || '[]');
    
    if (currentEditingEmployeeId) {
        // Edit existing
        const employeeIndex = employees.findIndex(e => e.id === currentEditingEmployeeId);
        if (employeeIndex !== -1) {
            employees[employeeIndex] = {
                id,
                name,
                email,
                position,
                department,
                hiringDate
            };
        }
    } else {
        // Add new
        if (employees.find(e => e.id === id)) {
            alert('Employee ID already exists');
            return;
        }
        employees.push({
            id,
            name,
            email,
            position,
            department,
            hiringDate
        });
    }
    
    localStorage.setItem('employees', JSON.stringify(employees));
    loadEmployees();
    currentEditingEmployeeId = null;
    const modalInstance = getModalInstance('addEmployeeModal');
    if (modalInstance) {
        modalInstance.hide();
    }
    cleanupModalBackdrops();
});

// Departments functionality
let currentEditingDepartmentIndex = null;
let rowToDeleteDepartment = null;

function loadDepartments() {
    // Reload from localStorage each time
    const departments = JSON.parse(localStorage.getItem('departments') || '[]');
    const tbody = document.getElementById('departmentsTableBody');
    tbody.innerHTML = '';
    
    if (departments.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" class="text-center">No departments found</td></tr>';
        return;
    }
    
    departments.forEach((dept, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${dept.name || '-'}</td>
            <td>${dept.description || '-'}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary me-1" onclick="editDepartment(${index})">Edit</button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteDepartment(${index})">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function editDepartment(index) {
    currentEditingDepartmentIndex = index;
    const departments = JSON.parse(localStorage.getItem('departments') || '[]');
    const dept = departments[index];
    
    document.getElementById('departmentName').value = dept.name || '';
    document.getElementById('departmentDescription').value = dept.description || '';
    
    const modalEl = document.getElementById('addDepartmentModal');
    modalEl.querySelector('.modal-title').innerText = 'Edit Department';
    
    const modal = getModalInstance('addDepartmentModal');
    if (modal) {
        modal.show();
    }
}

function deleteDepartment(index) {
    rowToDeleteDepartment = index;
    const modal = getModalInstance('deleteDepartmentModal');
    if (modal) {
        modal.show();
    }
}

document.getElementById('confirmDeleteDepartmentBtn').addEventListener('click', function() {
    if (rowToDeleteDepartment !== null) {
        const departments = JSON.parse(localStorage.getItem('departments') || '[]');
        departments.splice(rowToDeleteDepartment, 1);
        localStorage.setItem('departments', JSON.stringify(departments));
        loadDepartments();
        rowToDeleteDepartment = null;
    }
    const modalInstance = getModalInstance('deleteDepartmentModal');
    if (modalInstance) {
        modalInstance.hide();
    }
    cleanupModalBackdrops();
});

document.getElementById('addDepartmentBtn').addEventListener('click', function() {
    currentEditingDepartmentIndex = null;
    document.getElementById('departmentForm').reset();
    const modalEl = document.getElementById('addDepartmentModal');
    modalEl.querySelector('.modal-title').innerText = 'Add Department';
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
});

document.getElementById('departmentForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('departmentName').value.trim();
    const description = document.getElementById('departmentDescription').value.trim();
    
    if (!name) {
        alert('Please enter a department name');
        return;
    }
    
    const departments = JSON.parse(localStorage.getItem('departments') || '[]');
    
    if (currentEditingDepartmentIndex !== null) {
        // Edit existing
        departments[currentEditingDepartmentIndex] = { name, description };
    } else {
        // Add new
        departments.push({ name, description });
    }
    
    localStorage.setItem('departments', JSON.stringify(departments));
    loadDepartments();
    const modalInstance = getModalInstance('addDepartmentModal');
    if (modalInstance) {
        modalInstance.hide();
    }
    cleanupModalBackdrops();
});

// Accounts functionality
let currentEditingAccountEmail = null;
let accountEmailToDelete = null;
let accountEmailToResetPassword = null;

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

function loadAccounts() {
    // Reload from localStorage each time and remove duplicates
    let accounts = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Remove duplicates based on email
    const uniqueAccounts = [];
    const seenEmails = new Set();
    
    accounts.forEach(account => {
        if (account && account.email && !seenEmails.has(account.email)) {
            seenEmails.add(account.email);
            uniqueAccounts.push(account);
        }
    });
    
    // Update localStorage with cleaned data if duplicates were found
    if (uniqueAccounts.length !== accounts.length) {
        localStorage.setItem('users', JSON.stringify(uniqueAccounts));
        accounts = uniqueAccounts;
    }
    
    const tbody = document.getElementById('accountsTableBody');
    tbody.innerHTML = '';
    
    if (accounts.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">No accounts found</td></tr>';
        return;
    }
    
    accounts.forEach((account) => {
        const row = document.createElement('tr');
        const fullName = `${account.firstName || ''} ${account.lastName || ''}`.trim() || '-';
        const verified = account.verified ? 'Yes' : 'No';
        const email = account.email || '';
        // Escape email for use in onclick
        const escapedEmail = email.replace(/'/g, "\\'");
        row.innerHTML = `
            <td>${fullName}</td>
            <td>${email}</td>
            <td>${account.role || 'user'}</td>
            <td>${verified}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary me-1" onclick="editAccount('${escapedEmail}')">Edit</button>
                <button class="btn btn-sm btn-outline-warning me-1" onclick="resetAccountPassword('${escapedEmail}')">Reset Password</button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteAccount('${escapedEmail}')">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function editAccount(email) {
    currentEditingAccountEmail = email;
    const accounts = JSON.parse(localStorage.getItem('users') || '[]');
    const account = accounts.find(a => a.email === email);
    
    if (!account) {
        alert('Account not found');
        return;
    }
    
    document.getElementById('accountFirstName').value = account.firstName || '';
    document.getElementById('accountLastName').value = account.lastName || '';
    document.getElementById('accountEmail').value = account.email || '';
    document.getElementById('accountPassword').value = '';
    document.getElementById('accountRole').value = account.role || 'user';
    document.getElementById('accountVerified').checked = account.verified || false;
    
    const modalEl = document.getElementById('addAccountModal');
    modalEl.querySelector('.modal-title').innerText = 'Edit Account';
    
    const modal = getModalInstance('addAccountModal');
    if (modal) {
        modal.show();
    }
}

function resetAccountPassword(email) {
    accountEmailToResetPassword = email;
    document.getElementById('resetPasswordForm').reset();
    const modal = getModalInstance('resetPasswordModal');
    if (modal) {
        modal.show();
    }
}

function deleteAccount(email) {
    accountEmailToDelete = email;
    const modal = getModalInstance('deleteAccountModal');
    if (modal) {
        modal.show();
    }
}

document.getElementById('confirmDeleteAccountBtn').addEventListener('click', function() {
    if (accountEmailToDelete) {
        const accounts = JSON.parse(localStorage.getItem('users') || '[]');
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
        
        // Prevent deleting the currently logged-in user
        if (currentUser && currentUser.email === accountEmailToDelete) {
            alert('You cannot delete your own account while logged in');
            const modalInstance = getModalInstance('deleteAccountModal');
            if (modalInstance) {
                modalInstance.hide();
            }
            cleanupModalBackdrops();
            accountEmailToDelete = null;
            return;
        }
        
        const accountIndex = accounts.findIndex(a => a.email === accountEmailToDelete);
        if (accountIndex !== -1) {
            accounts.splice(accountIndex, 1);
            localStorage.setItem('users', JSON.stringify(accounts));
            loadAccounts();
        }
        accountEmailToDelete = null;
    }
    const modalInstance = getModalInstance('deleteAccountModal');
    if (modalInstance) {
        modalInstance.hide();
    }
    cleanupModalBackdrops();
});

document.getElementById('addAccountBtn').addEventListener('click', function() {
    currentEditingAccountEmail = null;
    document.getElementById('accountForm').reset();
    const modalEl = document.getElementById('addAccountModal');
    modalEl.querySelector('.modal-title').innerText = 'Add Account';
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
});

document.getElementById('accountForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const firstName = document.getElementById('accountFirstName').value.trim();
    const lastName = document.getElementById('accountLastName').value.trim();
    const email = document.getElementById('accountEmail').value.trim();
    const password = document.getElementById('accountPassword').value;
    const role = document.getElementById('accountRole').value;
    const verified = document.getElementById('accountVerified').checked;
    
    if (!firstName || !lastName || !email) {
        alert('Please fill in all required fields');
        return;
    }
    
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Please enter a valid email address');
        return;
    }
    
    let accounts = JSON.parse(localStorage.getItem('users') || '[]');
    
    if (currentEditingAccountEmail) {
        // Edit existing
        const accountIndex = accounts.findIndex(a => a.email === currentEditingAccountEmail);
        if (accountIndex !== -1) {
            const existingAccount = accounts[accountIndex];
            accounts[accountIndex] = {
                ...existingAccount,
                firstName,
                lastName,
                email,
                role,
                verified,
                ...(password && { password }) // Only update password if provided
            };
        }
    } else {
        // Add new
        if (!password || password.length < 6) {
            alert('Password must be at least 6 characters long');
            return;
        }
        
        // Check if email already exists
        if (accounts.find(a => a.email === email)) {
            alert('Email already registered');
            return;
        }
        
        accounts.push({
            firstName,
            lastName,
            email,
            password,
            role,
            verified
        });
    }
    
    localStorage.setItem('users', JSON.stringify(accounts));
    loadAccounts();
    currentEditingAccountEmail = null;
    const modalInstance = getModalInstance('addAccountModal');
    if (modalInstance) {
        modalInstance.hide();
    }
    cleanupModalBackdrops();
});

document.getElementById('resetPasswordForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (!newPassword || newPassword.length < 6) {
        alert('Password must be at least 6 characters long');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }
    
    if (accountEmailToResetPassword) {
        const accounts = JSON.parse(localStorage.getItem('users') || '[]');
        const accountIndex = accounts.findIndex(a => a.email === accountEmailToResetPassword);
        if (accountIndex !== -1) {
            accounts[accountIndex].password = newPassword;
            localStorage.setItem('users', JSON.stringify(accounts));
            alert('Password reset successfully');
        }
        accountEmailToResetPassword = null;
    }
    
    const modalInstance = getModalInstance('resetPasswordModal');
    if (modalInstance) {
        modalInstance.hide();
    }
    cleanupModalBackdrops();
});


