document.addEventListener("DOMContentLoaded", function () {
  const btn = document.getElementById("generateBtn");

  btn.addEventListener("click", function () {
    const dateInput = document.getElementById("dateInput").value;
    if (!dateInput) return;

    const d = new Date(dateInput);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;

    console.log("Birthday event firing:", year, month);

    if (typeof gtag === "function") {
      gtag("event", "birthday_query", {
        birth_year: year,
        birth_month: month,
      });
    }

    document.getElementById("results").innerHTML =
      `Fetching cultural data for ${dateInput}...`;
  });
});
