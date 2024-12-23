function pokemonCardTemplate(number, name, url) {
  return `
     <div class="pokemonCard">
      <h2><span>#${number}</span> ${name}</h2>
      <div class="types" id="types-${number}"></div>
    </div>
    `;
}
