
document.addEventListener('DOMContentLoaded', function() {
    
  
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
});


function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

  
    if (!email || !password) {
        alert('Please fill in all fields.');
        return;
    }

   
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Please enter a valid email address.');
        return;
    }

    
    alert('Login successful!');
  
    document.getElementById('loginForm').reset();
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

    
    alert('Registration successful! Redirecting to login page.');
    window.location.href = 'login.html';
}

