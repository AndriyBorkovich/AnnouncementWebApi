const uri = 'api/announcements';
let announcementsList = [];
window.addEventListener("load", (event) => {
    getItems();
});
function getItems() {
    fetch(uri)
        .then(response => response.json())
        .then(data => showItems(data))
        .catch(error => console.error('Unable to get items.', error));
}

document.getElementById("add-form").addEventListener('submit', addItem);
function addItem() {
    //event.preventDefault();
    const addTitleTextbox = document.getElementById('add-title');
    const addDescriptionTextbox = document.getElementById('add-description');
    const addDateTextbox = document.getElementById('add-date');
    const item = {
        title: addTitleTextbox.value.trim(),
        description: addDescriptionTextbox.value.trim(),
        dateAdded: formatDate(addDateTextbox.value),
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
            addTitleTextbox.value = '';
            addDescriptionTextbox.value = '';
            addDateTextbox.value = '';
        })
        .catch(error => console.error('Unable to add item.', error));
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
        .catch(error => console.error('Unable to delete item.', error));
}

function displayEditForm(id) {
    const item = announcementsList.find(item => item.id === id);

    document.getElementById('edit-id').value = item.id;
    document.getElementById('edit-title').value = item.title;
    document.getElementById('edit-description').value = item.description;
    document.getElementById('edit-date').value = item.dateAdded;
    document.getElementById('editForm').style.display = 'block';
}

document.getElementById("edit-form").addEventListener("submit", updateItem);
function updateItem() {
    const itemId = document.getElementById('edit-id').value;
    const item = {
        id: parseInt(itemId, 10),
        title: document.getElementById('edit-title').value.trim(),
        description: document.getElementById('edit-description').value.trim(),
        dateAdded: document.getElementById('edit-date').value.trim()
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

function showCount(itemCount) {
    const name = (itemCount === 1) ? 'announcement' : 'announcements';
    document.getElementById('counter').innerText = `${itemCount} ${name}`;
}

// display in UI
function showItems(data) {
    console.log(data);
    const tBody = document.getElementById('announcements');
    tBody.innerHTML = '';

    showCount(data.length);

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