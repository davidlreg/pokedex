function pokemonCardTemplate(number, name, url) {
  return `
     <div class="pokemonCard">
      <h2><span>#${number}</span> ${name}</h2>
      <a href="${url}" target="_blank">Details</a>
    </div>
    `;
}
