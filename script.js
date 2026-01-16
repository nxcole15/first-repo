
document.addEventListener('DOMContentLoaded', function() {
    checkAuthState();
  
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

   
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }

  
    const cancelButton = document.getElementById('cancelButton');
    if (cancelButton) {
        cancelButton.addEventListener('click', function() {
            window.location.href = 'index.html';
        });
    }

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            handleLogout();
        });
    }
});





function handleLogin(e) {
    e.preventDefault();
    
    // Hide any previous error messages
    const errorDiv = document.getElementById('loginError');
    if (errorDiv) {
        errorDiv.style.display = 'none';
        errorDiv.textContent = '';
    }
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    function showError(message) {
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
        } else {
            alert(message);
        }
    }
  
    if (!email || !password) {
        showError('Please fill in all fields.');
        return;
    }

   
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showError('Please enter a valid email address.');
        return;
    }

    let users = JSON.parse(localStorage.getItem ('users') || '[]');
    let user = users.find(u => u.email === email && u.password === password);

    if (!user){
        // Trap incorrect username/password
        showError('Invalid email or password. Please try again.');
        // Clear password field for security
        document.getElementById('password').value = '';
        return;
    }

    // Check if account is verified
    // For legacy users without verified property, treat as unverified
    if (user.verified !== true) {
        showError('Your account has not been verified yet. Please contact an administrator to verify your account.');
        // Clear password field for security
        document.getElementById('password').value = '';
        return;
    }

    localStorage.setItem('currentUser', JSON.stringify (user));

    document.body.classList.remove
    ('not-authenticated');
    document.body.classList.add
    ('authenticated');

    if (user.role === 'admin') {
        document.body.classList.add
        ('is-admin');
    }

    alert('Login successful!');
  
    // Redirect based on user role
    if (user.role === 'admin') {
        window.location.href = 'admin.html';
    } else {
        window.location.href = 'user.html';
    }
}


function handleRegister(e) {
    e.preventDefault();
    
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

  
    if (!firstName || !lastName || !email || !password) {
        alert('Please fill in all fields.');
        return;
    }

   
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Please enter a valid email address.');
        return;
    }

   
    if (password.length < 6) {
        alert('Password must be at least 6 characters long.');
        return;
    }

    let users = JSON.parse(localStorage.getItem 
    ('users') || '[]');

    if (users.find(u => u.email === email)) {
        alert('Email already registered');
        return;
    }

    const newUser = {
        firstName: firstName,
        lastName: lastName,
        email: email,
        password: password,
        role: 'user',
        verified: false  // New users are not verified by default
    };

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify (users));

    
    alert('Registration successful! Your account is pending verification. Please contact an administrator to verify your account. Redirecting to login page.');
    window.location.href = 'login.html';
}

function checkAuthState() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    
    if (currentUser) {
        document.body.classList.remove('not-authenticated');
        document.body.classList.add('authenticated');

        if (currentUser.role === 'admin') {
            document.body.classList.add('is-admin');
            console.log('Admin user detected - admin menu items should be visible');
        } else {
            document.body.classList.remove('is-admin');
            console.log('Regular user detected - admin menu items will be hidden');
        }

        updateNavbar(currentUser);
    } else {
        document.body.classList.remove('authenticated', 'is-admin');
        document.body.classList.add('not-authenticated');
    }

}

// Helper function to create a default admin user for testing
function createDefaultAdmin() {
    let users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Check if admin already exists
    const adminExists = users.find(u => u.email === 'admin@example.com');
    
    if (!adminExists) {
        const adminUser = {
            firstName: 'Admin',
            lastName: 'User',
            email: 'admin@example.com',
            password: 'admin123',
            role: 'admin',
            verified: true  // Admin account is verified by default
        };
        users.push(adminUser);
        localStorage.setItem('users', JSON.stringify(users));
        console.log('Default admin user created: admin@example.com / admin123');
        return adminUser;
    }
    return adminExists;
}

function updateNavbar(user) {
    const usernameDisplay = document.getElementById('usernameDisplay');
    if (usernameDisplay) {
        usernameDisplay.textContent = `${user.firstName} ${user.lastName}`;
    }
}

function handleLogout() {
    localStorage.removeItem('currentUser');
    document.body.classList.remove
    ('authenticated', 'is-admin');
    document.body.classList.add
    ('not-authenticated');
    window.location.href = 'index.html';
}


