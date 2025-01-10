/**
 * This function is called when the body element is loaded and starts the initialization process.
 *
 */
function init() {
  loadAndShowPkm();
  hideGoBackToStartButton();
  document.getElementById("pokemonSearch").addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      filterPokemon();
    }
  });
}

/**
 * This function calls several auxiliary functions which are necessary for the data retrieval from the API and the correct functioning of the website.
 *
 */
async function loadAndShowPkm() {
  hideLoadMoreButton();
  showLoadingSpinner();
  await fetchNextBatch();
  renderPokemonCards();
  renderTotalPokemonCount(loadedPkm);
  hideLoadingSpinner();
  showLoadMoreButton();
}

/**
 * This function fetches the Pokemon data according to the globally set limit and saves it in the variable pokemonList, so that not all Pokemon are fetched at once, but only the data that is currently required.
 *
 */
async function fetchNextBatch() {
  const response = await fetch(`${BASE_URL}?limit=${limit}&offset=${offset}`);
  const data = await response.json();
  const pokemonList = data.results;
  totalPokemonCount = data.count;
  const newPokemonDetails = await fetchPokemonDetails(pokemonList);
  loadedPkm = [...loadedPkm, ...newPokemonDetails];
  offset += limit;
}

/**
 * This function pushes the basic data together with additional Pokemon information into the loadedPkm JSON.
 *
 */
async function loadAndPrepareData() {
  if (loadedPkm.length === 0) {
    const pokemonList = await fetchPokedexData();
    loadedPkm = await fetchPokemonDetails(pokemonList);
  }
}

/**
 * This function fetches the basic Pokemon data.
 *
 * @returns {JSON} - JSON with 30 Pokémon objects for more detailed information.
 */
async function fetchPokedexData() {
  const response = await fetch(BASE_URL);
  const data = await response.json();
  return data.results;
}

/**
 * This function gives you more detailed information about the Pokemon.
 *
 * @param {JSON} pokemonList - JSON with 30 Pokemon objects.
 * @returns  - JSON with all the detailed information about the currently displayed Pokémon.
 */
async function fetchPokemonDetails(pokemonList) {
  const fetchPromises = pokemonList.map((pokemon) => fetchPokemonData(pokemon).then(formatPokemonDetails));
  const currentPokemonDetails = await Promise.all(fetchPromises);
  return currentPokemonDetails;
}

/**
 * This function fetches the URL of each Pokemon and returns all the information it contains as JSON.
 *
 * @param {JSON} pokemon - JSON with all currently displayed Pokemon and the corresponding URLs.
 * @returns {JSON} - JSON containing the details of all information currently displayed.
 */
function fetchPokemonData(pokemon) {
  return fetch(pokemon.url).then((response) => response.json());
}

/**
 * This function extracts the values used in the application and returns an array with these values.
 *
 * @param {JSON} data - List of all loaded Pokemon with the corresponding information.
 * @returns {object} - Object with the required data for the respective Pokemon.
 */
function formatPokemonDetails(data) {
  const stats = mapStats(data.stats);
  return {
    id: data.id,
    name: data.name,
    species: data.species.name,
    normal_version_pic: data.sprites.front_default,
    shiny_version_pic: data.sprites.front_shiny,
    types: mapTypes(data.types),
    abilities: mapAbilities(data.abilities),
    height: data.height / 10,
    weight: data.weight / 10,
    ...stats,
    total: calculateTotalStats(stats),
  };
}

/**
 * This function extracts the individual statistics for each Pokemon.
 *
 * @param {JSON} statsArray - JSON with the status values of all Pokemon.
 * @returns {Array} - Array with all statuses of the Pokemon.
 */
function mapStats(statsArray) {
  const stats = {};
  statsArray.forEach((stat) => {
    stats[stat.stat.name] = stat.base_stat;
  });
  return {
    hp: stats["hp"] || 0,
    attack: stats["attack"] || 0,
    defense: stats["defense"] || 0,
    sp_attack: stats["special-attack"] || 0,
    sp_def: stats["special-defense"] || 0,
    speed: stats["speed"] || 0,
  };
}

