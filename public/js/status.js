document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('token');
  const botId = window.location.pathname.split('/')[2];
  
  if (!token) {
    window.location.href = '/login';
    return;
  }
  
  const logContent = document.getElementById('logContent');
  const refreshBtn = document.getElementById('refreshLogsBtn');
  
  async function loadLogs() {
    try {
      logContent.textContent = 'Loading logs...';
      
      const response = await fetch(`/api/bots/${botId}/logs`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch logs');
      }
      
      const data = await response.json();
      
      // Fetch the actual log content
      const logResponse = await fetch(data.logUrl);
      const logs = await logResponse.text();
      
      logContent.textContent = logs;
    } catch (error) {
      console.error('Logs error:', error);
      logContent.textContent = `Error loading logs: ${error.message}`;
    }
  }
  
  // Initial load
  loadLogs();
  
  // Refresh button
  refreshBtn.addEventListener('click', loadLogs);
});
