function pokemonCardTemplate(number, name) {
  return `
     <div class="pokemonCard">
      <h2><span>Nr.${number}</span> ${name}</h2>
      <div class="pokemonImg" id="picture-${number}"></div>
      <div class="types" id="types-${number}"></div>
      <div class="typeDescription" id="typeDescription-${number}"></div>
      <button type="button" class="btn btn-secondary" onclick="openPokemonDetails(${number})">More Info</button>
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

function renderDetailsPokemonCard(currentPokemonDetails, number) {
  return `
  
  <div class="detailedPokemonCardWrapper">
          <div class="nameAndPkmNumber">
            <h2>${currentPokemonDetails.name}</h2>
            <p>Nr.${number}</p>
          </div>
          <div class="pkmTypes">
            <p>TYPE 1</p>
            <p>TYPE 2</p>
          </div>
          <div class="pkmImage">
            <img src="" />
          </div>
          <div class="detailedPkmInformation">
            <a href="#">About</a>
            <a href="#">Base Stats</a>
            <a href="#">Gender</a>
            <a href="#">Shiny</a>
          </div>
          <div class="informationBox">
            <p>INFORMATIN GOES HERE</p>
          </div>
          <div class="skipButtons">
            <a><span class="material-symbols-outlined"> arrow_back </span></a>
            <a
              ><span class="material-symbols-outlined"> arrow_forward </span></a
            >
          </div>
        </div>

  `;
}
