<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sign Up - KHAN-MD</title>
  <link rel="stylesheet" href="/css/style.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
</head>
<body>
  <div class="auth-container">
    <div class="logo">
      <i class="fas fa-robot"></i>
    </div>
    <h1>Create Account</h1>
    <form id="signupForm">
      <div class="form-group">
        <label>Email</label>
        <input type="email" id="email" required>
      </div>
      <div class="form-group">
        <label>Password</label>
        <input type="password" id="password" required>
      </div>
      <button type="submit">Sign Up</button>
    </form>
    <p>Already have an account? <a href="/login">Login</a></p>
    <div id="error" class="error-message"></div>
  </div>
  <script src="/js/auth.js"></script>
</body>
</html>
