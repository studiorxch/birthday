document.addEventListener("DOMContentLoaded", function () {
  const btn = document.getElementById("generateBtn");

  //
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

  function getChineseZodiac(year) {
    return chineseAnimals[(year - 4) % 12];
  }

  // Event listener for the generate button
  btn.addEventListener("click", () => {
    const date = document.getElementById("dateInput").value;
    if (!date) return;

    const d = new Date(date);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const day = d.getDate();

    const zodiac = getWesternZodiac(month, day);
    const chineseAnimal = getChineseZodiac(year);

    if (typeof gtag === "function") {
      gtag("event", "birthday_query", {
        birth_year: year,
        birth_month: month,
        zodiac: zodiac?.toLowerCase(),
        chinese_animal: chineseAnimal?.toLowerCase(),
      });
    }

    document.getElementById("results").innerHTML =
      `Fetching cultural data for ${date}...`;
  });
});
