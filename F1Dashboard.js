let currentRaceButton = null; // Tracks the button of the currently selected race
let columnListenersSet = false; // States eventListeners in the qualifying table is set 

// 1st param: (races, results, qualifying) Allows the user to decide what category data is retrived from.
// 2nd param: (int) The specific year to specify what season data should refer to. 

async function fetchSeasonData(table, year) {
  const apiUrl = 'https://www.randyconnolly.com/funwebdev/3rd/api/f1/' + table + '.php?season=' + year;
  const storageKey = table + year;
  // Collecting from local storage
  const seasonData = localStorage.getItem(storageKey);
  console.log(`Checking for ` + table + ` in local storage...`);
  if (seasonData) {

    console.log("Retrieved Data from Local Storage");
    const JSONseasonData = JSON.parse(seasonData);
    return JSONseasonData;
  } else {
    console.log("Not in Local Storage");
  }

  try {
    // Colleting from API
    const response = await fetch(apiUrl)
    const jsonData = await response.json();
    localStorage.setItem(storageKey, JSON.stringify(jsonData));
    console.log("Retrived Data from API");
    return jsonData;
  } catch (error) {
    console.error("Error: ", error);
    return null;
  }
}


// Populates table specific to the side column of the dashboard page 
async function populateRaceTable(year) {
  const raceData = await fetchSeasonData("races", year);
  const raceListTitle = document.getElementById("raceListTitle");
  raceListTitle.textContent = `${year} Races`;
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
      raceListButton.textContent = "Search";
      buttonCell.appendChild(raceListButton);
      tableRow.appendChild(buttonCell);

      const mainContent = document.querySelector(".mainContent");
      // Event listener for button
      // Loads content in the main section of the screen
      raceListButton.addEventListener("click", (e) => {
        currentRaceButton = e.target;
        populateHeader(e.target);
        populateQualifyingTable(e.target, "position");
        populateResultsTable(e.target, "position");
        mainContent.classList.remove("hidden");
      })

      raceTable.querySelector("tbody").appendChild(tableRow);
    });
  }
}

// Fills in the header in the mainContent div 
// Race, circuit name, round, date, wiki link 
async function populateHeader(button) {
  // Obtaining specified race through race id from button dataset
  const raceId = button.dataset.id;
  const raceData = await fetchSeasonData("races", button.dataset.year);

  const raceInfo = raceData.find(p => p.id == raceId);
  // Adding info to the html

  // Race Name
  const raceNameSubHeader = document.getElementById("raceNameSubHeader");
  raceNameSubHeader.textContent = raceInfo.name;

  // Circuit
  const circuitSubHeader = document.getElementById("circuitNameSubHeader");
  circuitSubHeader.textContent = raceInfo.circuit.name;

  createCircuitEventListener(circuitSubHeader, raceInfo.circuit);

  // Round
  const roundInfo = document.getElementById("roundInfo");
  roundInfo.textContent = `Round ` + raceInfo.round;

  // date
  const dateInfo = document.getElementById("dateInfo");
  dateInfo.textContent = raceInfo.date;


  // Wiki link
  const wikiPageBtn = document.getElementById("wikiPageBtn");
  wikiPageBtn.href = raceInfo.url;
}


// Param 1 Button represents the element that triggered the event, allowing data from the side column to be shared for the function
// Param 2 sortCategory is the order of how the table is sorted based on the header of the columns 
// (Accepts "position", "driver", "constructor", "q1", "q2", and "q3")
async function populateQualifyingTable(button, sortCategory) {

  // Empties table 
  emptyTable(qualifyingTable);
  // List of all qualifying racers within a year
  const qualifyingData = await fetchSeasonData("qualifying", button.dataset.year);

  // List of qualifying racers of a specific race 
  let qualifyingInfo = qualifyingData.filter((qualifier) => qualifier.race.id == button.dataset.id);

  // Changes sorting criteria based on sortCategory
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
  // Creates table rows for qualifying tables 
  qualifyingInfo.forEach((qualifier) => {
    const tableRow = document.createElement("tr");

    // Position cell
    const positionCell = document.createElement("td");
    positionCell.textContent = qualifier.position;
    positionCell.classList.add("textCentered");
    tableRow.appendChild(positionCell);

    // Name cell
    const nameCell = document.createElement("td");
    nameCell.textContent = qualifier.driver.forename + ` ` + qualifier.driver.surname;
    nameCell.classList.add("darkenOnHover");
    createDriverEventListener(nameCell, qualifier.driver, button.dataset.year);

    tableRow.appendChild(nameCell);

    // Constructor cell
    const constructorCell = document.createElement("td");
    constructorCell.textContent = qualifier.constructor.name;
    constructorCell.classList.add("darkenOnHover");
    tableRow.appendChild(constructorCell);
    createConstructorEventListener(constructorCell, qualifier.constructor, button.dataset.year);

    // Q1 cell
    const Q1Cell = document.createElement("td");
    Q1Cell.textContent = qualifier.q1;
    Q1Cell.classList.add("textCentered");
    tableRow.appendChild(Q1Cell);

    // Q2 cell
    const Q2Cell = document.createElement("td");
    Q2Cell.textContent = qualifier.q2;
    Q2Cell.classList.add("textCentered");

    tableRow.appendChild(Q2Cell);

    // Q3 cell
    const Q3Cell = document.createElement("td");
    Q3Cell.textContent = qualifier.q3;
    Q3Cell.classList.add("textCentered");
    tableRow.appendChild(Q3Cell);

    // Inserts all table row full of table data into the table body 
    const qualifyingTableBody = qualifyingTable.querySelector("tbody");
    qualifyingTableBody.appendChild(tableRow);
  })

  // Creates event listeners for the column headers 
  if (!columnListenersSet) {
    setupQualifyingColumnSorting();
    columnListenersSet = true; // Confirms columns lisenters have been set 
  }

}

