// 1st param: (races, results, qualifying) Allows the user to decide what category data is retrived from.
// 2nd param: (int) The specific year to specify what season data should refer to. 

async function fetchSeasonData(table, year) {
  const apiUrl = 'https://www.randyconnolly.com/funwebdev/3rd/api/f1/' + table + '.php?season=' + year;
  const storageKey = table + year;
  const seasonData = localStorage.getItem(storageKey);
  console.log("Checking local storage...");
  if (seasonData) {
    console.log("Retrieved Data from Local Storage")
    return JSON.parse(seasonData);
  }

  try {
    // loading bar code here

    const response = await fetch(apiUrl)
    const jsonData = await response.json();
    localStorage.setItem(storageKey, JSON.stringify(jsonData));
    console.log("Retrived Data from API");

    //Hide loading bar code here
    return jsonData;
  } catch (error) {
    console.error("Error: ", error);
    return null;
  }
}

async function populateRaceTable(year) {
  const seasonData = await fetchSeasonData("races", year);
  if (seasonData) {
    const raceTable = document.getElementById("seasonRaceList");

    seasonData.forEach(race => {
      console.log(race.round);
      const tableRow = document.createElement("tr");
      // Rounds Column
      const roundCell = document.createElement("td");
      roundCell.textContent = race.round;
      tableRow.appendChild(roundCell);

      // Name Column
      const nameCell = document.createElement("td");
      nameCell.textContent = race.name;
      tableRow.appendChild(nameCell);
      
      // Button Column
      const buttonCell = document.createElement("td");
      const raceListButton = document.createElement("button");
      raceListButton.dataset.id = race.id;
      raceListButton.textContent = "search";
      buttonCell.appendChild(raceListButton);
      tableRow.appendChild(buttonCell);

      raceTable.appendChild(tableRow);
      // const 
      // tableRow.appendChild(document.createElement("td").textContent(race.round));
    });
  }


  
}


const seasonData = fetchSeasonData("races", 2023);
console.log(seasonData);
document.addEventListener("DOMContentLoaded", () => {
  // Element of Home Page
  const homeBody = document.querySelector(".homeBody");
  
  const searchBtn = document.getElementById("searchBtn"); //Search button
  const yearSelectBar = document.getElementById("yearSelectBar"); //Select list of years

  const dashboardBody = document.querySelector(".dashboardBody");


  if (searchBtn && yearSelectBar) {
    searchBtn.addEventListener("click", () => {
      console.log(yearSelectBar.value); //temp
      homeBody.classList.toggle("hidden");

      dashboardBody.classList.toggle("hidden");
      populateRaceTable(yearSelectBar.value);

    });
  } else {
    console.error("Search button or year select bar not found in the DOM.");
  }
}); 
