const token = localStorage.getItem('token');
if (!token) {
  alert("Please log in first");
  window.location.href = "login.html";
}

async function sendAttendance(type) {
  const endpoint = type === 'clock-in' ? 'clock-in' : 'clock-out';
  const res = await fetch(`http://localhost:5000/api/${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    }
  });

  const data = await res.json();
  if (res.ok) {
    alert(`${type === 'clock-in' ? 'Clocked In' : 'Clocked Out'} successfully`);
    fetchLastLog();
  } else {
    alert(data.message || 'Error');
  }
}

async function fetchLastLog() {
  const res = await fetch(`http://localhost:5000/api/last`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const data = await res.json();
  if (res.ok) {
    document.getElementById('lastClockIn').textContent = data.clockIn
      ? new Date(data.clockIn).toLocaleString()
      : "-";
    document.getElementById('lastClockOut').textContent = data.clockOut
      ? new Date(data.clockOut).toLocaleString()
      : "-";
  }
}

document.getElementById('clockInBtn').addEventListener('click', () => sendAttendance('clock-in'));
document.getElementById('clockOutBtn').addEventListener('click', () => sendAttendance('clock-out'));

fetchLastLog();
