function pokemonCardTemplate(cardId, name, id) {
  return `
     <div class="pokemonCard">
      <h2><span>Nr.${id}</span> ${name}</h2>
      <div class="pokemonImg" id="picture-${cardId}"></div>
      <div class="types" id="types-${cardId}"></div>
      <div class="typeDescription" id="typeDescription-${cardId}"></div>
      <button type="button" class="btn btn-secondary" onclick="openPokemonDetails(${id})">More Info</button>
    </div>
    `;
}

function renderLoadingSpinner() {
  return ` 
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    xmlns:xlink="http://www.w3.org/1999/xlink" 
    viewBox="0 0 100 100" 
    width="100" 
    height="100" 
    aria-label="Pokeball Loading Spinner" 
    role="img"
    id="loadingSpinner"
  <!-- Pokeball Outer Circle -->
  <circle cx="50" cy="50" r="45" fill="white" stroke="black" stroke-width="5"/>
  
  <!-- Top Half (Red) -->
  <path d="M5 50 A 45 45 0 0 1 95 50" fill="red" />
  
  <!-- Bottom Half (White) -->
  <path d="M5 50 A 45 45 0 0 0 95 50" fill="white" />
  
  <!-- Inner Circle (Black Outline) -->
  <circle cx="50" cy="50" r="10" fill="white" stroke="black" stroke-width="5"/>
  
  <!-- Center Dot -->
  <circle cx="50" cy="50" r="5" fill="black" />

  <!-- Rotation Animation -->
  <style>
    @keyframes rotatePokeball {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    svg {
      animation: rotatePokeball 1.5s linear infinite;
      transform-origin: center;
    }
  </style>
</svg>
  `;
}

function renderDetailsPokemonCard(
  currentPokemon,
  id,
  types,
  currentPokemonIndex
) {
  const typeClass = types.length > 0 ? `bg_${types[0]}` : ""; // Fallback-Klasse für Bild

  return `
  <div class="detailedPokemonCardWrapper">
    <!-- Schließen -->
    <div class="closeButtonContainer">
      <a onclick="hideDetailedPkmContainer()"><span class="material-symbols-outlined">close</span></a>
    </div>
    <!-- Name und ID -->
    <div class="nameAndPkmNumber">
      <h2>${
        currentPokemon.name.charAt(0).toUpperCase() +
        currentPokemon.name.slice(1)
      }</h2>
      <p>Nr.${id}</p>
    </div>
    <!-- Typen -->
    <div class="pkmTypes" id="pokemonTypesContainer">
      ${types
        .map(
          (type) =>
            `<p class="type bg_${type.toLowerCase()}">${
              type.charAt(0).toUpperCase() + type.slice(1)
            }</p>`
        )
        .join("")}
    </div>
    <!-- Bild -->
    <div class="pkmImage ${typeClass}">
      <img src="${currentPokemon.normal_version_pic || fallbackImage}" />
    </div>
    <!-- Detail-Links -->
    <div class="detailedPkmInformation">
      <a onclick="renderAboutSection()">About</a>
      <a onclick="renderBaseStats()">Base Stats</a>
      <a onclick="renderShinyVersion()">Shiny</a>
    </div>
    <!-- Informationsbox -->
    <div class="informationBox" id="informationBox"></div>
    <!-- Navigation -->
    <div class="skipButtons">
      <a onclick="showPreviousPokemon()">
        <span class="material-symbols-outlined">arrow_back</span>
      </a>
      <span>${currentPokemonIndex + 1} / ${loadedPkm.length}</span>
      <a onclick="showNextPokemon()">
        <span class="material-symbols-outlined">arrow_forward</span>
      </a>
    </div>
  </div>
  `;
}

function renderAboutSectionTemplate(
  pkmSpecies,
  pkmHeight,
  pkmWeight,
  pkmAbilities
) {
  // Falls pkmAbilities kein Array ist, mache es zu einem leeren Array
  if (typeof pkmAbilities === "string") {
    pkmAbilities = pkmAbilities.split(", "); // Trenne die Abilities in ein Array
  } else if (!Array.isArray(pkmAbilities)) {
    pkmAbilities = []; // Fallback, falls ein anderes Format vorliegt
  }

  return `
    <div class="aboutSection">
    <div class="pkmDetails" id="pkmSpecies">
        <span>Species:</span> <p><b>${
          pkmSpecies.charAt(0).toUpperCase() + pkmSpecies.slice(1)
        }</b></p>
      </div>
      <div class="pkmDetails" id="pkmHeight">
        <span>Height:</span> <p><b>${pkmHeight} m</b></p>
      </div>
      <div class="pkmDetails" id="pkmWeight">
        <span>Weight:</span> <p><b>${pkmWeight} kg</b></p>
      </div>
      <div class="pkmDetails" id="pkmAbilities">
        <span>Abilities:</span>
        ${pkmAbilities
          .map(
            (ability) =>
              `<p class="abilities"><b>${
                ability.charAt(0).toUpperCase() + ability.slice(1)
              }</b></p>`
          )
          .join("")}
      </div>
    </div>
  `;
}

function renderBaseStatsTemplate(
  hp,
  attack,
  defense,
  sp_attack,
  sp_def,
  speed,
  total
) {
  return `

  <div class="baseStats">
  <div class="stats"><span>HP</span><p><b>${hp}</b></p></div>
  <div class="stats"><span>Attack</span><p><b>${attack}</b></p></div>
  <div class="stats"><span>Defense</span><p><b>${defense}</b></p></div>
  <div class="stats"><span>Sp. Atk</span><p><b>${sp_attack}</b></p></div>
  <div class="stats"><span>Sp. Def</span><p><b>${sp_def}</b></p></div>
  <div class="stats"><span>Speed</span><p><b>${speed}</b></p></div>
  <div class="stats"><span>Total</span><p><b>${total}</b></p></div>
  </div>
  
  `;
}

function renderShinyVersionTemplate(currentPokemon, types) {
  const typeClass = types.length > 0 ? `bg_${types[0]}` : ""; // Fallback-Klasse für Bild

  return `
  <div class="shinyPokemon" >
  
  <div class="detailedPkmImage ${typeClass}">
      <img src="${currentPokemon.shiny_version_pic || fallbackImage}" />
    </div>
  
  </div>
  `;
}