/**
 * This function adds up all statistics and displays the total number.
 *
 * @param {Array} stats - Ein Array mit den verschiedenen Werten der einzelnen Stats.
 * @returns {number} - Sum of all stats.
 */
function calculateTotalStats(stats) {
  return stats.hp + stats.attack + stats.defense + stats.sp_attack + stats.sp_def + stats.speed;
}

/**
 *
 *
 * @param {JSON} typesArray - A JSON with the Pokemon's individual types.
 * @returns {string} - e.g. Grass, Poison.
 */
function mapTypes(typesArray) {
  return typesArray ? typesArray.map((type) => type.type.name) : [];
}

/**
 * This function extracts the names of the abilities of each Pokemon.
 *
 * @param {JSON} abilitiesArray - A JSON with the Pokemon's individual abilities.
 * @returns {string} - e.g. Overgrow Chlorophyll.
 */
function mapAbilities(abilitiesArray) {
  return abilitiesArray ? abilitiesArray.map((ability) => ability.ability.name).join(", ") : "None";
}

/**
 * This function renders the individual Pokemon cards in the DOM.
 *
 */
function renderPokemonCards() {
  const container = document.getElementById("content");
  container.classList.add("pokemonContainer");
  const startIndex = pokemonStartCount - 1;
  const pokemonToRender = loadedPkm.slice(startIndex, startIndex + limit);
  pokemonToRender.forEach((pokemon, index) => {
    const cardId = pokemonStartCount + index;
    container.innerHTML += pokemonCardTemplate(cardId, pokemon.name, pokemon.id);
    insertPokemonImage(cardId, pokemon.normal_version_pic, pokemon.types);
    insertTypes(cardId, pokemon.types);
  });
  pokemonStartCount += pokemonToRender.length;
}

/**
 * This function inserts the images of the respective Pokemon into the individual cards and dynamically adjusts the background color to the type.
 *
 * @param {number} cardId - Starts at 1 for the first Pokemon and then counts up for each additional Pokemon.
 * @param {url} normal_version_pic - The extracted preview image of the respective Pokemon.
 * @param {Array} types - The extracted types of each Pokemon (e.g. Normal, Flight).
 */
function insertPokemonImage(cardId, normal_version_pic, types) {
  const pokemonPictureContainer = document.querySelector(`#picture-${cardId}`);
  const imageSrc = normal_version_pic || fallbackImage;
  const typeClass = types.length > 0 ? `bg_${types[0]}` : "";
  pokemonPictureContainer.innerHTML = `<img src="${imageSrc}" class="${typeClass} fullWidth">`;
}

/**
 * This function inserts the Pokemon types (symbols & text) into each card in the normal view.
 *
 * @param {number} cardId - Starts at 1 for the first Pokemon and then counts up for each additional Pokemon.
 * @param {Array} types - The extracted types of each Pokemon (e.g. Normal, Flight).
 */
function insertTypes(cardId, types) {
  const typeContainer = document.querySelector(`#types-${cardId}`);
  const typeDescriptionContainer = document.querySelector(`#typeDescription-${cardId}`);
  types.forEach((type) => {
    const capitalizedType = type.charAt(0).toUpperCase() + type.slice(1);
    typeContainer.innerHTML += `<img src="${typeToIcon[type]}" class="type-icon">`;
    typeDescriptionContainer.innerHTML += `<p class="typeDescription">${capitalizedType}</p>`;
  });
}

/**
 * This function renders the total number of all Pokemon into the DOM.
 *
 */
function renderTotalPokemonCount() {
  let totalPokemonCountElement = document.getElementById("totalPokemonCount");
  totalPokemonCountElement.innerHTML = `Total Pokemon Count: ${totalPokemonCount}`;
}

