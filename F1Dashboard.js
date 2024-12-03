// 1st param: (races, results, qualifying) Allows the user to decide what category data is retrived from.
// 2nd param: (int) The specific year to specify what season data should refer to. 

async function fetchSeasonData (table,year) {
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


const seasonData = fetchSeasonData("races", 2023);
console.log(seasonData);
document.addEventListener("DOMContentLoaded", () => {
    const searchBtn = document.getElementById("searchBtn");
    const yearSelectBar = document.getElementById("yearSelectBar");
  
    if (searchBtn && yearSelectBar) {
      searchBtn.addEventListener("click", () => {
        console.log(yearSelectBar.value); 
        console.log("bob");
      });
    } else {
      console.error("Search button or year select bar not found in the DOM.");
    }
  }); 
