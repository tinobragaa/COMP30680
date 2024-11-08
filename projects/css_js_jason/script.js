let prizes, laureates;
document.addEventListener('DOMContentLoaded', () => {
    const xhrPrizes = new XMLHttpRequest();
    xhrPrizes.open('GET', './prizes.json', true);
    xhrPrizes.onreadystatechange = function () {
        if (xhrPrizes.readyState === 4 && xhrPrizes.status === 200) {
            prizes = JSON.parse(xhrPrizes.responseText);

            const xhrLaureates = new XMLHttpRequest();
            xhrLaureates.open('GET', './laureates.json', true);
            xhrLaureates.onreadystatechange = function () {
                if (xhrLaureates.readyState === 4 && xhrLaureates.status === 200) {
                    laureates = JSON.parse(xhrLaureates.responseText);
                    showPrizes(prizes, laureates);
                } else if (xhrLaureates.readyState === 4) {
                    console.error('Error loading laureates:', xhrLaureates.status);
                }
            };
            xhrLaureates.send();
        } else if (xhrPrizes.readyState === 4) {
            console.error('Error loading prizes:', xhrPrizes.status);
        }
    };
    xhrPrizes.send();
});

function showPrizes(prizes1, laureates1) {
    const contentDiv = document.getElementById('content');
    const prizeCounts = {};

    const prizes = Object.entries(prizes1);
    const laureates = Object.entries(laureates1);

    let pr = Object.fromEntries(prizes);
    let la = Object.fromEntries(laureates);

    for (let i = 0; i < pr.prizes.length; i++) {
        let prize = pr.prizes[i];
        let leng = 0;

        if (Array.isArray(prize.laureates) && prize.laureates.length > 0) {
            leng = prize.laureates.length;
        }

        for (let j = 0; j < leng; j++) {
            let laureate = prize.laureates[j];
            const laureateeach = la.laureates.find(readlau => readlau.id === laureate.id);

            if (laureateeach) {
                const country = laureateeach.bornCountry || laureateeach.bornCountryCode || "Unknown";
                if (country === "Unknown") {
                    continue;
                }
                prizeCounts[prize.category] = prizeCounts[prize.category] || {};
                prizeCounts[prize.category][country] = (prizeCounts[prize.category][country] || 0) + 1;
            }
        }
    }

    for (const [category, countries] of Object.entries(prizeCounts)) {
        const sortedCountries = Object.entries(countries)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5);

        const categoryDiv = document.createElement('div');
        categoryDiv.classList.add('prize-category');

        const categoryTitle = document.createElement('h2');
        categoryTitle.textContent = `${category}`;
        categoryDiv.appendChild(categoryTitle);

        const countryList = document.createElement('ul');
        sortedCountries.forEach(([country, count]) => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `${country} (${count}) <br/> <button onclick="showLaureatesForCatandCountry('${category}', '${country}')" class="btn">Show Laureates</button>`;
            countryList.appendChild(listItem);
        });

        categoryDiv.appendChild(countryList);
        contentDiv.appendChild(categoryDiv);
    }
}

function showLaureatesForCatandCountry(category, country) {
    const xhrLaureates = new XMLHttpRequest();
    xhrLaureates.open('GET', './laureates.json', true);
    xhrLaureates.onreadystatechange = function () {
        if (xhrLaureates.readyState === 4 && xhrLaureates.status === 200) {
            const laureates1 = JSON.parse(xhrLaureates.responseText);
            const content = document.getElementById('content');
            content.classList.add('bottom-border');

            const contentDiv = document.getElementById('content2');
            contentDiv.innerHTML = '';

            const contentDiv3 = document.getElementById('content3');
            contentDiv3.innerHTML = '';

            const table = document.createElement('table');
            table.classList.add('laureates-table');
            table.innerHTML = `
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Full Name</th>
                        <th>Date Awarded</th>
                        <th>Category</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody></tbody>
            `;

            const tbody = table.querySelector('tbody');
            const laureates = Object.entries(laureates1);
            let la = Object.fromEntries(laureates);

            la.laureates.filter(laureate => laureate.prizes.some(prize => prize.category === category
                && (laureate.bornCountry === country || laureate.bornCountryCode === country)))
                .forEach(laureate => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${laureate.id}</td>
                        <td>${laureate.firstname} ${laureate.surname}</td>
                        <td>${laureate.prizes.find(prize => prize.category === category).year}</td>
                        <td>${category}</td>
                        <td><button onclick="showLaureatesDetails(${laureate.id})" class="btn">Show Details</button></td>
                    `;
                    tbody.appendChild(row);
                });

            contentDiv.appendChild(table);
        } else if (xhrLaureates.readyState === 4) {
            console.error('Error loading laureates:', xhrLaureates.status);
        }
    };
    xhrLaureates.send();
}

function showLaureatesDetails(laureateId) {
    const xhrLaureates = new XMLHttpRequest();
    xhrLaureates.open('GET', './laureates.json', true);
    xhrLaureates.onreadystatechange = function () {
        if (xhrLaureates.readyState === 4 && xhrLaureates.status === 200) {
            const laureates1 = JSON.parse(xhrLaureates.responseText);
            const laureates = Object.entries(laureates1);
            let la = Object.fromEntries(laureates);
            const laureate = la.laureates.find(l => l.id == laureateId);

            const contentDiv = document.getElementById('content3');
            contentDiv.innerHTML = '';

            if (laureate) {
                const bioDiv = document.createElement('div');
                const prize = laureate.prizes[0];
                const age = prize.year - parseInt(laureate.born.substring(0, 4), 10);

                bioDiv.innerHTML = `
                    <h2>Biography of ${laureate.firstname} ${laureate.surname}</h2>
                    <p>${prize.year}, at the age of ${age}, ${laureate.firstname} ${laureate.surname} received a Nobel prize in ${prize.category} in recognition of ${prize.motivation}</p>
                `;
                contentDiv.appendChild(bioDiv);
            } else {
                contentDiv.innerHTML = '<p>No details found.</p>';
            }
        } else if (xhrLaureates.readyState === 4) {
            console.error('Error loading laureates:', xhrLaureates.status);
        }
    };
    xhrLaureates.send();
}