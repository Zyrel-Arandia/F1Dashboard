let currentRaceButton = null; // Tracks the button of the currently selected race

// 1st param: (races, results, qualifying) Allows the user to decide what category data is retrived from.
// 2nd param: (int) The specific year to specify what season data should refer to. 

async function fetchSeasonData(table, year) {
  const apiUrl = 'https://www.randyconnolly.com/funwebdev/3rd/api/f1/' + table + '.php?season=' + year;
  const storageKey = table + year;
  const seasonData = localStorage.getItem(storageKey);
  console.log(`Checking for ` + table + ` local storage...`);
  if (seasonData) {
    console.log("Retrieved Data from Local Storage");
    const JSONseasonData = JSON.parse(seasonData);
    return JSONseasonData;
  } else {
    console.log("Not in Local Storage");
  }

  try {
    // loading bar code here

    const response = await fetch(apiUrl)
    const jsonData = await response.json();
    localStorage.setItem(storageKey, JSON.stringify(jsonData));
    console.log("Retrived Data from API");
    // console.log(jsonData);
    //Hide loading bar code here
    return jsonData;
  } catch (error) {
    console.error("Error: ", error);
    return null;
  }
}


//Populates table specific to the side column of the dashboard page 
async function populateRaceTable(year) {
  const raceData = await fetchSeasonData("races", year);
  if (raceData) {
    const raceTable = document.getElementById("seasonRaceList");

    raceData.forEach(race => {
      const tableRow = document.createElement("tr");
      // Rounds Column
      const roundCell = document.createElement("td");
      roundCell.textContent = race.round;
      // roundCell.classList.add("textCentered");
      tableRow.appendChild(roundCell);

      // Name Column
      const nameCell = document.createElement("td");
      nameCell.textContent = race.name;
      tableRow.appendChild(nameCell);

      // Button Column
      const buttonCell = document.createElement("td");
      const raceListButton = document.createElement("button");
      raceListButton.dataset.id = race.id;
      raceListButton.dataset.year = race.year;
      raceListButton.textContent = "search";
      buttonCell.appendChild(raceListButton);
      tableRow.appendChild(buttonCell);


      //Event listener for button
      //Loads content in the main section of the screen
      raceListButton.addEventListener("click", (e) => {
        currentRaceButton = e.target;
        populateHeader(e.target);
        populateQualifyingTable(e.target, "position");
        populateResultsTable(e.target, "position") //WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW
      })

      raceTable.querySelector("tbody").appendChild(tableRow);
    });
  }
}

// Fills in the header in the mainContent div 
// Race, circuit name, round, date, wiki link 
async function populateHeader(button) {
  console.log(button);
  //Obtaining specified race through race id from button dataset
  const raceId = button.dataset.id;
  const raceData = await fetchSeasonData("races", button.dataset.year);

  const raceInfo = raceData.find(p => p.id == raceId);
  //Adding info to the html

  //Race Name
  const raceNameSubHeader = document.getElementById("raceNameSubHeader");
  raceNameSubHeader.textContent = raceInfo.name;

  //Circuit
  const circuitSubHeader = document.getElementById("circuitNameSubHeader");
  circuitSubHeader.textContent = raceInfo.circuit.name;

  //Round
  const roundInfo = document.getElementById("roundInfo");
  roundInfo.textContent = `Round ` + raceInfo.round;

  //date
  const dateInfo = document.getElementById("dateInfo");
  dateInfo.textContent = raceInfo.date;


  //Wiki link
  const wikiLink = document.getElementById("wikiLink");
}

