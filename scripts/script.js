let pokemonStartCount = 1;

const BASE_URL = "https://pokeapi.co/api/v2/pokemon?limit=100000&offset=0";

function init() {
  loadAndShowPkm();
  document
    .getElementById("pokemonSearch")
    .addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        event.preventDefault(); // Verhindert das Standard-Verhalten des Formulars
        filterPokemon(); // filterPokemon Funktion aufrufen
      }
    });
}

async function loadAndShowPkm() {
  hideLoadMoreButton();
  showLoadingSpinner();

  const pokemonList = await fetchPokedexData();

  setTimeout(async () => {
    hideLoadingSpinner();
    await renderPokemonCards(pokemonList);
    showLoadMoreButton(); // Button einblenden, wenn fertig
  }, 5000);
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

async function fetchPokedexData() {
  const response = await fetch(BASE_URL);
  const data = await response.json();

  let totalPokemonCountElement = document.getElementById("totalPokemonCount");
  totalPokemonCountElement.innerHTML = `Total Pokemon Count: ${data.count}`;
  return data.results;
}

async function renderPokemonCards(pokemonList) {
  const container = document.getElementById("content");
  clearPokemonCards();
  container.classList.add("pokemonContainer");

  for (let i = 0; i < 25 && i < pokemonList.length; i++) {
    let pokemon = pokemonList[i];
    container.innerHTML += pokemonCardTemplate(pokemonStartCount, pokemon.name);
    await fetchPokemonDetails(pokemon.url, pokemonStartCount);
    pokemonStartCount++;
  }
}

async function fetchPokemonDetails(pokemonUrl, cardId) {
  const responsePokemonDetails = await fetch(pokemonUrl);
  const pokemonDetails = await responsePokemonDetails.json();
  const types = pokemonDetails.types.map((type) => type.type.name);
  const pokemonImg = pokemonDetails.sprites.front_default;

  insertTypes(types, cardId);
  insertPokemonImage(pokemonImg, cardId, types);
}

function insertTypes(types, cardId) {
  const typeContainer = document.querySelector(`#types-${cardId}`);
  const typeDescriptionContainer = document.querySelector(`#typeDescription-${cardId}`
  );

  types.forEach((type) => {
    const capitalizedType = type.charAt(0).toUpperCase() + type.slice(1);
    typeContainer.innerHTML += `<img src="${typeToIcon[type]}" alt="${capitalizedType} Type" class="type-icon">`;
    typeDescriptionContainer.innerHTML += `<p class="typeDescription">${capitalizedType}</p>`;
  });
}

function insertPokemonImage(imageUrl, cardId, types) {
  const pokemonPictureContainer = document.querySelector(`#picture-${cardId}`);
  pokemonPictureContainer.innerHTML = `<img src="${imageUrl}" alt="Pokemon Image" class="bg_${types[0]} fullWidth">`;
}

async function renderNextPokemon() {
  hideLoadMoreButton();
  showLoadingSpinner();

  const offset = pokemonStartCount - 1;
  const limit = 25;
  const searchInput = document
    .getElementById("pokemonSearch")
    .value.toLowerCase();
  let nextPokemonUrl;

  if (searchInput) {
    nextPokemonUrl = `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}&name=${searchInput}`;
  } else {
    nextPokemonUrl = `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`;
  }

  const nextPokemonResponse = await fetch(nextPokemonUrl);
  const data = await nextPokemonResponse.json();

  clearPokemonCards();
  await renderPokemonCards(data.results);

  setTimeout(() => {
    hideLoadingSpinner();
  }, 5000); // 5000 Millisekunden = 5 Sekunden
  showLoadMoreButton();
}

function clearPokemonCards() {
  const container = document.getElementById("content");
  container.innerHTML = "";
}

async function filterPokemon() {
  const searchInput = document
    .getElementById("pokemonSearch")
    .value.toLowerCase();
  const allPokemonData = await fetch(BASE_URL);
  const data = await allPokemonData.json();

  if (!searchInput) {
    renderPokemonCards(data.results);
    return;
  } else if (searchInput.length < 3) {
    alert("At least 3 letters are required for the search.");
    return;
  }

  const filteredPokemon = data.results.filter((pokemon) =>
    pokemon.name.toLowerCase().includes(searchInput)
  );

  const limitedPokemon = filteredPokemon.slice(0, 15);

  if (limitedPokemon.length === 0) {
    showNoResultsMessage(searchInput);
  } else {
    clearPokemonCards();
    renderPokemonCards(filteredPokemon);
  }
}

function showNoResultsMessage(searchInput) {
  const container = document.getElementById("content");
  if (container) {
    container.innerHTML = `<p class="no-results-message">No Pokémon found that match “${searchInput}”.</p>`;
  } else {
    console.error("Container mit ID 'content' nicht gefunden.");
  }
}

async function openPokemonDetails(number) {
  const currentPokemonInfoUrl = "https://pokeapi.co/api/v2/pokemon/";
  const response = await fetch(currentPokemonInfoUrl + number);
  const currentPokemonDetails = response.json();

  console.log(currentPokemonDetails);
}

function hideLoadMoreButton() {
  const button = document.getElementById("loadMoreButton");
  if (button) {
    button.classList.add("hidden");
  }
}

function showLoadMoreButton() {
  const button = document.getElementById("loadMoreButton");
  if (button) {
    button.classList.remove("hidden");
  }
}
