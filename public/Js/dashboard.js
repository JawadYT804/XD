document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    window.location.href = '/login';
    return;
  }
  
  // Logout button
  document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  });
  
  // New bot button
  document.getElementById('newBotBtn').addEventListener('click', () => {
    window.location.href = '/';
  });
  
  try {
    // Get user info
    const userResponse = await fetch('/api/auth/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!userResponse.ok) {
      throw new Error('Failed to fetch user data');
    }
    
    const user = await userResponse.json();
    
    // Get bots
    const botsResponse = await fetch('/api/bots', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!botsResponse.ok) {
      throw new Error('Failed to fetch bots');
    }
    
    const bots = await botsResponse.json();
    const botsContainer = document.getElementById('botsContainer');
    
    // Update stats
    document.getElementById('botCount').textContent = bots.length;
    document.getElementById('remainingSlots').textContent = user.maxBots;
    
    // Render bots
    if (bots.length === 0) {
      botsContainer.innerHTML = '<p>No bots deployed yet.</p>';
    } else {
      botsContainer.innerHTML = '';
      bots.forEach(bot => {
        const botCard = document.createElement('div');
        botCard.className = 'bot-card';
        botCard.innerHTML = `
          <div class="bot-info">
            <h3>${bot.appName}</h3>
            <p>Created: ${new Date(bot.createdAt).toLocaleDateString()}</p>
          </div>
          <div class="bot-actions">
            <button onclick="location.href='/manage/${bot._id}'">Manage</button>
            <button onclick="location.href='/status/${bot._id}'">Logs</button>
          </div>
        `;
        botsContainer.appendChild(botCard);
      });
    }
    
  } catch (error) {
    console.error('Dashboard error:', error);
    alert(error.message);
    localStorage.removeItem('token');
    window.location.href = '/login';
  }
});