// Param 1 Button represents the element that triggered the event, allowing data from the side column to be shared for the function
// Param 2 sortCategory is the order of how the table is sorted based on the header of the columns 
// (Accepts "position", "driver", "constructor", "q1", "q2", and "q3")
async function populateQualifyingTable(button, sortCategory) {

  //Empties table 
  emptyTable(qualifyingTable);
  //List of all qualifying racers within a year
  const qualifyingData = await fetchSeasonData("qualifying", button.dataset.year);

  //List of qualifying racers of a specific race 
  let qualifyingInfo = qualifyingData.filter((qualifier) => qualifier.race.id == button.dataset.id);
  if (sortCategory) {
    if (sortCategory == "driver") {
      qualifyingInfo = qualifyingInfo.sort((a, b) => {
        if (a["driver"]["forename"] < b["driver"]["forename"]) return -1;
        if (a["driver"]["forename"] > b["driver"]["forename"]) return 1;
        return 0;
      });
    } else if (sortCategory == "constructor") {
      qualifyingInfo = qualifyingInfo.sort((a, b) => {
        if (a["constructor"]["name"] < b["constructor"]["name"]) return -1;
        if (a["constructor"]["name"] > b["constructor"]["name"]) return 1;
        return 0;
      });
    } else {
      qualifyingInfo = qualifyingInfo.sort((a, b) => {
        const valueA = a[sortCategory];
        const valueB = b[sortCategory];

        // Handle null values: move them to the bottom
        if (valueA === "" && valueB !== "") return 1;
        if (valueA !== "" && valueB === "") return -1;

        // Regular sorting for non-null values
        if (valueA < valueB) return -1;
        if (valueA > valueB) return 1;
        return 0;
      });
    }
  }

  //Creates table rows for qualifying tables 
  qualifyingInfo.forEach((qualifier) => {
    const tableRow = document.createElement("tr");

    //Position cell
    const positionCell = document.createElement("td");
    positionCell.textContent = qualifier.position;
    positionCell.classList.add("textCentered");
    tableRow.appendChild(positionCell);

    //Name cell
    const nameCell = document.createElement("td");
    nameCell.textContent = qualifier.driver.forename + ` ` + qualifier.driver.surname;
    nameCell.classList.add("darkenOnHover");
    tableRow.appendChild(nameCell);

    //Constructor cell
    const constructorCell = document.createElement("td");
    constructorCell.textContent = qualifier.constructor.name;
    constructorCell.classList.add("darkenOnHover");
    tableRow.appendChild(constructorCell);

    //Q1 cell
    const Q1Cell = document.createElement("td");
    Q1Cell.textContent = qualifier.q1;
    Q1Cell.classList.add("textCentered");
    tableRow.appendChild(Q1Cell);
    
    //Q2 cell
    const Q2Cell = document.createElement("td");
    Q2Cell.textContent = qualifier.q2;
    Q2Cell.classList.add("textCentered");

    tableRow.appendChild(Q2Cell);
    
    //Q3 cell
    const Q3Cell = document.createElement("td");
    Q3Cell.textContent = qualifier.q3;
    Q3Cell.classList.add("textCentered");
    tableRow.appendChild(Q3Cell);

    //Inserts all table row full of table data into the table body 
    const qualifyingTableBody = qualifyingTable.querySelector("tbody");
    qualifyingTableBody.appendChild(tableRow);
  })

  //Creates event listeners for the column headers 
  if (!columnListenersSet) {
    setupQualifyingColumnSorting();
    columnListenersSet = true; //Confirms columns lisenters have been set 
  }

}

//Creates event listeners for columns headers for Results table 
function setupResultsColumnSorting() {
  const columns = [
    { id: "resultsPositionCell", sortCategory: "position" },
    { id: "resultsNameCell", sortCategory: "driver" },
    { id: "resultsConstructorCell", sortCategory: "constructor" },
    { id: "resultsLapsCell", sortCategory: "laps" },
    { id: "resultsPointsCell", sortCategory: "points" },
  ];

  columns.forEach(({ id, sortCategory }) => {
    const columnElement = document.getElementById(id);
    columnElement.replaceWith(columnElement.cloneNode(true)); // Remove old listeners
    const newColumnElement = document.getElementById(id);

    newColumnElement.addEventListener("click", () => {
      if (currentRaceButton) {
        console.log("what");
        populateResultsTable(currentRaceButton, sortCategory); // Use the global variable
      } else {
        console.error("No race selected. Cannot sort.");
      }
    });
  });
}



function setupQualifyingColumnSorting() {
  const columns = [
    { id: "positionColumn", sortCategory: "position" },
    { id: "nameColumn", sortCategory: "driver" },
    { id: "constructorColumn", sortCategory: "constructor" },
    { id: "q1Column", sortCategory: "q1" },
    { id: "q2Column", sortCategory: "q2" },
    { id: "q3Column", sortCategory: "q3" },
  ];

  columns.forEach(({ id, sortCategory }) => {
    const columnElement = document.getElementById(id);
    columnElement.replaceWith(columnElement.cloneNode(true)); // Remove old listeners
    const newColumnElement = document.getElementById(id);

    newColumnElement.addEventListener("click", () => {
      if (currentRaceButton) {
        populateQualifyingTable(currentRaceButton, sortCategory); // Use the global variable
      } else {
        console.error("No race selected. Cannot sort.");
      }
    });
  });
}



