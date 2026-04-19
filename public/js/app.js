const API_URL = 'http://localhost:3000/api';

// --- Auth Handling ---
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const msg = document.getElementById('login-msg');

        try {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (res.ok) {
                localStorage.setItem('user', JSON.stringify(data.user));
                window.location.href = data.user.role === 'admin' ? 'admin.html' : 'dashboard.html';
            } else {
                msg.textContent = data.error;
            }
        } catch (err) {
            msg.textContent = 'Server error. Is the backend running?';
        }
    });
}

const registerForm = document.getElementById('register-form');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('reg-name').value;
        const email = document.getElementById('reg-email').value;
        const password = document.getElementById('reg-password').value;
        const role = document.getElementById('reg-role').value;
        const msg = document.getElementById('reg-msg');

        try {
            const res = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, role })
            });
            const data = await res.json();
            if (res.ok) {
                localStorage.setItem('user', JSON.stringify(data.user));
                window.location.href = data.user.role === 'admin' ? 'admin.html' : 'dashboard.html';
            } else {
                msg.textContent = data.error;
            }
        } catch (err) {
            msg.textContent = 'Server error. Is the backend running?';
        }
    });
}

const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('user');
        window.location.href = 'index.html';
    });
}

// --- Dashboard Logic (User) ---
const submissionForm = document.getElementById('submission-form');
if (submissionForm) {
    let user = JSON.parse(localStorage.getItem('user'));
    document.getElementById('user-name-display').textContent = user.name;

    // Fill profile form
    document.getElementById('prof-name').value = user.name;
    document.getElementById('prof-email').value = user.email;
    document.getElementById('prof-phone').value = user.phone || '';
    document.getElementById('prof-address').value = user.address || '';
    document.getElementById('waste-address').value = user.address || '';

    // Load Stats
    async function loadStats() {
        const res = await fetch(`${API_URL}/auth/${user._id}`);
        if (res.ok) {
            const u = await res.json();
            document.getElementById('stat-kg').textContent = u.totalKg.toFixed(1);
            document.getElementById('stat-rewards').textContent = u.rewardPoints.toFixed(0);
            document.getElementById('stat-co2').textContent = u.co2Saved.toFixed(1);
        }
    }

    // Load History
    async function loadHistory() {
        const res = await fetch(`${API_URL}/submissions/user/${user._id}`);
        if (res.ok) {
            const subs = await res.json();
            const tbody = document.getElementById('history-body');
            tbody.innerHTML = '';
            subs.forEach(s => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${new Date(s.date).toLocaleDateString()}</td>
                    <td><small><b>At:</b> ${new Date(s.pickupTime).toLocaleString()}<br><b>Loc:</b> ${s.pickupAddress}</small></td>
                    <td>${s.wasteType} <br><small>${s.weight} Kg</small></td>
                    <td><span class="badge badge-${s.status}">${s.status.toUpperCase()}</span></td>
                `;
                tbody.appendChild(tr);
            });
        }
    }

    // Load Centers
    async function loadCenters() {
        const res = await fetch(`${API_URL}/centers`);
        if (res.ok) {
            const centers = await res.json();
            const list = document.getElementById('centers-list');
            list.innerHTML = '';
            centers.forEach(c => {
                const div = document.createElement('div');
                div.style.padding = '1rem';
                div.style.background = 'rgba(255,255,255,0.05)';
                div.style.borderRadius = '0.5rem';
                div.style.borderLeft = '4px solid var(--primary)';
                div.innerHTML = `
                    <h4 style="color: var(--text-main); margin-bottom: 0.25rem;">${c.name}</h4>
                    <p style="font-size: 0.85rem;"><i class="ri-map-pin-line"></i> ${c.address}, ${c.city || ''}</p>
                `;
                list.appendChild(div);
            });
        }
    }

    // Load Notifications
    async function loadNotifications() {
        const res = await fetch(`${API_URL}/notifications/${user._id}`);
        if (res.ok) {
            const notifs = await res.json();
            const list = document.getElementById('notif-list');
            list.innerHTML = '';
            let unreadCount = 0;
            notifs.forEach(n => {
                if (!n.isRead) unreadCount++;
                const div = document.createElement('div');
                div.style.padding = '1rem';
                div.style.background = n.isRead ? 'rgba(255,255,255,0.05)' : 'rgba(59, 130, 246, 0.1)';
                div.style.borderLeft = n.isRead ? '4px solid var(--border)' : '4px solid #3b82f6';
                div.style.borderRadius = '0.5rem';
                div.innerHTML = `
                    <p style="color: var(--text-main);">${n.message}</p>
                    <small style="color: var(--text-muted);">${new Date(n.createdAt).toLocaleString()}</small>
                    ${!n.isRead ? `<button onclick="markRead('${n._id}')" class="btn btn-secondary" style="padding: 0.2rem 0.5rem; font-size: 0.7rem; margin-top: 0.5rem;">Mark Read</button>` : ''}
                `;
                list.appendChild(div);
            });

            const badge = document.getElementById('notif-badge');
            if (unreadCount > 0) {
                badge.textContent = unreadCount;
                badge.style.display = 'block';
            } else {
                badge.style.display = 'none';
            }
        }
    }

    window.markRead = async (id) => {
        await fetch(`${API_URL}/notifications/${id}/read`, { method: 'PUT' });
        loadNotifications();
    }

    // Profile Form
    document.getElementById('profile-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const msg = document.getElementById('prof-msg');
        const name = document.getElementById('prof-name').value;
        const phone = document.getElementById('prof-phone').value;
        const address = document.getElementById('prof-address').value;

        try {
            const res = await fetch(`${API_URL}/auth/${user._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, phone, address })
            });
            const data = await res.json();
            if (res.ok) {
                localStorage.setItem('user', JSON.stringify(data.user));
                user = data.user;
                msg.textContent = 'Profile updated successfully!';
                msg.style.color = '#34d399';
                document.getElementById('user-name-display').textContent = user.name;
                document.getElementById('waste-address').value = user.address || '';
            }
        } catch (err) {
            msg.textContent = 'Error updating profile.';
            msg.style.color = '#ef4444';
        }
    });

    // Submit Form
    submissionForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const msg = document.getElementById('submit-msg');
        msg.textContent = 'Submitting...';
        msg.style.color = 'var(--text-muted)';

        const formData = new FormData();
        formData.append('userId', user._id);
        formData.append('wasteType', document.getElementById('waste-type').value);
        formData.append('weight', document.getElementById('waste-weight').value);
        formData.append('pickupAddress', document.getElementById('waste-address').value);
        formData.append('pickupTime', document.getElementById('waste-time').value);
        formData.append('photo', document.getElementById('waste-photo').files[0]);

        try {
            const res = await fetch(`${API_URL}/submissions`, {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            if (res.ok) {
                msg.textContent = 'Pickup requested successfully!';
                msg.style.color = '#34d399';
                submissionForm.reset();
                document.getElementById('photo-preview').style.display = 'none';
                loadHistory();
            } else {
                msg.textContent = data.error;
                msg.style.color = '#ef4444';
            }
        } catch (err) {
            msg.textContent = 'Server error.';
            msg.style.color = '#ef4444';
        }
    });

    loadStats();
    loadHistory();
    loadCenters();
    loadNotifications();
}

