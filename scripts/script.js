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

async function loadAndShowPkm() {
  hideLoadMoreButton();
  showLoadingSpinner();
  await loadAndPrepareData();
  renderPokemonCards();
  renderTotalPokemonCount(loadedPkm);
  hideLoadingSpinner();
  showLoadMoreButton();
}

async function loadAndPrepareData() {
  if (loadedPkm.length === 0) {
    const pokemonList = await fetchPokedexData();
    loadedPkm = await fetchPokemonDetails(pokemonList);
  }
}

async function fetchPokedexData() {
  const response = await fetch(BASE_URL);
  const data = await response.json();
  return data.results;
}

async function fetchPokemonDetails(pokemonList) {
  const fetchPromises = pokemonList.map((pokemon) => fetchPokemonData(pokemon).then(formatPokemonDetails));
  const currentPokemonDetails = await Promise.all(fetchPromises);
  return currentPokemonDetails;
}

function fetchPokemonData(pokemon) {
  return fetch(pokemon.url).then((response) => response.json());
}

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

function calculateTotalStats(stats) {
  return stats.hp + stats.attack + stats.defense + stats.sp_attack + stats.sp_def + stats.speed;
}

function mapTypes(typesArray) {
  return typesArray ? typesArray.map((type) => type.type.name) : [];
}

function mapAbilities(abilitiesArray) {
  return abilitiesArray ? abilitiesArray.map((ability) => ability.ability.name).join(", ") : "None";
}

function renderPokemonCards() {
  const container = document.getElementById("content");
  clearPokemonCards();
  container.classList.add("pokemonContainer");
  const startIndex = pokemonStartCount - 1;
  const pokemonToRender = loadedPkm.slice(startIndex, startIndex + limit);
  pokemonToRender.forEach((loadedPkm, index) => {
    const cardId = pokemonStartCount + index;
    container.innerHTML += pokemonCardTemplate(cardId, loadedPkm.name, loadedPkm.id);
    insertPokemonImage(cardId, loadedPkm.normal_version_pic, loadedPkm.types);
    insertTypes(cardId, loadedPkm.types);
  });
  pokemonStartCount += pokemonToRender.length;
}

function insertPokemonImage(cardId, normal_version_pic, types) {
  const pokemonPictureContainer = document.querySelector(`#picture-${cardId}`);
  const imageSrc = normal_version_pic || fallbackImage;
  const typeClass = types.length > 0 ? `bg_${types[0]}` : "";
  pokemonPictureContainer.innerHTML = `<img src="${imageSrc}" class="${typeClass} fullWidth">`;
}

function insertTypes(cardId, types) {
  const typeContainer = document.querySelector(`#types-${cardId}`);
  const typeDescriptionContainer = document.querySelector(`#typeDescription-${cardId}`);
  types.forEach((type) => {
    const capitalizedType = type.charAt(0).toUpperCase() + type.slice(1);
    typeContainer.innerHTML += `<img src="${typeToIcon[type]}" class="type-icon">`;
    typeDescriptionContainer.innerHTML += `<p class="typeDescription">${capitalizedType}</p>`;
  });
}

function renderTotalPokemonCount(loadedPkm) {
  let totalPokemonCountElement = document.getElementById("totalPokemonCount");
  totalPokemonCountElement.innerHTML = `Total Pokemon Count: ${loadedPkm.length}`;
}

function filterPokemon() {
  const searchInput = getSearchInput();
  if (!validateSearchInput(searchInput)) return;
  const filteredPokemon = getFilteredPokemon(searchInput, 10);
  handleSearchResults(filteredPokemon, searchInput);
}

function getSearchInput() {
  return document.getElementById("pokemonSearch").value.toLowerCase();
}

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

function getFilteredPokemon(searchInput, limit) {
  return loadedPkm.filter((pokemon) => pokemon.name.toLowerCase().includes(searchInput)).slice(0, limit);
}

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

function showNoResultsMessage(searchInput) {
  const container = document.getElementById("content");
  container.innerHTML = `<p class="no-results-message">No Pokémon found that match “${searchInput}”.</p>`;
}