/**
 * This function filters the Pokemon according to the user's search criteria.
 *
 * @returns {boolean} True or False
 */
function filterPokemon() {
  const searchInput = getSearchInput();
  if (!validateSearchInput(searchInput)) return;
  const filteredPokemon = getFilteredPokemon(searchInput, 10);
  handleSearchResults(filteredPokemon, searchInput);
}

/**
 * This function returns the user input after which filtering is to take place.
 *
 * @returns {string} - User input after which filtering should take place.
 */
function getSearchInput() {
  return document.getElementById("pokemonSearch").value.toLowerCase();
}

/**
 * This function checks whether the search requirements are met.
 *
 * @param {string} searchInput - User input after which filtering should take place.
 * @returns True or False
 */
function validateSearchInput(searchInput) {
  if (!searchInput) {
    alert("Please enter a search term.");
    return false;
  }
  if (searchInput.length < 3) {
    alert("At least 3 letters are required for the search.");
    return false;
  }
  return true;
}

/**
 * This function filters the loadedPkm JSON according to the user's search criteria.
 *
 * @param {string} searchInput  - User input after which filtering should take place.
 * @param {number} limit - Globally defined limit for how many Pokemon should be displayed.
 * @returns {JSON} - loadedPkm JSON with the Pokemon that match the search criteria.
 */
function getFilteredPokemon(searchInput, limit) {
  return loadedPkm.filter((pokemon) => pokemon.name.toLowerCase().includes(searchInput)).slice(0, limit);
}

/**
 * This function checks the user's search input.
 *
 * @param {JSON} filteredPokemon - 10 Pokemon which have been filtered according to the search criteria.
 * @param {*} searchInput  - Search input of the user.
 */
function handleSearchResults(filteredPokemon, searchInput) {
  if (filteredPokemon.length === 0) {
    showNoResultsMessage(searchInput);
    showGoBackToStartButton();
    hideLoadMoreButton();
  } else {
    hideLoadMoreButton();
    showGoBackToStartButton();
    renderSearchResults(filteredPokemon);
  }
}

/**
 * This function renders the Pokemon that have been filtered according to the search criteria into the DOM.
 *
 * @param {JSON} filteredPokemon - 10 Pokemon which have been filtered according to the search criteria.
 */
function renderSearchResults(filteredPokemon) {
  const container = document.getElementById("content");
  clearPokemonCards();
  filteredPokemon.forEach((loadedPkm, index) => {
    const cardId = index + 1;
    container.innerHTML += pokemonCardTemplate(cardId, loadedPkm.name, loadedPkm.id);
    insertTypes(cardId, loadedPkm.types);
    insertPokemonImage(cardId, loadedPkm.normal_version_pic, loadedPkm.types);
  });
}

/**
 * This function displays a message if no Pokemon with the corresponding search parameters have been found.
 *
 * @param {string} searchInput - Search input of the user.
 */
function showNoResultsMessage(searchInput) {
  const container = document.getElementById("content");
  container.innerHTML = `<p class="no-results-message">No Pokémon found that match “${searchInput}”.</p>`;
}

/**
 * This function renders the next Pokemon in the DOM.
 *
 */
async function renderNextPokemon() {
  hideLoadMoreBtnShowLoadingScr();
  await fetchNextBatch();
  renderPokemonCards();
  handleEndOfPokemonList(offset, totalPokemonCount);
  hideLoadingSpinner();
}

/**
 * This function checks whether all Pokemon have been loaded.
 *
 * @param {number} offset - Globally defined variable that is dynamically adjusted to always receive the next Pokemon.
 * @param {number} totalPokemonCount - Globally defined variable that stores the total number of all Pokemon.
 * @returns {boolean} True or False
 */
function handleEndOfPokemonList(offset, totalPokemonCount) {
  const allPokemonLoaded = offset >= totalPokemonCount;
  if (allPokemonLoaded) {
    hideLoadMoreButton();
    showGoBackToStartButton();
    return true;
  }
  showLoadMoreButton();
  hideGoBackToStartButton();
  return false;
}

