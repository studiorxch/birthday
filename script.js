document.getElementById("generateBtn").addEventListener("click", () => {
  const date = document.getElementById("dateInput").value;
  document.getElementById("results").innerHTML = `
    <p>Fetching cultural data for ${date}...</p>
  `;
});
