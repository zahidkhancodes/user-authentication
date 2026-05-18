const API = 'http://localhost:4000';

function showPage(pageId) {
    document.querySelectorAll('.card').forEach(c => c.classList.add('hidden'));
    document.getElementById(pageId).classList.remove('hidden');
}

function setStatus(id, message, type) {
    const el = document.getElementById(id);
    el.textContent = message;
    el.className = 'status ' + type;
}


async function register() {
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;

    if (!email || !password) {
        return setStatus('registerStatus', 'Please fill in all fields.', 'error');
    }

    try {
        const res = await fetch(`${API}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
            credentials: 'include'
        });

        const data = await res.json();

        if (res.ok) {
            setStatus('registerStatus', 'Registered! Redirecting to login...', 'success');
            setTimeout(() => {
                document.getElementById('regEmail').value = '';
                document.getElementById('regPassword').value = '';
                setStatus('registerStatus', '', '');
                showPage('loginPage');
            }, 1500);
        } else {
            setStatus('registerStatus', data.message, 'error');
        }
    } catch (err) {
        setStatus('registerStatus', 'Server error. Try again later.', 'error');
    }
}


async function login() {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    if (!email || !password) {
        return setStatus('loginStatus', 'Please fill in all fields.', 'error');
    }

    try {
        const res = await fetch(`${API}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
            credentials: 'include'
        });

        const data = await res.json();

        if (res.ok) {
            document.getElementById('userEmail').textContent = data.email;
            document.getElementById('loginEmail').value = '';
            document.getElementById('loginPassword').value = '';
            setStatus('loginStatus', '', '');
            showPage('dashboardPage');
        } else {
            setStatus('loginStatus', data.message, 'error');
        }
    } catch (err) {
        setStatus('loginStatus', 'Server error. Try again later.', 'error');
    }
}


async function logout() {
    try {
        await fetch(`${API}/logout`, {
            method: 'POST',
            credentials: 'include'
        });
        showPage('loginPage');
    } catch (err) {
        setStatus('logoutStatus', 'Logout failed.', 'error');
    }
}


// On page load — check if user already has a valid session
async function checkSession() {
    try {
        const res = await fetch(`${API}/me`, {
            credentials: 'include'
        });

        if (res.ok) {
            const data = await res.json();
            document.getElementById('userEmail').textContent = data.email;
            showPage('dashboardPage');
        } else {
            showPage('loginPage');
        }
    } catch (err) {
        showPage('loginPage');
    }
}

checkSession();
