document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');
  const errorElement = document.getElementById('error');
  
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      
      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Login failed');
        }
        
        localStorage.setItem('token', data.token);
        window.location.href = '/dashboard';
      } catch (error) {
        errorElement.textContent = error.message;
      }
    });
  }
  
  if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      
      try {
        const response = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Signup failed');
        }
        
        localStorage.setItem('token', data.token);
        window.location.href = '/dashboard';
      } catch (error) {
        errorElement.textContent = error.message;
      }
    });
  }
  
  // Check if user is already logged in
  if (localStorage.getItem('token') && 
      (window.location.pathname === '/login' || 
       window.location.pathname === '/signup')) {
    window.location.href = '/dashboard';
  }
});