/**
 * This function calls up the detailed view of the individual Pokemon.
 *
 * @param {number} id - The ID of the respective Pokemon.
 */
function openPokemonDetails(id) {
  const pkmDetailContainer = document.getElementById("detailedPkmContent");
  currentPokemonIndex = loadedPkm.findIndex((pokemon) => pokemon.id === id);
  const currentPokemon = loadedPkm[currentPokemonIndex];
  currentPokemonId = currentPokemon.id;
  const types = currentPokemon.types || [];
  pkmDetailContainer.innerHTML = "";
  pkmDetailContainer.innerHTML = renderDetailsPokemonCard(currentPokemon, id, types, currentPokemonIndex);
  showDetailedPkmContainer();
  renderAboutSection();
}

/**
 * This function shows the next Pokemon in the detailed view with the corresponding values.
 *
 */
async function showNextPokemon() {
  if (canNavigateToNextPokemon()) {
    navigateToNextPokemon();
  } else if (canLoadMorePokemon()) {
    await loadNextBatchAndNavigate();
  } else {
    alert("This is the last Pokémon!");
  }
}

/**
 * This is an auxiliary function that checks whether you can navigate to the next Pokemon.
 *
 * @returns {boolean} - True or False.
 */
function canNavigateToNextPokemon() {
  return currentPokemonIndex < loadedPkm.length - 1;
}

/**
 * This helper function determines the next Pokemon in the JSON loadedPkm and passes it to the function updatePokemonDetails().
 *
 *
 */
function navigateToNextPokemon() {
  currentPokemonIndex++;
  const nextPokemon = loadedPkm[currentPokemonIndex];
  updatePokemonDetails(nextPokemon);
}

/**
 * This is an auxiliary function that checks whether additional Pokemon can be loaded.
 *
 * @returns {boolean} - True or False.
 */
function canLoadMorePokemon() {
  return offset < totalPokemonCount;
}

/**
 * This function fetches the next Pokemon according to the globally set limit and renders them when more Pokemon can be displayed.
 *
 */
async function loadNextBatchAndNavigate() {
  showLoadingSpinner();
  await fetchNextBatch();
  hideLoadingSpinner();

  if (canNavigateToNextPokemon()) {
    navigateToNextPokemon();
    renderPokemonCards();
  }
}

/**
 * This function receives the variable pokemon and updates the detailed view accordingly.
 *
 * @param {object} pokemon - The next Pokemon in the JSON loadedPkm.
 */
function updatePokemonDetails(pokemon) {
  document.getElementById("detailedPkmContent").innerHTML = renderDetailsPokemonCard(pokemon, pokemon.id, pokemon.types, currentPokemonIndex);
  renderAboutSection();
}

/**
 * This function displays the previous Pokemon with the corresponding values.
 *
 */
function showPreviousPokemon() {
  if (currentPokemonIndex > 0) {
    currentPokemonIndex--;
    const previousPokemon = loadedPkm[currentPokemonIndex];
    currentPokemonId = previousPokemon.id;
    document.getElementById("detailedPkmContent").innerHTML = renderDetailsPokemonCard(previousPokemon, previousPokemon.id, previousPokemon.types, currentPokemonIndex);
    renderAboutSection();
  } else {
    alert("This is the first Pokémon!");
  }
}

/**
 * This function extracts the parameters previously defined in pkmDetails (e.g. species, height, weight etc.) and renders them in “About”.
 *
 */
function renderAboutSection() {
  const pkmDetails = loadedPkm[currentPokemonIndex];
  const { species, height, weight, abilities = "" } = pkmDetails;
  const documentRef = document.getElementById("informationBox");
  documentRef.innerHTML = "";
  documentRef.innerHTML = renderAboutSectionTemplate(species, height, weight, abilities);
}

