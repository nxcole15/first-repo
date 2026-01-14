
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
        
        // Update URL hash if on admin.html
        if (window.location.pathname.includes('admin.html')) {
            window.location.hash = sectionId;
        }
        
        // Scroll to top of page
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // If showing profile, load the data
        if (sectionId === 'profile') {
            loadProfileData();
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

// Admin page initialization
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication state and set body classes (including is-admin)
    checkAuthState();
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    
    if (!currentUser) {
        // Redirect to login if not authenticated
        window.location.href = 'login.html';
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

    // Handle hash navigation (for admin.html#section)
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

//employeemodal
document.getElementById('addEmployeeBtn').addEventListener('click', function() {
    const employeeModal = new bootstrap.Modal(document.getElementById('addEmployeeModal'));
    employeeModal.show();
});

//accountmodal
document.getElementById('addAccountBtn').addEventListener('click', function () {
  const modal = new bootstrap.Modal(
    document.getElementById('addAccountModal')
  );
  modal.show();
});

document.getElementById('addDepartmentBtn').addEventListener('click', function(){
    const modal = new bootstrap.Modal(document.getElementById('addDepartmentModal'));
    modal.show();
});


const modal = new bootstrap.Modal(document.getElementById('requestModal'));

document.getElementById('openRequestModal').addEventListener('click', openModal);
document.getElementById('openRequestModal2').addEventListener('click', openModal);

function openModal() {
  modal.show();
}


function editEmployee(btn) {
  const row = btn.closest("tr");
  const cells = row.children;

  empId.value = cells[0].innerText;
  empEmail.value = cells[1].innerText;
  empPosition.value = cells[2].innerText;
  empDepartment.value = cells[3].innerText;
  
  employeeModal.show();
}

function deleteEmployee(btn) {
  if (confirm("Delete this employee?")) {
    btn.closest("tr").remove();
  }
}