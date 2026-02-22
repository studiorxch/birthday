document.addEventListener("DOMContentLoaded", () => {
  let todayCache = null;

  const form = document.getElementById("birthdayForm");
  const dateInput = document.getElementById("dateInput");
  const generateBtn = document.getElementById("generateBtn");
  const statusText = document.getElementById("statusText");
  const shareBtn = document.getElementById("shareBtn");
  const shareStatus = document.getElementById("shareStatus");

  const ageValue = document.getElementById("ageValue");
  const zodiacValue = document.getElementById("zodiacValue");
  const chineseValue = document.getElementById("chineseValue");

  const birthsList = document.getElementById("birthsList");
  const eventsList = document.getElementById("eventsList");
  const ancientList = document.getElementById("ancientList");
  const toggleAncient = document.getElementById("toggleAncient");
  const timelineIntro = document.getElementById("timelineIntro");
  const timelineSubhead = document.getElementById("timelineSubhead");

  const todayBirths = document.getElementById("todayBirths");
  const todayEvents = document.getElementById("todayEvents");

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

  const categoryOrder = [
    "Entertainment & Culture",
    "Business & Philanthropy",
    "Government & Politics",
    "Academics & Science",
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

  function renderGroupedBirths(container, groups) {
    container.innerHTML = "";

    const available = categoryOrder.filter(
      (category) => groups[category]?.length,
    );

    if (!available.length) {
      setState(container, "No entries found for this date.");
      return;
    }

    available.forEach((category) => {
      const group = document.createElement("div");
      group.className = "group";

      const title = document.createElement("h4");
      title.textContent = category;
      group.appendChild(title);

      groups[category].forEach((entry) => {
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
        group.appendChild(item);
      });

      container.appendChild(group);
    });
  }

  function categorizeBirth(text) {
    const value = text.toLowerCase();
    const has = (keywords) => keywords.some((word) => value.includes(word));

    if (
      has([
        "president",
        "prime minister",
        "senator",
        "governor",
        "politician",
        "statesman",
        "diplomat",
        "monarch",
        "king",
        "queen",
        "emperor",
        "justice",
        "mayor",
        "secretary",
      ])
    ) {
      return "Government & Politics";
    }

    if (
      has([
        "business",
        "entrepreneur",
        "investor",
        "philanthropist",
        "industrialist",
        "banker",
        "ceo",
        "founder",
        "executive",
        "tycoon",
      ])
    ) {
      return "Business & Philanthropy";
    }

    if (
      has([
        "scientist",
        "physicist",
        "chemist",
        "biologist",
        "mathematician",
        "astronomer",
        "engineer",
        "doctor",
        "physician",
        "researcher",
        "academic",
        "professor",
      ])
    ) {
      return "Academics & Science";
    }

    return "Entertainment & Culture";
  }

  async function fetchOnThisDay(
    month,
    day,
    birthsLimit = 10,
    eventsLimit = 10,
  ) {
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
      .slice(0, birthsLimit)
      .map((entry) => ({ year: entry.year, text: entry.text }));

    const events = (eventsData.events || [])
      .slice()
      .sort((a, b) => a.year - b.year)
      .slice(0, eventsLimit)
      .map((entry) => ({ year: entry.year, text: entry.text }));

    return {
      births,
      events,
      birthsRaw: birthsData.births || [],
      eventsRaw: eventsData.events || [],
    };
  }

  function getMonthDayLabel(date) {
    return date.toLocaleDateString(undefined, {
      month: "long",
      day: "numeric",
    });
  }

  function updateTimelineIntro(year, month, day) {
    const date = new Date(year, month - 1, day);
    timelineIntro.textContent = `You were born in ${year}. Here’s what happened on ${getMonthDayLabel(date)} during your lifetime.`;
    timelineSubhead.textContent = `Timeline from ${year} to today.`;
  }

  function buildBirthGroups(birthsRaw, currentYear) {
    const filtered = birthsRaw.filter(
      (entry) => entry.year >= currentYear - 125,
    );

    const groups = {
      "Entertainment & Culture": [],
      "Business & Philanthropy": [],
      "Government & Politics": [],
      "Academics & Science": [],
    };

    filtered
      .sort((a, b) => a.year - b.year)
      .slice(0, 50)
      .forEach((entry) => {
        const category = categorizeBirth(entry.text || "");
        if (groups[category].length < 10) {
          groups[category].push({ year: entry.year, text: entry.text });
        }
      });

    return groups;
  }

  function renderTimeline(eventsRaw, birthYear) {
    const events = eventsRaw
      .slice()
      .sort((a, b) => a.year - b.year)
      .slice(0, 20)
      .map((entry) => ({ year: entry.year, text: entry.text }));

    const lifeTimeline = events.filter((entry) => entry.year >= birthYear);
    const ancientHistory = events.filter((entry) => entry.year < birthYear);

    renderEntries(eventsList, lifeTimeline);

    if (ancientHistory.length) {
      renderEntries(ancientList, ancientHistory);
      toggleAncient.disabled = false;
      toggleAncient.textContent = "View Ancient History";
      ancientList.classList.add("hidden");
    } else {
      setState(ancientList, "No earlier events for this date.");
      toggleAncient.disabled = true;
      toggleAncient.textContent = "No Ancient History";
      ancientList.classList.add("hidden");
    }
  }

  async function loadTodayPanel() {
    if (todayCache) {
      renderEntries(todayBirths, todayCache.births);
      renderEntries(todayEvents, todayCache.events);
      return;
    }

    const today = new Date();
    const month = today.getMonth() + 1;
    const day = today.getDate();

    setState(todayBirths, "Loading...");
    setState(todayEvents, "Loading...");

    try {
      const { births, events } = await fetchOnThisDay(month, day, 8, 8);
      todayCache = { births, events };
      renderEntries(todayBirths, births);
      renderEntries(todayEvents, events);
    } catch {
      const message = "Unable to load today’s highlights.";
      setState(todayBirths, message, true);
      setState(todayEvents, message, true);
    }
  }

  async function runForDate(dateValue) {
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

    updateTimelineIntro(year, month, day);

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
    setState(ancientList, "Loading...");
    toggleAncient.disabled = true;

    try {
      const { birthsRaw, eventsRaw } = await fetchOnThisDay(month, day, 50, 20);
      const currentYear = new Date().getFullYear();
      const groups = buildBirthGroups(birthsRaw, currentYear);
      renderGroupedBirths(birthsList, groups);
      renderTimeline(eventsRaw, year);
      statusText.textContent = `Showing results for ${month}/${day}/${year}.`;
    } catch (error) {
      const message =
        "We could not load data from Wikipedia. Please try again.";
      setState(birthsList, message, true);
      setState(eventsList, message, true);
      setState(ancientList, message, true);
      statusText.textContent = message;
    } finally {
      generateBtn.disabled = false;
    }
  }

  function buildShareLink() {
    const dateValue = dateInput.value;
    if (!dateValue) return null;
    const base = "https://birthday.studiorich.tv/";
    return `${base}?date=${dateValue}`;
  }

  async function handleShare() {
    const link = buildShareLink();
    if (!link) {
      shareStatus.textContent = "Select a date first.";
      return;
    }

    shareStatus.textContent = "";

    try {
      if (navigator.share) {
        await navigator.share({
          title: "Birthday Cultural Portal",
          url: link,
        });
        shareStatus.textContent = "Shared.";
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(link);
        shareStatus.textContent = "Link copied.";
      } else {
        shareStatus.textContent = "Copy not supported.";
      }
    } catch (error) {
      shareStatus.textContent = "Share canceled.";
    }

    if (shareStatus.textContent) {
      setTimeout(() => {
        shareStatus.textContent = "";
      }, 2400);
    }
  }

  function handleAncientToggle() {
    const isHidden = ancientList.classList.contains("hidden");
    ancientList.classList.toggle("hidden");
    toggleAncient.textContent = isHidden
      ? "Hide Ancient History"
      : "View Ancient History";
  }

  function initFromQuery() {
    const params = new URLSearchParams(window.location.search);
    const dateParam = params.get("date");
    if (dateParam) {
      dateInput.value = dateParam;
      runForDate(dateParam);
    }
  }

  setState(birthsList, "Add a date to reveal famous birthdays.");
  setState(eventsList, "Add a date to reveal your timeline.");
  setState(ancientList, "Ancient history will appear here.");

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    runForDate(dateInput.value);
  });
  shareBtn.addEventListener("click", handleShare);
  toggleAncient.addEventListener("click", handleAncientToggle);

  loadTodayPanel();
  initFromQuery();
});