function renderNextPokemon() {
  const startIndex = pokemonStartCount - 1;
  const nextPokemonList = loadedPkm.slice(startIndex, startIndex + limit);
  hideLoadMoreBtnShowLoadingScr();
  loadedPkm.sort((a, b) => a.id - b.id);
  if (handleEndOfPokemonList(startIndex, loadedPkm.length)) {
    return;
  }
  loadAndPrepareData();
  renderPokemonCards(nextPokemonList);
  pokemonStartCount += nextPokemonList.length;
  handleEndOfPokemonList(pokemonStartCount, loadedPkm.length);
  hideLoadingSpinner();
}

function handleEndOfPokemonList(currentIndex, totalPokemonCount) {
  if (currentIndex >= totalPokemonCount) {
    hideLoadMoreButton();
    showGoBackToStartButton();
    return true;
  }
  showLoadMoreButton();
  hideGoBackToStartButton();
  return false;
}

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

function showNextPokemon() {
  if (currentPokemonIndex < loadedPkm.length - 1) {
    currentPokemonIndex++;
    const nextPokemon = loadedPkm[currentPokemonIndex];
    document.getElementById("detailedPkmContent").innerHTML = renderDetailsPokemonCard(nextPokemon, nextPokemon.id, nextPokemon.types, currentPokemonIndex);
    renderAboutSection();
  } else {
    alert("This is the last Pokémon!");
  }
}

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

function renderAboutSection() {
  const pkmDetails = loadedPkm[currentPokemonIndex];
  const { species, height, weight, abilities = "" } = pkmDetails;
  const documentRef = document.getElementById("informationBox");
  documentRef.innerHTML = "";
  documentRef.innerHTML = renderAboutSectionTemplate(species, height, weight, abilities);
}

function renderBaseStats() {
  const pkmDetails = loadedPkm[currentPokemonIndex];
  const { hp, attack, defense, sp_attack, sp_def, speed, total } = pkmDetails;
  documentRef = document.getElementById("informationBox");
  documentRef.innerHTML = "";
  documentRef.innerHTML = renderBaseStatsTemplate(hp, attack, defense, sp_attack, sp_def, speed, total);
}

function renderShinyVersion() {
  const currentPokemon = loadedPkm[currentPokemonIndex];
  const types = currentPokemon.types || [];
  documentRef = document.getElementById("informationBox");
  documentRef.innerHTML = "";
  documentRef.innerHTML = renderShinyVersionTemplate(currentPokemon, types);
}

function showLoadingSpinner() {
  let documentRef = document.getElementById("content");
  clearPokemonCards();
  documentRef.innerHTML = renderLoadingSpinner();
}

function hideLoadingSpinner() {
  const loadingSpinner = document.getElementById("loadingSpinner");
  if (loadingSpinner) {
    loadingSpinner.remove();
  }
}

function showLoadMoreButton() {
  const button = document.getElementById("loadMoreButton");
  if (button) {
    button.classList.remove("hidden");
  }
}

function hideLoadMoreButton() {
  const button = document.getElementById("loadMoreButton");
  if (button) {
    button.classList.add("hidden");
  }
}

function showGoBackToStartButton() {
  const button = document.getElementById("goBackToStartBtn");
  if (button) {
    button.classList.remove("hidden");
  }
}

function hideGoBackToStartButton() {
  const button = document.getElementById("goBackToStartBtn");
  if (button) {
    button.classList.add("hidden");
  }
}

function showDetailedPkmContainer() {
  const blackOverlay = document.getElementById("blackOverlay");
  if (blackOverlay) {
    blackOverlay.classList.remove("hidden");
    document.body.classList.add("no-scroll");
  }
}

function hideDetailedPkmContainer() {
  const blackOverlay = document.getElementById("blackOverlay");
  if (blackOverlay) {
    blackOverlay.classList.add("hidden");
    document.body.classList.remove("no-scroll");
  }
}

function hideLoadMoreBtnShowLoadingScr() {
  hideLoadMoreButton();
  showLoadingSpinner();
}

function hideLoadingScreenShowBackToStartBtn() {
  hideLoadingSpinner();
  showGoBackToStartButton();
}

function clearPokemonCards() {
  const container = document.getElementById("content");
  container.innerHTML = "";
}

function resetToAllPokemon() {
  hideGoBackToStartButton();
  hideDetailedPkmContainer();
  showLoadMoreButton();
  clearPokemonCards();
  pokemonStartCount = 1;
  renderPokemonCards();
}