async function populateResultsTable(button, sortCategory) {
  // Reference the table and clear existing rows
  const resultsTable = document.getElementById("resultsTable");
  const resultsTableBody = resultsTable.querySelector("tbody");
  resultsTableBody.innerHTML = ""; // Clear previous rows

  // Fetch results data for a specific race
  const raceId = button.dataset.id;
  const resultsData = await fetchSeasonData("results", button.dataset.year);

  //Filter data to a specific race 
  let resultsInfo = resultsData.filter((result) => result.race.id == button.dataset.id);
  // Sort data if a category is specified
  if (sortCategory) {
    resultsInfo.sort((a, b) => {
      const valueA = getValueForSort(a, sortCategory);
      const valueB = getValueForSort(b, sortCategory);

      if (valueA === "" && valueB !== "") return 1; // Empty values go to the bottom
      if (valueA !== "" && valueB === "") return -1;
      if (valueA < valueB) return -1;
      if (valueA > valueB) return 1;
      return 0;
    });
  }

  // Populate the table rows with sorted data
  resultsInfo.forEach((result) => {
    const tableRow = document.createElement("tr");

    // Create cells for position, name, constructor, laps, and points
    const positionCell = document.createElement("td");
    positionCell.textContent = result.position || "N/A";
    tableRow.appendChild(positionCell);

    const nameCell = document.createElement("td");
    nameCell.textContent = `${result.driver.forename} ${result.driver.surname}`;
    nameCell.classList = "darkenOnHover";
    tableRow.appendChild(nameCell);

    const constructorCell = document.createElement("td");
    constructorCell.textContent = result.constructor.name;
    constructorCell.classList = "darkenOnHover";
    tableRow.appendChild(constructorCell);

    const lapsCell = document.createElement("td");
    lapsCell.textContent = result.laps || "N/A";
    tableRow.appendChild(lapsCell);

    const pointsCell = document.createElement("td");
    pointsCell.textContent = result.points || "N/A";
    tableRow.appendChild(pointsCell);

    // Append the row to the table body
    resultsTableBody.appendChild(tableRow);
  });

  // Set up sorting on column headers
  setupResultsColumnSorting(button);
}

// Helper function to get the value for sorting
function getValueForSort(result, sortCategory) {
  switch (sortCategory) {
    case "position":
      return result.position || "";
    case "driver":
      return `${result.driver.forename} ${result.driver.surname}` || "";
    case "constructor":
      return result.constructor.name || "";
    case "laps":
      return result.laps || "";
    case "points":
      return result.points || "";
    default:
      return "";
  }
}

function emptyTable(tableElement) {
  const tableBody = tableElement.querySelector("tbody");
  tableBody.innerHTML = '';
}

function fillSelectOptions() {

  const startYear = 2023;
  const endYear = 1950;
  for (let year = startYear; year >= endYear; year--) {
    const option = document.createElement('option');
    option.value = year; // Set the value of the option
    option.textContent = year; // Set the display text of the option
    yearSelectBar.appendChild(option); // Append the option to the <select>
  }
}

document.addEventListener("DOMContentLoaded", () => {

  fillSelectOptions()
  // Element of Home Page
  const homeBody = document.querySelector(".homeBody");

  const searchBtn = document.getElementById("searchBtn"); //Home Search button
  const yearSelectBar = document.getElementById("yearSelectBar"); //Home Select list of years

  const dashboardBody = document.querySelector(".dashboardBody"); //Dashboard screen 

  const qualifyingTable = document.getElementById("qualifyingTable");

  searchBtn.addEventListener("click", () => {
    homeBody.classList.toggle("hidden");

    dashboardBody.classList.toggle("hidden");
    populateRaceTable(yearSelectBar.value);
  });



});

let columnListenersSet = false; // states eventListeners in the qualifying table is set 
// Note to self: Consider making the arrays from the local storage, global, rather than calling it each function call 