// --- Admin Logic ---
const adminTableBody = document.getElementById('admin-table-body');
if (adminTableBody) {
    
    // 1. Manage Pickups
    async function loadAdminSubmissions() {
        const res = await fetch(`${API_URL}/submissions`);
        if (res.ok) {
            const subs = await res.json();
            adminTableBody.innerHTML = '';
            subs.forEach(s => {
                const tr = document.createElement('tr');
                
                let actionBtns = '';
                if (s.status === 'pending') {
                    actionBtns = `
                        <button class="btn btn-primary" style="padding: 0.25rem 0.5rem; font-size: 0.8rem;" onclick="processSub('${s._id}', 'approve')">Approve</button>
                        <button class="btn btn-secondary" style="padding: 0.25rem 0.5rem; font-size: 0.8rem; border-color: #ef4444; color: #ef4444;" onclick="processSub('${s._id}', 'reject')">Reject</button>
                    `;
                } else if (s.status === 'approved') {
                    actionBtns = `
                        <button class="btn btn-primary" style="padding: 0.25rem 0.5rem; font-size: 0.8rem;" onclick="processSub('${s._id}', 'complete')">Mark Completed</button>
                    `;
                } else {
                    actionBtns = `<span style="color: var(--text-muted)">Finished</span>`;
                }

                tr.innerHTML = `
                    <td><b>${s.userId ? s.userId.name : 'Unknown'}</b><br><small>${s.userId ? s.userId.phone || s.userId.email : ''}</small></td>
                    <td><small><b>At:</b> ${new Date(s.pickupTime).toLocaleString()}<br><b>Loc:</b> ${s.pickupAddress}</small></td>
                    <td>${s.wasteType}<br><small>${s.weight} Kg</small><br><button class="btn btn-secondary" style="padding: 0.1rem 0.3rem; font-size: 0.7rem;" onclick="openPhoto('http://localhost:3000${s.photoUrl}')">Photo</button></td>
                    <td>
                        <span class="badge badge-${s.status}">${s.status.toUpperCase()}</span>
                    </td>
                    <td style="display: flex; gap: 0.5rem; flex-wrap: wrap;">${actionBtns}</td>
                `;
                adminTableBody.appendChild(tr);
            });
        }
    }

    window.processSub = async (id, action) => {
        try {
            const res = await fetch(`${API_URL}/submissions/${id}/${action}`, { method: 'PUT' });
            if (res.ok) {
                loadAdminSubmissions();
                loadAllUsers(); // Refresh stats immediately
            }
        } catch (err) {
            alert('Error processing submission');
        }
    }

    // 2. User Management
    async function loadAllUsers() {
        const res = await fetch(`${API_URL}/auth/all`);
        if (res.ok) {
            const users = await res.json();
            const tbody = document.getElementById('admin-users-body');
            tbody.innerHTML = '';
            
            let totalKg = 0;
            let totalCo2 = 0;

            users.forEach(u => {
                totalKg += u.totalKg;
                totalCo2 += u.co2Saved;

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${u.name}</td>
                    <td>${u.email}<br><small>${u.phone || 'No phone'}</small></td>
                    <td style="color: #34d399; font-weight: bold;">${u.totalKg.toFixed(1)}</td>
                    <td><span class="badge ${u.isBlocked ? 'badge-rejected' : 'badge-approved'}">${u.isBlocked ? 'BLOCKED' : 'ACTIVE'}</span></td>
                    <td style="display: flex; gap: 0.5rem;">
                        <button class="btn btn-secondary" style="padding: 0.2rem 0.5rem; font-size: 0.8rem;" onclick="toggleBlockUser('${u._id}', ${!u.isBlocked})">${u.isBlocked ? 'Unblock' : 'Block'}</button>
                        <button class="btn btn-secondary" style="padding: 0.2rem 0.5rem; font-size: 0.8rem; border-color: #ef4444; color: #ef4444;" onclick="deleteUser('${u._id}')">Delete</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });

            document.getElementById('admin-total-kg').textContent = totalKg.toFixed(1);
            document.getElementById('admin-total-co2').textContent = totalCo2.toFixed(1);
        }
    }

    window.toggleBlockUser = async (id, isBlocked) => {
        if(confirm(`Are you sure you want to ${isBlocked ? 'block' : 'unblock'} this user?`)) {
            await fetch(`${API_URL}/auth/${id}/block`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isBlocked })
            });
            loadAllUsers();
        }
    }

    window.deleteUser = async (id) => {
        if(confirm('Are you sure you want to permanently delete this user?')) {
            await fetch(`${API_URL}/auth/${id}`, { method: 'DELETE' });
            loadAllUsers();
        }
    }

    // Initialize Admin
    loadAdminSubmissions();
    loadAllUsers();
}
