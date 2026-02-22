document.getElementById("generateBtn").addEventListener("click", () => {
  const date = document.getElementById("dateInput").value;
  if (!date) return;

  const d = new Date(date);
  const year = d.getFullYear();
  const month = d.getMonth() + 1;

  document.getElementById("results").innerHTML =
    `Fetching cultural data for ${date}...`;

  if (typeof gtag === "function") {
    gtag("event", "birthday_query", {
      birth_year: year,
      birth_month: month,
    });
  }
});
