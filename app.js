// Local Storage Initialization
let users = JSON.parse(localStorage.getItem('users')) || {};
let activities = JSON.parse(localStorage.getItem('activities')) || {};
let currentUser = null;

// Sections
const sections = {
  landing: document.getElementById('landing'),
  login: document.getElementById('login'),
  register: document.getElementById('register'),
  forgotPassword: document.getElementById('forgotPassword'),
  dashboard: document.getElementById('dashboard')
};

// Forms
const forms = {
  login: document.getElementById('loginForm'),
  register: document.getElementById('registerForm'),
  forgot: document.getElementById('forgotPasswordForm'),
  activity: document.getElementById('activityForm')
};

// Errors
const errors = {
  login: document.getElementById('loginError'),
  register: document.getElementById('registerError'),
  forgot: document.getElementById('forgotError'),
  activity: document.getElementById('activityError')
};

// User elements
const userNameDisplay = document.getElementById('userName');
const totalFootprint = document.getElementById('co2Saved');
const totalDistance = document.getElementById('totalDistance');

// Panel buttons
const panels = {
  profile: document.getElementById('profile'),
  activity: document.getElementById('activity'),
  achievements: document.getElementById('achievements'),
  leaderboard: document.getElementById('leaderboard')
};

// Show Sections
function showSection(id) {
  Object.values(sections).forEach(s => s.classList.remove('active'));
  sections[id].classList.add('active');
}

// Show Panels
function showPanel(id) {
  Object.values(panels).forEach(p => p.classList.remove('active'));
  panels[id].classList.add('active');
  document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
  document.getElementById(`show${id.charAt(0).toUpperCase() + id.slice(1)}`).classList.add('active');
}

// Update Dashboard
function updateDashboard() {
  if (!currentUser) return;

  const allActivities = activities[currentUser] || [];
  const totalCO2 = allActivities.reduce((sum, a) => sum + a.total, 0);
  const totalDist = allActivities.reduce((sum, a) => sum + a.distance, 0);

  totalFootprint.textContent = totalCO2.toFixed(2);
  totalDistance.textContent = totalDist.toFixed(2);

  // Update charts
  const transportTotal = allActivities.reduce((sum, a) => sum + a.transport, 0);
  const energyTotal = allActivities.reduce((sum, a) => sum + a.energy, 0);
  const foodTotal = allActivities.reduce((sum, a) => sum + a.food, 0);

  pieChart.data.datasets[0].data = [transportTotal, energyTotal, foodTotal];
  pieChart.update();

  // Leaderboard
  const leaderboard = Object.entries(users).map(([email, user]) => ({
    name: user.name,
    score: (activities[email] || []).reduce((sum, a) => sum + a.total, 0)
  })).sort((a, b) => b.score - a.score).slice(0, 5);

  document.getElementById('leaderboardList').innerHTML = leaderboard.map((u, i) => `
    <div>${i + 1}. ${u.name} - ${u.score.toFixed(2)} kg CO₂</div>
  `).join('');
}

// Register
forms.register.addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('registerEmail').value.trim();
  const name = document.getElementById('registerName').value.trim();
  const password = document.getElementById('registerPassword').value;

  if (users[email]) {
    errors.register.textContent = 'Email already registered.';
    return;
  }

  users[email] = { name, password };
  activities[email] = [];
  localStorage.setItem('users', JSON.stringify(users));
  localStorage.setItem('activities', JSON.stringify(activities));

  errors.register.textContent = 'Registration successful! Please login.';
  forms.register.reset();
  setTimeout(() => showSection('login'), 1000);
});

// Login
forms.login.addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  if (users[email] && users[email].password === password) {
    currentUser = email;
    userNameDisplay.textContent = users[email].name;
    forms.login.reset();
    showSection('dashboard');
    updateDashboard();
    errors.login.textContent = '';
  } else {
    errors.login.textContent = 'Invalid email or password.';
  }
});