// Creates event listeners for columns headers for Results table 
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
    // columnElement.replaceWith(columnElement.cloneNode(true)); // Removes old listeners
    const newColumnElement = document.getElementById(id);

    newColumnElement.addEventListener("click", () => {
      if (currentRaceButton) {
        populateResultsTable(currentRaceButton, sortCategory);
      } else {
        console.error("No race selected. Cannot sort.");
      }
    });
  });
}

// Creates Event Listener on elements with a driver's name in order to open their dialog profile
function createDriverEventListener(driverElement, driverInfo, year) {
  driverElement.addEventListener("click", (event) =>{
    const driverDialog = document.getElementById("driverAbout");
    driverDialog.showModal();
    populateDriverDialog(driverInfo, year);
  })
}

// Creates Event Listener on elements with a constructor's name in order to open their dialog profile
function createConstructorEventListener(constructorElement, constructorInfo, year) {
  constructorElement.addEventListener("click", (event) => {
    const constructorDialog = document.getElementById("constructorAbout");
    
    constructorDialog.showModal();
    populateConstructorDialog(constructorInfo, year);

  })
}

// Creates Event Listener on elements with a circuit's name in order to open their dialog profile
async function createCircuitEventListener(circuitElement, circuitInfo) {
  circuitElement.addEventListener("click", (event) => {
    const circuitDialog = document.getElementById("circuitAbout");
    circuitDialog.showModal();
    populateCircuitDialog(circuitInfo);
  })
}

