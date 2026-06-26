const crops = [
  {
    name: "Rice",
    soils: ["clay", "alluvial", "loamy"],
    seasons: ["kharif", "summer"],
    temp: [22, 35],
    rain: [140, 420],
    ph: [5.5, 7.5],
    water: "high",
    value: 74,
    soilHealth: 44,
    note: "Strong option where water is reliable and the field can retain moisture.",
  },
  {
    name: "Wheat",
    soils: ["loamy", "alluvial", "clay"],
    seasons: ["rabi"],
    temp: [12, 26],
    rain: [35, 120],
    ph: [6, 7.8],
    water: "medium",
    value: 72,
    soilHealth: 48,
    note: "Performs best in cool winter conditions with moderate irrigation.",
  },
  {
    name: "Maize",
    soils: ["loamy", "red", "alluvial", "black"],
    seasons: ["kharif", "summer"],
    temp: [18, 32],
    rain: [50, 180],
    ph: [5.8, 7.8],
    water: "medium",
    value: 78,
    soilHealth: 55,
    note: "Flexible crop for warm weather and well-drained soils.",
  },
  {
    name: "Cotton",
    soils: ["black", "red", "loamy"],
    seasons: ["kharif"],
    temp: [21, 36],
    rain: [45, 140],
    ph: [6, 8],
    water: "medium",
    value: 86,
    soilHealth: 38,
    note: "Well suited to black cotton soil and warm, moderately dry conditions.",
  },
  {
    name: "Groundnut",
    soils: ["sandy", "red", "loamy"],
    seasons: ["kharif", "summer"],
    temp: [22, 34],
    rain: [40, 130],
    ph: [5.5, 7.2],
    water: "low",
    value: 76,
    soilHealth: 82,
    note: "A good legume choice for lighter soils and limited water.",
  },
  {
    name: "Sugarcane",
    soils: ["loamy", "alluvial", "black"],
    seasons: ["annual"],
    temp: [20, 36],
    rain: [100, 300],
    ph: [6, 8],
    water: "high",
    value: 88,
    soilHealth: 35,
    note: "High-return option when irrigation and a long growing window are available.",
  },
  {
    name: "Chickpea",
    soils: ["loamy", "black", "alluvial"],
    seasons: ["rabi"],
    temp: [15, 28],
    rain: [20, 90],
    ph: [6, 8],
    water: "low",
    value: 70,
    soilHealth: 86,
    note: "Low-water pulse crop that improves soil nitrogen.",
  },
  {
    name: "Millet",
    soils: ["sandy", "red", "loamy"],
    seasons: ["kharif", "summer"],
    temp: [24, 40],
    rain: [20, 100],
    ph: [5.5, 8.2],
    water: "low",
    value: 66,
    soilHealth: 74,
    note: "Reliable choice for hot areas with low rainfall.",
  },
  {
    name: "Soybean",
    soils: ["black", "loamy", "alluvial"],
    seasons: ["kharif"],
    temp: [20, 32],
    rain: [60, 180],
    ph: [6, 7.5],
    water: "medium",
    value: 80,
    soilHealth: 88,
    note: "A productive oilseed and legume for monsoon fields with good drainage.",
  },
  {
    name: "Potato",
    soils: ["loamy", "sandy", "alluvial"],
    seasons: ["rabi"],
    temp: [12, 25],
    rain: [25, 110],
    ph: [5, 6.8],
    water: "medium",
    value: 84,
    soilHealth: 45,
    note: "Best for cool conditions, loose soil, and steady moisture.",
  },
];

const waterRank = { low: 1, medium: 2, high: 3 };
const seasonLabels = {
  kharif: "Monsoon",
  rabi: "Winter",
  summer: "Summer",
  annual: "Year-round",
};

const form = document.querySelector("#cropForm");
const recommendations = document.querySelector("#recommendations");
const resultContent = document.querySelector("#resultContent");
const emptyState = document.querySelector("#emptyState");
let hasRecommended = false;

