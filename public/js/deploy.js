document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = '/login';
    return;
  }

  const deployBtn = document.getElementById('deployBtn');
  const toggleBtn = document.getElementById('toggleConfig');
  const configSection = document.getElementById('configSection');
  const resultDiv = document.getElementById('result');

  // Bot configuration
  const botConfig = {
    "SESSION_ID": { type: "text", value: "", required: true },
    "STICKER_NAME": { type: "text", value: "KHAN-MD", required: false },
    "PREFIX": { type: "text", value: ".", required: false },
    "MODE": { type: "select", value: "public", options: ["public", "private", "inbox", "group"], required: false },
    "ANTI_DELETE": { type: "checkbox", value: true, required: false },
    "ALWAYS_ONLINE": { type: "checkbox", value: false, required: false },
    "AUTO_REPLY": { type: "checkbox", value: false, required: false },
    "AUTO_STICKER": { type: "checkbox", value: false, required: false },
    "AUTO_STATUS_SEEN": { type: "checkbox", value: true, required: true },
    "AUTO_STATUS_REACT": { type: "checkbox", value: true, required: true },
    "AUTO_STATUS_REPLY": { type: "checkbox", value: false, required: true },
    "AUTO_STATUS_MSG": { type: "text", value: "*SEEN YOUR STATUS BY KHAN-MD 🖤*", required: true },
    "OWNER_NAME": { type: "text", value: "Jᴀᴡᴀᴅ TᴇᴄʜX", required: false },
    "OWNER_NUMBER": { type: "text", value: "923427582273", required: false },
    "BOT_NAME": { type: "text", value: "KHAN-MD", required: false },
    "ANTI_LINK": { type: "checkbox", value: true, required: true },
    "ANTI_BAD": { type: "checkbox", value: false, required: false },
    "MENTION_REPLY": { type: "checkbox", value: false, required: false },
    "MENU_IMAGE_URL": { type: "text", value: "https://files.catbox.moe/7zfdcq.jpg", required: false },
    "DESCRIPTION": { type: "text", value: "*© ᴘᴏᴡᴇʀᴇᴅ ʙʏ Jᴀᴡᴀᴅ TᴇᴄʜX*", required: false },
    "DELETE_LINKS": { type: "checkbox", value: false, required: false },
    "AUTO_RECORDING": { type: "checkbox", value: false, required: false },
    "AUTO_TYPING": { type: "checkbox", value: false, required: false },
    "AUTO_REACT": { type: "checkbox", value: false, required: false },
    "CUSTOM_REACT": { type: "checkbox", value: false, required: false },
    "CUSTOM_REACT_EMOJIS": { type: "text", value: "💝,💖,💗,❤️‍🩹,❤️,🧡,💛,💚,💙,💜,🤎,🖤,🤍", required: false },
    "ANTI_DEL_PATH": { type: "select", value: "inbox", options: ["inbox", "same"], required: false },
    "ADMIN_ACTION": { type: "checkbox", value: false, required: false },
    "WELCOME": { type: "checkbox", value: false, required: false },
    "GOODBYE": { type: "checkbox", value: false, required: false },
    "READ_MESSAGE": { type: "checkbox", value: false, required: false }
  };

  // Toggle config visibility
  toggleBtn.addEventListener('click', () => {
    if (configSection.style.display === 'none') {
      configSection.style.display = 'block';
      toggleBtn.textContent = 'Hide Advanced Config';
      renderConfigItems();
    } else {
      configSection.style.display = 'none';
      toggleBtn.textContent = 'Show Advanced Config';
    }
  });

  // Render config items
  function renderConfigItems() {
    configSection.innerHTML = '';
    
    for (const [key, config] of Object.entries(botConfig)) {
      const item = document.createElement('div');
      item.className = 'config-item';
      
      const label = document.createElement('label');
      label.textContent = key;
      
      let input;
      if (config.type === 'checkbox') {
        input = document.createElement('input');
        input.type = 'checkbox';
        input.id = `config-${key}`;
        input.checked = config.value;
      } else if (config.type === 'select') {
        input = document.createElement('select');
        input.id = `config-${key}`;
        config.options.forEach(opt => {
          const option = document.createElement('option');
          option.value = opt;
          option.textContent = opt;
          if (opt === config.value) option.selected = true;
          input.appendChild(option);
        });
      } else {
        input = document.createElement('input');
        input.type = 'text';
        input.id = `config-${key}`;
        input.value = config.value;
      }
      
      item.appendChild(label);
      item.appendChild(input);
      configSection.appendChild(item);
    }
  }

  // Deploy function
  deployBtn.addEventListener('click', async () => {
    const username = document.getElementById('username').value.trim();
    const session = document.getElementById('session').value.trim();
    const appname = document.getElementById('appname').value.trim();
    
    if (!username) {
      showResult('❌ GitHub username is required', 'error');
      return;
    }
    
    if (!session || !session.startsWith('IK~')) {
      showResult('❌ Valid SESSION_ID is required (must start with IK~)', 'error');
      return;
    }
    
    deployBtn.disabled = true;
    resultDiv.textContent = 'Deploying...';
    
    try {
      // Update SESSION_ID in config
      botConfig.SESSION_ID.value = session;
      
      // Get all config values
      const config = {};
      const inputs = configSection.querySelectorAll('input, select');
      inputs.forEach(input => {
        const key = input.id.replace('config-', '');
        config[key] = input.type === 'checkbox' ? input.checked : input.value;
      });
      
      const response = await fetch('/api/deploy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          username,
          session_id: session,
          appname: appname || undefined,
          config
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Deployment failed');
      }
      
      showResult(`✅ ${data.message}`, 'success');
      deployBtn.textContent = 'Deploy Another';
      deployBtn.onclick = () => window.location.reload();
      
    } catch (error) {
      showResult(`❌ ${error.message}`, 'error');
      deployBtn.disabled = false;
    }
  });
  
  function showResult(message, type) {
    resultDiv.textContent = message;
    resultDiv.className = `result-message ${type}`;
  }
});