// Forgot Password
forms.forgot.addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('forgotEmail').value.trim();

  if (!users[email]) {
    errors.forgot.textContent = 'Email not found.';
    return;
  }

  errors.forgot.textContent = 'Password reset link sent (simulated).';
  forms.forgot.reset();
  setTimeout(() => showSection('login'), 1000);
});

// Activity
forms.activity.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!currentUser) return;

  const transport = parseFloat(document.getElementById('transport').value) * parseFloat(document.getElementById('transportKm').value || 0);
  const distance = parseFloat(document.getElementById('transportKm').value || 0);
  const energy = parseFloat(document.getElementById('energy').value || 0) * 0.4;
  const food = parseFloat(document.getElementById('food').value || 0);

  if (transport === 0 && energy === 0 && food === 0) {
    errors.activity.textContent = 'Please fill activity fields!';
    return;
  }

  const total = transport + energy + food;

  activities[currentUser].push({ transport, energy, food, total, distance, date: new Date().toISOString() });
  localStorage.setItem('activities', JSON.stringify(activities));

  updateDashboard();
  forms.activity.reset();
});

// Navigation
document.getElementById('showProfile').addEventListener('click', () => showPanel('profile'));
document.getElementById('showActivity').addEventListener('click', () => showPanel('activity'));
document.getElementById('showAchievements').addEventListener('click', () => showPanel('achievements'));
document.getElementById('showLeaderboard').addEventListener('click', () => showPanel('leaderboard'));
document.getElementById('logout').addEventListener('click', () => {
  currentUser = null;
  showSection('landing');
});

// Landing page buttons
document.getElementById('showLogin').addEventListener('click', () => showSection('login'));
document.getElementById('showRegister').addEventListener('click', () => showSection('register'));
document.getElementById('showForgotPassword').addEventListener('click', () => showSection('forgotPassword'));
document.getElementById('backToLandingFromLogin').addEventListener('click', () => showSection('landing'));
document.getElementById('backToLandingFromRegister').addEventListener('click', () => showSection('landing'));
document.getElementById('backToLoginFromForgot').addEventListener('click', () => showSection('login'));

// Dark Mode
const darkModeToggle = document.getElementById('darkModeToggle');

if (localStorage.getItem('darkMode') === 'enabled') {
  document.body.classList.add('dark');
}

darkModeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  if (document.body.classList.contains('dark')) {
    localStorage.setItem('darkMode', 'enabled');
  } else {
    localStorage.setItem('darkMode', 'disabled');
  }
});

// Charts
const pieChart = new Chart(document.getElementById('pieChart'), {
  type: 'pie',
  data: {
    labels: ['Transport', 'Energy', 'Food'],
    datasets: [{
      data: [0, 0, 0],
      backgroundColor: ['#38a169', '#ed8936', '#2f855a'],
      borderColor: '#ffffff',
      borderWidth: 2
    }]
  },
  options: {
    responsive: true,
    plugins: {
      legend: {
        position: 'top'
      }
    }
  }
});

const barChart = new Chart(document.getElementById('barChart'), {
  type: 'bar',
  data: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [{
      label: 'CO₂ Saved (kg)',
      data: new Array(12).fill(0),
      backgroundColor: '#68d391'
    }]
  },
  options: {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true
      }
    }
  }
});

// Profile Picture Cropping
let cropper;
document.getElementById('uploadImage').addEventListener('change', (e) => {
  const file = e.target.files[0];
  const reader = new FileReader();
  reader.onload = () => {
    const image = document.getElementById('cropImage');
    image.src = reader.result;
    document.getElementById('cropContainer').style.display = 'block';
    if (cropper) cropper.destroy();
    cropper = new Cropper(image, {
      aspectRatio: 1,
      viewMode: 1,
      minContainerWidth: 300,
      minContainerHeight: 300
    });
  };
  reader.readAsDataURL(file);
});

document.getElementById('cropImageButton').addEventListener('click', () => {
  if (!cropper) return;
  const canvas = cropper.getCroppedCanvas({
    width: 100,
    height: 100
  });
  document.getElementById('avatar').src = canvas.toDataURL();
  document.getElementById('cropContainer').style.display = 'none';
  cropper.destroy();
});