function rangeScore(value, [min, max]) {
  if (value >= min && value <= max) return 100;
  const distance = value < min ? min - value : value - max;
  const tolerance = Math.max((max - min) * 0.8, 1);
  return Math.max(0, 100 - (distance / tolerance) * 100);
}

function scoreCrop(crop, input) {
  const soilScore = crop.soils.includes(input.soil) ? 100 : 35;
  const seasonScore = crop.seasons.includes(input.season) || crop.seasons.includes("annual") ? 100 : 35;
  const tempScore = rangeScore(input.temperature, crop.temp);
  const rainScore = rangeScore(input.rainfall, crop.rain);
  const phScore = rangeScore(input.ph, crop.ph);
  const waterFit =
    input.irrigation === crop.water
      ? 100
      : 100 - Math.abs(waterRank[input.irrigation] - waterRank[crop.water]) * 35;

  let score =
    soilScore * 0.19 +
    seasonScore * 0.18 +
    tempScore * 0.18 +
    rainScore * 0.17 +
    phScore * 0.14 +
    waterFit * 0.14;

  if (input.priority === "lowWater" && crop.water === "low") score += 8;
  if (input.priority === "market") score += (crop.value - 70) * 0.35;
  if (input.priority === "soilHealth") score += (crop.soilHealth - 65) * 0.35;

  return Math.round(Math.min(99, Math.max(5, score)));
}

function readInput() {
  return {
    soil: form.soil.value,
    season: form.season.value,
    temperature: Number(form.temperature.value),
    rainfall: Number(form.rainfall.value),
    ph: Number(form.ph.value),
    irrigation: form.irrigation.value,
    priority: form.priority.value,
  };
}

function describeRisk(input) {
  if (input.temperature > 37 || input.rainfall < 25 || input.ph < 5 || input.ph > 8.5) return "High";
  if (input.temperature > 33 || input.rainfall < 50 || input.rainfall > 260) return "Medium";
  return "Low";
}

function waterDemandLabel(input) {
  if (input.irrigation === "high") return "Reliable";
  if (input.irrigation === "low") return "Limited";
  return "Moderate";
}

function makeTags(crop, input) {
  const tags = [];
  tags.push(crop.water === "low" ? "Low water" : crop.water === "high" ? "High water" : "Moderate water");
  if (crop.soils.includes(input.soil)) tags.push("Soil match");
  if (crop.seasons.includes(input.season) || crop.seasons.includes("annual")) tags.push("Season match");
  if (crop.soilHealth >= 80) tags.push("Soil friendly");
  if (crop.value >= 82) tags.push("High value");
  return tags;
}

function render() {
  if (!hasRecommended) return;

  const input = readInput();
  const ranked = crops
    .map((crop) => ({ ...crop, score: scoreCrop(crop, input) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  document.querySelector("#summaryTitle").textContent = `${ranked[0].name} is the top crop`;
  document.querySelector("#seasonBadge").textContent = seasonLabels[input.season];
  document.querySelector("#waterLevel").textContent = waterDemandLabel(input);
  document.querySelector("#soilStatus").textContent = input.soil[0].toUpperCase() + input.soil.slice(1);
  document.querySelector("#riskLevel").textContent = describeRisk(input);

  recommendations.innerHTML = ranked
    .map(
      (crop) => `
        <article class="crop-card">
          <div>
            <h3>${crop.name}</h3>
            <p>${crop.note}</p>
            <div class="tags">
              ${makeTags(crop, input)
                .map((tag) => `<span>${tag}</span>`)
                .join("")}
            </div>
          </div>
          <div class="score-wrap" aria-label="${crop.score} percent suitability">
            <div class="score">${crop.score}%</div>
            <div class="score-bar"><span style="width: ${crop.score}%"></span></div>
          </div>
        </article>
      `,
    )
    .join("");

  const top = ranked[0];
  document.querySelector("#fieldNote").textContent =
    `${top.name} scores highest for these inputs. Before planting, confirm seed variety, local pest pressure, ` +
    `and current market price with your local agriculture office or extension advisor.`;
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  hasRecommended = true;
  emptyState.hidden = true;
  resultContent.hidden = false;
  render();
});

form.addEventListener("input", render);
