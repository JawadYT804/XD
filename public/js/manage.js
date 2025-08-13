document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('token');
  const botId = window.location.pathname.split('/')[2];
  
  if (!token) {
    window.location.href = '/login';
    return;
  }
  
  try {
    // Get bot details
    const response = await fetch(`/api/bots/${botId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch bot details');
    }
    
    const bot = await response.json();
    document.getElementById('botName').textContent = bot.appName;
    
    // Load config form
    const configForm = document.getElementById('configForm');
    for (const [key, value] of Object.entries(bot.config)) {
      const div = document.createElement('div');
      div.className = 'config-item';
      
      const label = document.createElement('label');
      label.textContent = key;
      label.htmlFor = `config-${key}`;
      
      let input;
      if (typeof value === 'boolean') {
        input = document.createElement('input');
        input.type = 'checkbox';
        input.id = `config-${key}`;
        input.checked = value;
      } else {
        input = document.createElement('input');
        input.type = 'text';
        input.id = `config-${key}`;
        input.value = value;
      }
      
      div.appendChild(label);
      div.appendChild(input);
      configForm.appendChild(div);
    }
    
    // Save config
    document.getElementById('saveConfigBtn').addEventListener('click', async () => {
      const config = {};
      const inputs = configForm.querySelectorAll('input');
      
      inputs.forEach(input => {
        const key = input.id.replace('config-', '');
        config[key] = input.type === 'checkbox' ? input.checked : input.value;
      });
      
      try {
        const updateResponse = await fetch(`/api/bots/${botId}`, {
          method: 'PUT',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ config })
        });
        
        if (!updateResponse.ok) {
          throw new Error('Failed to update bot config');
        }
        
        alert('Configuration updated successfully!');
      } catch (error) {
        console.error('Update error:', error);
        alert(error.message);
      }
    });
    
    // View logs
    document.getElementById('viewLogsBtn').addEventListener('click', () => {
      window.location.href = `/status/${botId}`;
    });
    
    // Delete bot
    document.getElementById('deleteBotBtn').addEventListener('click', async () => {
      if (confirm('Are you sure you want to delete this bot? This action cannot be undone.')) {
        try {
          const deleteResponse = await fetch(`/api/bots/${botId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          if (!deleteResponse.ok) {
            throw new Error('Failed to delete bot');
          }
          
          alert('Bot deleted successfully!');
          window.location.href = '/dashboard';
        } catch (error) {
          console.error('Delete error:', error);
          alert(error.message);
        }
      }
    });
    
  } catch (error) {
    console.error('Manage error:', error);
    alert(error.message);
    window.location.href = '/dashboard';
  }
});
