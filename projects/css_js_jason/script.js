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
// https://www.geeksforgeeks.org/how-to-implement-a-filter-for-objects-in-javascript/ was used to help filter using Object.entries
// this function will display prizes and laureates
function showPrizes(prizes1, laureates1) {  
    const contentDiv = document.getElementById('countries');  //here we can read the content from div const is used to declare variables that cannot be reassigned
    const prizeCounts = {};

    const prizes = Object.entries(prizes1); //this will read all the prizes
    const laureates = Object.entries(laureates1);  // likewise this will read all the laurets

    let pr = Object.fromEntries(prizes);  //here we will get the prize and lauret objects 
    let la = Object.fromEntries(laureates);

    for (let i = 0; i < pr.prizes.length; i++) {  //this code will allow us to read all the prize and assign them to the prize variable
        let prize = pr.prizes[i];
        let leng = 0; // define a local variable to store the number of laurets

        if (Array.isArray(prize.laureates) && prize.laureates.length > 0) {  //check to see if prize.laurets is an array then store in variable
            leng = prize.laureates.length;
        }

        for (let j = 0; j < leng; j++) {  // this next for loop will read all the laureates and assinging to the laureates variable
            let laureate = prize.laureates[j];
            const laureateeach = la.laureates.find(readlau => readlau.id === laureate.id);

            if (laureateeach) {  // this will check to see if the laur are not null or undefined
                const country = laureateeach.bornCountry || laureateeach.bornCountryCode || "Unknown";
                if (country === "Unknown") {  //this will ignore the laur with unknown country as stated in class
                    continue;
                }
                prizeCounts[prize.category] = prizeCounts[prize.category] || {}; //this allows us to read cat from prize and assign it to the dif cat variable of prizeCount
                prizeCounts[prize.category][country] = (prizeCounts[prize.category][country] || 0) + 1;
            }
        }
    }

    // this will allow us to then display the top 5 coun per cat
    for (const [category, countries] of Object.entries(prizeCounts)) {
        const sortedCountries = Object.entries(countries)
            .sort(([, a], [, b]) => b - a) // sorting count in dec order
            .slice(0, 5);

        // here we created a div element and added prize-cat class to it
        const categoryDiv = document.createElement('div');  
        categoryDiv.classList.add('prize-category'); 

        const categoryTitle = document.createElement('h2');
        categoryTitle.textContent = `${category}`;
        // https://developer.mozilla.org/en-US/docs/Web/API/Element/append was used to help with appending
        categoryDiv.appendChild(categoryTitle);  // we must append catTitle to CatDiv we just created

        //https://www.w3schools.com/js/js_string_templates.asp to help with string formatting `` 
        const countryList = document.createElement('ul');
        sortedCountries.forEach(([country, count]) => {
            const listItem = document.createElement('li');
            //this will allow us to use a button to learn more
            listItem.innerHTML = `${country} (${count}) <br/> <button onclick="showLaureatesForCatandCountry('${category}', '${country}')" class="btn-laureates">Show Laureates</button>`;
            countryList.appendChild(listItem);
        });

        categoryDiv.appendChild(countryList);
        contentDiv.appendChild(categoryDiv);
    }
}

// this function will show laureates for cat and count must be outside the previous function
function showLaureatesForCatandCountry(category, country) {
    const xhrLaureates = new XMLHttpRequest();
    xhrLaureates.open('GET', './laureates.json', true);
    xhrLaureates.onreadystatechange = function () {
        if (xhrLaureates.readyState === 4 && xhrLaureates.status === 200) {
            const laureates1 = JSON.parse(xhrLaureates.responseText);
            const content = document.getElementById('countries');
            content.classList.add('bottom-border');

            const contentDiv = document.getElementById('laureates');
            contentDiv.innerHTML = '';  // this allows us to clear the previous content

            const contentDiv3 = document.getElementById('biography');
            contentDiv3.innerHTML = '';

            //https://stackoverflow.com/questions/8508262/how-to-select-td-of-the-table-with-javascript used to help with table elements
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

            // this will read tbody from the table element and assign to the tbody variable
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
                        <td><button onclick="showLaureatesDetails(${laureate.id})" class="btn-details">Show Details</button></td>
                    `;
                    tbody.appendChild(row); //append the row to tbody
                });

            contentDiv.appendChild(table); //append the table to tbody
        } else if (xhrLaureates.readyState === 4) {
            console.error('Error loading laureates:', xhrLaureates.status);
        }
    };
    xhrLaureates.send();
}

// this function will allows us to show more info for each laurete winner
function showLaureatesDetails(laureateId) {
    const xhrLaureates = new XMLHttpRequest();
    xhrLaureates.open('GET', './laureates.json', true);
    xhrLaureates.onreadystatechange = function () {
        if (xhrLaureates.readyState === 4 && xhrLaureates.status === 200) {
            const laureates1 = JSON.parse(xhrLaureates.responseText);
            const laureates = Object.entries(laureates1);
            let la = Object.fromEntries(laureates);
            const laureate = la.laureates.find(l => l.id == laureateId);

            const contentDiv = document.getElementById('biography');
            contentDiv.innerHTML = '';

            if (laureate) { //must check if the laureate is valid
                const bioDiv = document.createElement('div');
                bioDiv.classList.add('biography-box')
                const prize = laureate.prizes[0]; //read the first prize and assign to prize varaibel
                const age = prize.year - parseInt(laureate.born.substring(0, 4), 10); // this helps to calc the age of the laureate

                // is used to create the bio sentence 
                bioDiv.innerHTML = ` 
                    <h2>Biography of ${laureate.firstname} ${laureate.surname}</h2>
                    <p>${prize.year}, at the age of ${age}, ${laureate.firstname} ${laureate.surname} received a Nobel prize in ${prize.category} in recognition of ${prize.motivation}.</p>
                `;
                contentDiv.appendChild(bioDiv);
            } else {
                contentDiv.innerHTML = '<p>No details found.</p>'; // this is incase no details fround when displaying the message
            }
        } else if (xhrLaureates.readyState === 4) {
            console.error('Error loading laureates:', xhrLaureates.status);
        }
    };
    xhrLaureates.send();
}