/**
 * This function extracts the parameters previously defined in pkmDetails (e.g. hp, attack, defense, etc.) and renders them in “Base Stats”.
 *
 */
function renderBaseStats() {
  const pkmDetails = loadedPkm[currentPokemonIndex];
  const { hp, attack, defense, sp_attack, sp_def, speed, total } = pkmDetails;
  documentRef = document.getElementById("informationBox");
  documentRef.innerHTML = "";
  documentRef.innerHTML = renderBaseStatsTemplate(hp, attack, defense, sp_attack, sp_def, speed, total);
}

/**
 * This function extracts the Shiny version of the respective Pokemon from the JSON loadedPkm and inserts it into the detail view.
 *
 */
function renderShinyVersion() {
  const currentPokemon = loadedPkm[currentPokemonIndex];
  const types = currentPokemon.types || [];
  documentRef = document.getElementById("informationBox");
  documentRef.innerHTML = "";
  documentRef.innerHTML = renderShinyVersionTemplate(currentPokemon, types);
}

/**
 * Help function to display the loading screen.
 *
 */
function showLoadingSpinner() {
  let documentRef = document.getElementById("content");
  clearPokemonCards();
  documentRef.innerHTML = renderLoadingSpinner();
}

/**
 * Help function to hide the loading screen.
 *
 */
function hideLoadingSpinner() {
  const loadingSpinner = document.getElementById("loadingSpinner");
  if (loadingSpinner) {
    loadingSpinner.remove();
  }
}

/**
 * Help function for displaying the "Load more" button.
 *
 */
function showLoadMoreButton() {
  const button = document.getElementById("loadMoreButton");
  if (button) {
    button.classList.remove("hidden");
  }
}

/**
 * Help function for hiding the "Load more" button.
 *
 */
function hideLoadMoreButton() {
  const button = document.getElementById("loadMoreButton");
  if (button) {
    button.classList.add("hidden");
  }
}

/**
 * Help function for displaying the "Go back to start" button.
 *
 */
function showGoBackToStartButton() {
  const button = document.getElementById("goBackToStartBtn");
  if (button) {
    button.classList.remove("hidden");
  }
}

/**
 * Help function for hiding the "Go back to start" button.
 *
 */
function hideGoBackToStartButton() {
  const button = document.getElementById("goBackToStartBtn");
  if (button) {
    button.classList.add("hidden");
  }
}

/**
 * Help function for displaying the detailed view.
 *
 */
function showDetailedPkmContainer() {
  const blackOverlay = document.getElementById("blackOverlay");
  if (blackOverlay) {
    blackOverlay.classList.remove("hidden");
    document.body.classList.add("no-scroll");
  }
}

/**
 * Help function for hiding the detailed view.
 *
 */
function hideDetailedPkmContainer() {
  const blackOverlay = document.getElementById("blackOverlay");
  if (blackOverlay) {
    blackOverlay.classList.add("hidden");
    document.body.classList.remove("no-scroll");
  }
}

/**
 * Help function to hide the “Load more” button and show the loading screen.
 *
 */
function hideLoadMoreBtnShowLoadingScr() {
  hideLoadMoreButton();
  showLoadingSpinner();
}

/**
 * Help function to hide the loading screen and show the “Back to start” button.
 *
 */
function hideLoadingScreenShowBackToStartBtn() {
  hideLoadingSpinner();
  showGoBackToStartButton();
}

/**
 * Function for emptying the “content” container.
 *
 */
function clearPokemonCards() {
  const container = document.getElementById("content");
  container.innerHTML = "";
}

/**
 * This function resets the Pokedex to the initial state and jumps back to the beginning.
 *
 */
function resetToAllPokemon() {
  hideGoBackToStartButton();
  hideDetailedPkmContainer();
  showLoadMoreButton();
  clearPokemonCards();
  pokemonStartCount = 1;
  renderPokemonCards();
}
