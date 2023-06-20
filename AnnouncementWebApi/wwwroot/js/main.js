const uri = 'api/announcements';
let announcementsList = [];
window.addEventListener("load", () => {
    getItems();
});

function getItems() {
    fetch(uri)
        .then(response => response.json())
        .then(data => showItems(data))
        .catch(error => console.error('Unable to get items.', error));
}
function validateInput(title, description, date) {
    if (title === '') {
        alert('Title is required.');
        return;
    }

    if (description === '') {
        alert('Description is required.');
        return;
    }

    if (date === '') {
        alert('Date is required.');
        return;
    }

    if (!isValidDate(date)) {
        alert('Invalid date format. Please provide a valid date.');
    }
}

function isValidDate(dateString) {
    console.log(dateString);
    let parts = dateString.split(' ');
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(parts[0])) {
        alert("Format: YYYY-MM-DD")
        return false;
    }

    // Validate the actual date values
    const dateParts = parts[0].split('-');
    const year = parseInt(dateParts[0], 10);
    const month = parseInt(dateParts[1], 10);
    const day = parseInt(dateParts[2], 10);

    // Create a new Date object and check if the values are valid
    const date = new Date(year, month - 1, day);

    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/;
    if (!timeRegex.test(parts[1])) {
        return false;
    }

    // Validate the actual time values
    const timeParts = parts[1].split(':');
    const hours = parseInt(timeParts[0], 10);
    const minutes = parseInt(timeParts[1], 10);
    const seconds = parseInt(timeParts[2], 10);

    return (
        hours >= 0 && hours <= 23 &&
        minutes >= 0 && minutes <= 59 &&
        seconds >= 0 && seconds <= 59
    ) && (
        date.getFullYear() === year &&
        date.getMonth() === month - 1 &&
        date.getDate() === day
    );
}

document.getElementById("add-form").addEventListener('submit', addItem);
function addItem() {
    const titleInput = document.getElementById('add-title').value.trim();
    const descriptionInput = document.getElementById('add-description').value.trim();
    const dateInput = document.getElementById('add-date').value;
    validateInput(titleInput, descriptionInput, dateInput);
    const item = {
        title: titleInput,
        description: descriptionInput,
        dateAdded: formatDate(dateInput)
    };

    let requestBody = JSON.stringify(item);
    console.log("User entered: ", requestBody);

    fetch(uri, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: requestBody
    })
        .then(response => response.json())
        .then((data) => {
            console.log(data)
            getItems();
            document.getElementById('add-title').value = '';
            document.getElementById('add-description').value = '';
            document.getElementById('add-date').value = '';
        })
        .catch(error => alert('Unable to add item.' + error));
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const options = {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    };

    const formattedDate = date.toLocaleString('en-US', options)
        .replace(/,/g, '')
        .replace(/ /g, 'T')
        .replace(/\//g, '-')
        .replace(/(\d{2})-(\d{2})-(\d{4})/, '$3-$1-$2');

    return formattedDate + 'Z';
}

function deleteItem(id) {
    fetch(`${uri}/${id}`, {
        method: 'DELETE'
    })
        .then(() => getItems())
        .catch(error => alert('Unable to delete item.' + error));
}

function displayEditForm(id) {
    const item = announcementsList.find(item => item.id === id);

    document.getElementById('edit-id').value = item.id;
    document.getElementById('edit-title').value = item.title;
    document.getElementById('edit-description').value = item.description;
    document.getElementById('edit-date').value = item.dateAdded.replace('T', ' ').replace('Z', '');
    document.getElementById('editForm').style.display = 'block';
    showSimilar(item.id);
}

document.getElementById("edit-form").addEventListener("submit", updateItem);
function updateItem() {
    const itemId = document.getElementById('edit-id').value;
    const titleInput = document.getElementById('edit-title').value.trim();
    const descriptionInput = document.getElementById('edit-description').value.trim();
    const dateInput = document.getElementById('edit-date').value;
    const item = {
        id: parseInt(itemId, 10),
        title: titleInput,
        description: descriptionInput,
        dateAdded: dateInput
    };

    fetch(`${uri}/${itemId}`, {
        method: 'PUT',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(item)
    })
    .then(() => getItems())
    .catch(error => console.error('Unable to update item.', error));

    closeInput();

    return false;
}

function closeInput() {
    document.getElementById('editForm').style.display = 'none';
}

function showCount(word,itemCount) {
    const name = (itemCount === 1) ? 'announcement' : 'announcements';
    document.getElementById('counter').innerText = `${itemCount} ${word} ${name}`;
}

// display in UI
function showItems(data) {
    console.log(data);
    const tBody = document.getElementById('announcements');
    tBody.innerHTML = '';

    showCount("",data.length);

    const button = document.createElement('button');

    data.forEach(item => {

        let editButton = button.cloneNode(false);
        editButton.innerText = 'Edit';
        editButton.setAttribute('onclick', `displayEditForm(${item.id})`);

        let deleteButton = button.cloneNode(false);
        deleteButton.innerText = 'Delete';
        deleteButton.setAttribute('onclick', `deleteItem(${item.id})`);

        let tr = tBody.insertRow();

        let td1 = tr.insertCell(0);
        let textNode1 = document.createTextNode(item.title);
        td1.appendChild(textNode1);

        let td2 = tr.insertCell(1);
        let textNode2 = document.createTextNode(item.description);
        td2.appendChild(textNode2);

        let td3 = tr.insertCell(2);
        let textNode3 = document.createTextNode(item.dateAdded.replace('T', ' ').replace('Z', ''));
        td3.appendChild(textNode3);

        let td4 = tr.insertCell(3);
        td4.appendChild(editButton);

        let td5 = tr.insertCell(4);
        td5.appendChild(deleteButton);
    });

    announcementsList = data;
}

// get top 3 similar announcements
function showSimilar(id) {
    fetch(`${uri}/top3/${id}`, {
        method: 'GET'
    })
    .then(response => response.json())
        .then(data => {
            showItems(data);
            showCount("Similar", data.length);
        })
    .catch(error => console.error('Unable to get items.', error));
}
    
