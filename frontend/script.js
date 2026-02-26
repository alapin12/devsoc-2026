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