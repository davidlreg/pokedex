function pokemonCardTemplate(name, url) {
  return `
     <div class="pokemonCard">
      <h2>${name}</h2>
      <a href="${url}" target="_blank">Details</a>
    </div>
    `;
}
