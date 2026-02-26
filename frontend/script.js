// set up the image gallery of buildings
const galleryEl = document.querySelector('.gallery');

fetch('./data.json')
    .then(res => res.json())
    .then(data => {
        data.forEach(element => {
            const cardEl = document.createElement('div');
            cardEl.classList.add('card');
            cardEl.innerHTML = `            
                <img src="./assets/${element.building_picture}">
                <div class="status-tag">
                <span class="dot"></span>
                ${element.rooms_available} rooms available 
                </div>
                <div class="room-tag">
                    ${element.name}
                </div>
            `;
            galleryEl.appendChild(cardEl);
        });
    })


// component state management
const OPEN_DOOR_LOGO = "assets/freeRoomsLogo.png";
const CLOSED_DOOR_LOGO = "assets/freeroomsDoorClosed.png"

const doorEl = document.querySelector('.door');

doorEl.addEventListener('click', handleClick);

function handleClick()  {
    var isOpen = doorEl.getAttribute('src') === OPEN_DOOR_LOGO;
    doorEl.setAttribute('src', isOpen ? CLOSED_DOOR_LOGO : OPEN_DOOR_LOGO);
}