// Adds information regarding a specified circuit to a dialog element 
async function populateCircuitDialog(circuitInfo) {
  const circuitName = document.getElementById("circuitName");
  circuitName.textContent = circuitInfo.name;

  const circuitLocation = document.getElementById("circuitLocation");
  circuitLocation.textContent = circuitInfo.location;

  const circuitCountry = document.getElementById("circuitCountry");
  circuitCountry.textContent = circuitInfo.country;

  const circuitWikiBtn = document.getElementById("circuitWikiBtn");
  circuitWikiBtn.href = circuitInfo.url;

  const closeButton = document.getElementById("circuitCloseBtn");
  const circuitDialog = document.getElementById("circuitAbout");
  closeButton.addEventListener("click", () => {
    circuitDialog.close(); // Closes the dialog
    console.log("Circuit dialog closed.");
  });
}
// Populates the results table with race-specific data
async function populateResultsTable(button, sortCategory) {
  // Reference the table and clear existing rows
  const resultsTable = document.getElementById("resultsTable");
  const resultsTableBody = resultsTable.querySelector("tbody");
  resultsTableBody.innerHTML = ""; // Clear previous rows

  // Fetch results data for a specific race
  const raceId = button.dataset.id;
  const resultsData = await fetchSeasonData("results", button.dataset.year);
  
  // Filter data to a specific race 
  let resultsInfo = resultsData.filter((result) => result.race.id == button.dataset.id);
  const firstPlace = document.getElementById("firstPlace");
  const secondPlace = document.getElementById("secondPlace");
  const thirdPlace = document.getElementById("thirdPlace");

  firstPlace.innerHTML = `1st ${resultsInfo[0].driver.forename} ${resultsInfo[0].driver.surname}`;
  secondPlace.innerHTML = `2nd ${resultsInfo[1].driver.forename} ${resultsInfo[1].driver.surname}`;
  thirdPlace.innerHTML = `3rd ${resultsInfo[2].driver.forename} ${resultsInfo[2].driver.surname}`;
  // Sort data if a category is specified
  if (sortCategory) {
    resultsInfo.sort((a, b) => {
      const valueA = getValueForSort(a, sortCategory);
      const valueB = getValueForSort(b, sortCategory);
      if (sortCategory == "laps" || sortCategory == "points")
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
    createDriverEventListener(nameCell, result.driver, button.dataset.year);
    
    tableRow.appendChild(nameCell);

    const constructorCell = document.createElement("td");
    constructorCell.textContent = result.constructor.name;
    constructorCell.classList = "darkenOnHover";
    createConstructorEventListener(constructorCell, result.constructor, button.dataset.year);
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


// Populates the constructor dialog with constructor-specific data
async function populateConstructorDialog(constructorInfo, year) {
  const constructorTableBody = document.querySelector("#constructorTable tbody");
  const constructorRaceApiUrl = `https://www.randyconnolly.com/funwebdev/3rd/api/f1/constructorResults.php?constructor=${constructorInfo.ref}&season=${year}`;
  const constructorRaceResponse = await fetch(constructorRaceApiUrl);
  const constructorRaceData = await constructorRaceResponse.json();
  if (constructorRaceData) {
    console.log("Retrieved from API ");
  } else {
    console.log("Could not retrieve constructor race data.");
  }

  // Had to call for constructor due to constructor objects from qualifying and results not have url attribute 
  const constructorInfoApiUrl = `https://www.randyconnolly.com/funwebdev/3rd/api/f1/constructors.php?id=${constructorInfo.id}`;
  const constructorInfoResponse = await fetch(constructorInfoApiUrl);
  const constructorInfoData = await constructorInfoResponse.json();
  
  // Constructor Name 
  const constructorName = document.getElementById("constructorName");
  constructorName.textContent = constructorInfo.name;

  // Constructor Nationality 
  const constructorNationality = document.getElementById("constructorNationality");
  constructorNationality.textContent = constructorInfo.nationality;

  // Constructor Wiki Button
  const constructorWikiBtn = document.getElementById("constructorWikiBtn");
  constructorWikiBtn.href = constructorInfoData.url;
  
  const constructorRaceTitle = document.getElementById("constructorRaceResults");
  constructorRaceTitle.textContent = `${year} Race Results`;

  // Creating Constractor Race table
  constructorRaceData.forEach((constructorRace) => {
    const row = document.createElement("tr");

    // Round Cell
    const roundCell = document.createElement("td");
    roundCell.textContent = constructorRace.round || "N/A";
    row.appendChild(roundCell);

    // Race Name Cell
    const nameCell = document.createElement("td");
    nameCell.textContent = constructorRace.name || "N/A";
    row.appendChild(nameCell);

    // Driver Cell
    const driverCell = document.createElement("td");
    driverCell.textContent = `${constructorRace.forename} ${constructorRace.surname}` || "N/A";
    row.appendChild(driverCell);

    // Position Cell
    const positionCell = document.createElement("td");
    positionCell.textContent = constructorRace.positionOrder || "N/A";
    row.appendChild(positionCell);

    // Append row to table body
    constructorTableBody.appendChild(row);
    
  })

  const closeButton = document.getElementById("constructorCloseBtn");
  const constructorDialog = document.getElementById("constructorAbout");
  closeButton.addEventListener("click", () => {
    constructorDialog.close(); // Closes the dialog
    console.log("Constructor dialog closed.");
    constructorTableBody.innerHTML = "";
  });
}

// Creates event listeners for about dialog
function createAboutListener() {
  const aboutBtn = document.getElementById("aboutBtn");
  const aboutDialog = document.getElementById("aboutDialog");
  const closeAbout = document.getElementById("closeBtn");
  console.log("initiated");
  aboutBtn.addEventListener("click", () => {
    aboutDialog.showModal(); // Open the dialog in modal mode
  })

  closeAbout.addEventListener("click", () => {
    aboutDialog.close(); // Close the dialog if it's already open
  })
}
// Closes the constructor dialog
function closeConstructorDialogListener() {
  const closeButton = document.getElementById("constructorCloseBtn");
  const constructorDialog = document.getElementById("constructorAbout");

  if (closeButton && constructorDialog) {
    closeButton.addEventListener("click", () => {
      constructorDialog.close(); // Closes the dialog
      console.log("Constructor dialog closed.");
    });
  } else {
    console.error("Constructor close button or dialog not found.");
  }
}

// Sets up sorting for qualifying table columns
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

// Helper function to get the value for sorting and leaves empty space if no value
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

// Handles logo click to return to the home page
function homeLogoListener() {
  const textLogo = document.getElementById("textLogo");
  const homeBody = document.querySelector(".homeBody");
  const dashboardBody = document.querySelector(".dashboardBody"); // Dashboard screen 
  const raceTable = document.getElementById("seasonRaceList");
  const qualifyingTable = document.getElementById("qualifyingTable");
  const resultsTable = document.getElementById("resultsTable");
  const mainContent = document.querySelector(".mainContent");

  textLogo.addEventListener("click", (e) => {
    homeBody.classList = "homeBody"
    dashboardBody.classList.add("hidden");
    mainContent.classList.add("hidden");''
    emptyTable(qualifyingTable);
    emptyTable(raceTable);
    emptyTable(resultsTable);
  })
}

// Populates the driver dialog with driver-specific data
async function populateDriverDialog(driverInfo, year) {
  const driverTableBody = document.querySelector("#driverTable tbody");

  const driverRaceApiUrl = `https://www.randyconnolly.com/funwebdev/3rd/api/f1/driverResults.php?driver=${driverInfo.ref}&season=${year}`;
  const driverInfoApiUrl = `https://www.randyconnolly.com/funwebdev/3rd/api/f1/drivers.php?id=${driverInfo.id}`;
  const raceResultsList = await fetchSeasonData("results", year);

  // Fetch driver race results
  const driverRaceResponse = await fetch(driverRaceApiUrl);
  const driverRaceData = await driverRaceResponse.json();

  // Fetch detailed driver information
  const driverInfoResponse = await fetch(driverInfoApiUrl);
  const driverDetails = await driverInfoResponse.json();

  // Populate driver information
  const driverName = document.getElementById("driverName");
  driverName.textContent = `${driverDetails.forename} ${driverDetails.surname}`;

  // Driver Date of Birth
  const driverBirth = document.getElementById("driverBirth");
  driverBirth.textContent = driverDetails.dob;
  
  // Driver Age
  const driverAge = document.getElementById("driverAge");
  driverAge.textContent = `Age: ${calculateAge(driverDetails.dob)}`;

  // Driver Nationality
  const driverNationality = document.getElementById("driverNationality");
  driverNationality.textContent = driverDetails.nationality;

  // Driver Wiki Button
  const driverWikiBtn = document.getElementById("driverWikiBtn");
  driverWikiBtn.href = driverDetails.url;

  const driverRaceResultTitle = document.getElementById("driverRaceResults");
  driverRaceResultTitle.textContent = `${year} Race Results`;
  // Clear existing rows
  driverTableBody.innerHTML = "";

  // Populate driver race results
  driverRaceData.forEach((race) => {
    const row = document.createElement("tr");

    // Round Cell
    const roundCell = document.createElement("td");
    roundCell.textContent = race.round;
    row.appendChild(roundCell);

    // Race Name Cell
    const nameCell = document.createElement("td");
    nameCell.textContent = race.name;
    row.appendChild(nameCell);

    // Position Cell
    const positionCell = document.createElement("td");
    positionCell.textContent = race.positionOrder;
    row.appendChild(positionCell);

    // Points Cell
    const pointsCell = document.createElement("td");
    pointsCell.textContent = raceResultsList.find( raceResult => raceResult.id == race.resultId).points;
    row.appendChild(pointsCell);

    driverTableBody.appendChild(row);
  });

  const closeButton = document.getElementById("driverCloseBtn");
  const driverDialog = document.getElementById("driverAbout");
  closeButton.addEventListener("click", () => {
    driverDialog.close(); // Closes the dialog
    console.log("Driver dialog closed.");
    driverTableBody.innerHTML = "";
  });
}
// Calculates age from date of birth
function calculateAge(dob) {
  // Parse the date of birth
  const birthDate = new Date(dob);
  const today = new Date();

  // Calculate age
  let age = today.getFullYear() - birthDate.getFullYear();

  return age;
}

// Clears the contents of a given table
function emptyTable(tableElement) {
  const tableBody = tableElement.querySelector("tbody");
  tableBody.innerHTML = '';
}

// Populates the year select dropdown
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

// Initializes event listeners and elements on page load
document.addEventListener("DOMContentLoaded", () => {
  createAboutListener();
  fillSelectOptions()
  homeLogoListener()
  // Element of Home Page
  const homeBody = document.querySelector(".homeBody");
  const searchBtn = document.getElementById("searchBtn"); // Home Search button
  const yearSelectBar = document.getElementById("yearSelectBar"); // Home Select list of years
  const dashboardBody = document.querySelector(".dashboardBody"); // Dashboard screen 
  searchBtn.addEventListener("click", () => {
    homeBody.classList.toggle("hidden");

    dashboardBody.classList.toggle("hidden");
    populateRaceTable(yearSelectBar.value);
  });

});
