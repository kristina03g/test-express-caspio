async function fetchUsers() {
    try {
        const response = await fetch('http://localhost:3000/users');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        usersList = await response.json();
        displayUsers(usersList);
    } catch (error) {
        console.error('Error fetching users:', error);
    }
}

function displayUsers(users) {
    const tableBody = document.querySelector('.users-table tbody');
    tableBody.innerHTML = '';
    users.forEach(user => {
        const row = document.createElement('tr');
        const dateOfBirth = new Date(user.DateOfBirth);
        const addedTimestamp = new Date(user.AddedTimestamp);
        const updatesTimestamp = new Date(user.UpdatesTimestamp);
        row.innerHTML = `
            <td>${user.UserID}</td>
            <td>${user.FirstName}</td>
            <td>${user.LastName}</td>
            <td>${dateOfBirth.toISOString().split('T')[0]}</td>
            <td>${user.Country}</td>
            <td>${user.City}</td>
            <td>${user.ZipCode}</td>
            <td>${user.Address}</td>
            <td>${addedTimestamp.toISOString().split('T')[0]}</td>
            <td>${updatesTimestamp.toISOString().split('T')[0]}</td>
        `;
        tableBody.appendChild(row);
    });
}

function filterUsers() {
    const filterCriteria = document.querySelector('input[name="options"]:checked');
    const filterValue = document.getElementById('filterInput').value.trim().toLowerCase();
    if (!filterCriteria) {
        displayUsers(usersList);
        return;
    }
    const selectedCriteria = filterCriteria.value;
    const filteredUsers = usersList.filter(user => {
        let userValue = String(user[selectedCriteria] || '').toLowerCase();
        if (selectedCriteria === 'DateOfBirth') {
            userValue = new Date(user.DateOfBirth).toISOString().split('T')[0];
        }
        return userValue.startsWith(filterValue);
    });
    displayUsers(filteredUsers);
}

function sortUsers(column) {
    usersList.sort((a, b) => a[column].localeCompare(b[column]));
    displayUsers(usersList);
}

let usersList = []

const filterButton = document.getElementById('filterButton');
const filterMenuContent = document.getElementById('filterContent');
document.getElementById('filterInput').addEventListener('input', filterUsers);
document.querySelectorAll('input[name="options"]').forEach(radio => {
    radio.addEventListener('change', filterUsers);
});

filterButton.addEventListener('click', () => {
    if (!filterMenuContent.style.display || filterMenuContent.style.display === 'none') {
        filterMenuContent.style.display = 'flex'
    } else {
        filterMenuContent.style.display = 'none'
        const radioButtons = document.querySelectorAll('input[name="options"]');
        radioButtons.forEach(radio => {
            radio.checked = false;
        });
        document.getElementById('filterInput').value = '';
        fetchUsers();
    }
});

document.addEventListener('DOMContentLoaded', fetchUsers);