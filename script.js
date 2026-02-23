document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("birthdayForm");
  const dateInput = document.getElementById("dateInput");
  const generateBtn = document.getElementById("generateBtn");
  const statusText = document.getElementById("statusText");
  const shareBtn = document.getElementById("shareBtn");

  const ageValue = document.getElementById("ageValue");
  const zodiacValue = document.getElementById("zodiacValue");
  const chineseValue = document.getElementById("chineseValue");

  const birthsList = document.getElementById("birthsList");
  const eventsList = document.getElementById("eventsList");
  const ancientList = document.getElementById("ancientList");
  const toggleAncient = document.getElementById("toggleAncient");

  const timelineIntro = document.getElementById("timelineIntro");
  const timelineSubhead = document.getElementById("timelineSubhead");

  const todayPanel = document.querySelector(".today-panel");
  const todayHeading = document.querySelector(".today-panel h2");
  const todayBirthsContainer = document.getElementById("todayBirths");
  const todayTabs = document.querySelectorAll(".today-tab");

  let todayData = [];

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

  /* ======================
     Utilities
  ====================== */

  function calculateAge(year, month, day) {
    const today = new Date();
    let age = today.getFullYear() - year;
    const hasHadBirthday =
      today.getMonth() + 1 > month ||
      (today.getMonth() + 1 === month && today.getDate() >= day);
    if (!hasHadBirthday) age--;
    return age;
  }

  function getChineseZodiac(year) {
    return chineseAnimals[(year - 4) % 12] || "Unknown";
  }

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

    return (
      zodiac.find(
        (z) =>
          (month === z.from[0] && day >= z.from[1]) ||
          (month === z.to[0] && day <= z.to[1]),
      )?.sign || "Unknown"
    );
  }

  function setState(container, message) {
    container.innerHTML = `<div class="state">${message}</div>`;
  }

  function renderEntries(container, entries, limit = 8) {
    container.innerHTML = "";
    if (!entries.length) {
      setState(container, "No entries found.");
      return;
    }

    entries.slice(0, limit).forEach((entry) => {
      container.innerHTML += `
        <div class="list-item">
          <div class="list-year">${entry.year}</div>
          <div class="list-text">${entry.text}</div>
        </div>
      `;
    });
  }

  /* ======================
     Today Categorization
  ====================== */

  function categorizeToday(text) {
    const t = text.toLowerCase();

    if (
      t.includes("singer") ||
      t.includes("rapper") ||
      t.includes("musician") ||
      t.includes("composer")
    )
      return "Music";

    if (
      t.includes("actor") ||
      t.includes("actress") ||
      t.includes("film") ||
      t.includes("television") ||
      t.includes("director")
    )
      return "Film & TV";

    if (
      t.includes("artist") ||
      t.includes("writer") ||
      t.includes("author") ||
      t.includes("poet")
    )
      return "Arts & Culture";

    if (
      t.includes("business") ||
      t.includes("entrepreneur") ||
      t.includes("ceo")
    )
      return "Business";

    if (
      t.includes("football") ||
      t.includes("basketball") ||
      t.includes("hockey") ||
      t.includes("cricket")
    )
      return "Sports";

    return "Other";
  }

  function filterTodayByCategory(category) {
    if (category === "All") return todayData;
    return todayData.filter((entry) => entry.category === category);
  }

  function activateTab(tab) {
    todayTabs.forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");

    const category = tab.dataset.tab;
    renderEntries(todayBirthsContainer, filterTodayByCategory(category));
  }

  /* ======================
     Fetching
  ====================== */

  async function fetchBirths(month, day) {
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/feed/onthisday/births/${month}/${day}`,
    );
    if (!res.ok) return [];

    const data = await res.json();

    return (data.births || [])
      .filter((b) => b.year >= 1900)
      .sort((a, b) => b.year - a.year)
      .map((b) => ({
        year: b.year,
        text: b.text,
        category: categorizeToday(b.text),
      }));
  }

  async function fetchEvents(month, day) {
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/feed/onthisday/events/${month}/${day}`,
    );
    if (!res.ok) return [];

    const data = await res.json();

    return (data.events || [])
      .sort((a, b) => b.year - a.year)
      .map((e) => ({ year: e.year, text: e.text }));
  }

  async function loadToday() {
    todayPanel.style.display = "block";

    const today = new Date();
    const month = today.getMonth() + 1;
    const day = today.getDate();

    const label = today.toLocaleDateString(undefined, {
      month: "long",
      day: "numeric",
    });

    todayHeading.textContent = `Today’s Famous Birthdays — ${label}`;

    setState(todayBirthsContainer, "Loading...");

    todayData = await fetchBirths(month, day);

    renderEntries(todayBirthsContainer, filterTodayByCategory("Music"));
  }

  /* ======================
     Birthday Query
  ====================== */

  async function runForDate(dateValue) {
    if (!dateValue) return;

    todayPanel.style.display = "none";

    const [yearStr, monthStr, dayStr] = dateValue.split("-");
    const year = parseInt(yearStr);
    const month = parseInt(monthStr);
    const day = parseInt(dayStr);

    ageValue.textContent = calculateAge(year, month, day);
    zodiacValue.textContent = getWesternZodiac(month, day);
    chineseValue.textContent = getChineseZodiac(year);

    timelineIntro.textContent = `You were born in ${year}. Here’s what happened on ${month}/${day} during your lifetime.`;

    statusText.textContent = `Showing results for ${month}/${day}/${year}.`;

    const [births, events] = await Promise.all([
      fetchBirths(month, day),
      fetchEvents(month, day),
    ]);

    renderEntries(birthsList, births, 20);

    const lifeEvents = events.filter((e) => e.year >= year);
    const ancientEvents = events.filter((e) => e.year < year);

    renderEntries(eventsList, lifeEvents, 20);
    renderEntries(ancientList, ancientEvents, 15);

    ancientList.classList.add("hidden");
    toggleAncient.textContent = "View Ancient History";
  }

  /* ======================
     Events
  ====================== */

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    runForDate(dateInput.value);
  });

  toggleAncient.addEventListener("click", () => {
    ancientList.classList.toggle("hidden");
    toggleAncient.textContent = ancientList.classList.contains("hidden")
      ? "View Ancient History"
      : "Hide Ancient History";
  });

  shareBtn.addEventListener("click", async () => {
    const link = `${window.location.origin}/?date=${dateInput.value}`;
    await navigator.clipboard.writeText(link);

    const original = shareBtn.textContent;
    shareBtn.textContent = "Link Copied ✓";

    setTimeout(() => {
      shareBtn.textContent = original;
    }, 2000);
  });

  todayTabs.forEach((tab) => {
    tab.addEventListener("click", () => activateTab(tab));
  });

  /* ======================
     Init
  ====================== */

  const params = new URLSearchParams(window.location.search);
  const dateParam = params.get("date");

  if (dateParam) {
    dateInput.value = dateParam;
    runForDate(dateParam);
  } else {
    statusText.textContent = "Awaiting a date.";
    loadToday();
  }
});
