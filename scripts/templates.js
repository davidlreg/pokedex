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
