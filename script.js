document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("birthdayForm");
  const dateInput = document.getElementById("dateInput");
  const generateBtn = document.getElementById("generateBtn");
  const statusText = document.getElementById("statusText");

  const ageValue = document.getElementById("ageValue");
  const zodiacValue = document.getElementById("zodiacValue");
  const chineseValue = document.getElementById("chineseValue");

  const birthsList = document.getElementById("birthsList");
  const eventsList = document.getElementById("eventsList");

  const chineseAnimals = [
    "Rat",
    "Ox",
    "Tiger",
    "Rabbit",
    "Dragon",
    "Snake",
    "Horse",
    "Goat",
    "Monkey",
    "Rooster",
    "Dog",
    "Pig",
  ];

  function getWesternZodiac(month, day) {
    const zodiac = [
      { sign: "Capricorn", from: [12, 22], to: [1, 19] },
      { sign: "Aquarius", from: [1, 20], to: [2, 18] },
      { sign: "Pisces", from: [2, 19], to: [3, 20] },
      { sign: "Aries", from: [3, 21], to: [4, 19] },
      { sign: "Taurus", from: [4, 20], to: [5, 20] },
      { sign: "Gemini", from: [5, 21], to: [6, 20] },
      { sign: "Cancer", from: [6, 21], to: [7, 22] },
      { sign: "Leo", from: [7, 23], to: [8, 22] },
      { sign: "Virgo", from: [8, 23], to: [9, 22] },
      { sign: "Libra", from: [9, 23], to: [10, 22] },
      { sign: "Scorpio", from: [10, 23], to: [11, 21] },
      { sign: "Sagittarius", from: [11, 22], to: [12, 21] },
    ];

    return zodiac.find(
      (z) =>
        (month === z.from[0] && day >= z.from[1]) ||
        (month === z.to[0] && day <= z.to[1]),
    )?.sign;
  }

  function getChineseZodiac(year) {
    return chineseAnimals[(year - 4) % 12];
  }

  function calculateAge(year, month, day) {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;
    const currentDay = today.getDate();

    let age = currentYear - year;
    const hasHadBirthday =
      currentMonth > month || (currentMonth === month && currentDay >= day);

    if (!hasHadBirthday) {
      age -= 1;
    }

    return age;
  }

  function setState(container, message, isError = false) {
    container.innerHTML = "";
    const state = document.createElement("div");
    state.className = `state${isError ? " error" : ""}`;
    state.textContent = message;
    container.appendChild(state);
  }

  function renderEntries(container, entries) {
    container.innerHTML = "";

    if (!entries.length) {
      setState(container, "No entries found for this date.");
      return;
    }

    entries.forEach((entry) => {
      const item = document.createElement("div");
      item.className = "list-item";

      const year = document.createElement("div");
      year.className = "list-year";
      year.textContent = entry.year;

      const text = document.createElement("div");
      text.className = "list-text";
      text.textContent = entry.text;

      item.appendChild(year);
      item.appendChild(text);
      container.appendChild(item);
    });
  }

  async function fetchOnThisDay(month, day) {
    const birthsUrl = `https://en.wikipedia.org/api/rest_v1/feed/onthisday/births/${month}/${day}`;
    const eventsUrl = `https://en.wikipedia.org/api/rest_v1/feed/onthisday/events/${month}/${day}`;

    const [birthsResponse, eventsResponse] = await Promise.all([
      fetch(birthsUrl),
      fetch(eventsUrl),
    ]);

    if (!birthsResponse.ok || !eventsResponse.ok) {
      throw new Error("Wikipedia API request failed.");
    }

    const [birthsData, eventsData] = await Promise.all([
      birthsResponse.json(),
      eventsResponse.json(),
    ]);

    const births = (birthsData.births || [])
      .slice()
      .sort((a, b) => a.year - b.year)
      .slice(0, 10)
      .map((entry) => ({ year: entry.year, text: entry.text }));

    const events = (eventsData.events || [])
      .slice()
      .sort((a, b) => a.year - b.year)
      .slice(0, 10)
      .map((entry) => ({ year: entry.year, text: entry.text }));

    return { births, events };
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const dateValue = dateInput.value;
    if (!dateValue) {
      statusText.textContent = "Please select a valid date.";
      return;
    }

    const date = new Date(dateValue);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    if (Number.isNaN(year)) {
      statusText.textContent = "Please select a valid date.";
      return;
    }

    const age = calculateAge(year, month, day);

    if (age < 0) {
      statusText.textContent = "That date is in the future. Try another.";
      return;
    }

    const zodiac = getWesternZodiac(month, day) || "Unknown";
    const chineseAnimal = getChineseZodiac(year) || "Unknown";

    ageValue.textContent = `${age}`;
    zodiacValue.textContent = zodiac;
    chineseValue.textContent = chineseAnimal;

    if (typeof gtag === "function") {
      gtag("event", "birthday_query", {
        birth_year: year,
        birth_month: month,
        zodiac: zodiac.toLowerCase(),
        chinese_animal: chineseAnimal.toLowerCase(),
      });
    }

    statusText.textContent = "Loading...";
    generateBtn.disabled = true;
    setState(birthsList, "Loading...");
    setState(eventsList, "Loading...");

    try {
      const { births, events } = await fetchOnThisDay(month, day);
      renderEntries(birthsList, births);
      renderEntries(eventsList, events);
      statusText.textContent = `Showing results for ${month}/${day}/${year}.`;
    } catch (error) {
      const message =
        "We could not load data from Wikipedia. Please try again.";
      setState(birthsList, message, true);
      setState(eventsList, message, true);
      statusText.textContent = message;
    } finally {
      generateBtn.disabled = false;
    }
  }

  setState(birthsList, "Add a date to reveal famous birthdays.");
  setState(eventsList, "Add a date to reveal historical events.");

  form.addEventListener("submit", handleSubmit);
});
