const COHORT = "2510-Jerrad";
const API_BASE = `https://fsa-puppy-bowl.herokuapp.com/api/${COHORT}`;

let players = [];
let selectedPlayer = null;
let teams = [];

const $roster = document.querySelector("#roster");
const $details = document.querySelector("#details");
const $form = document.querySelector("#add-form");
const $formStatus = document.querySelector("#form-status");
const $team = document.querySelector("#team");

function byId(id) {
  return players.find((p) => String(p.id) === String(id));
}

function safeText(value, fallback = "—") {
  return value == null || value === "" ? fallback : value;
}

async function apiGet(path) {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
  const data = await res.json();
  return data;
}

async function apiPost(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`POST ${path} failed: ${res.status} ${text}`);
  }
  return res.json();
}

async function apiDelete(path) {
  const res = await fetch(`${API_BASE}${path}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`DELETE ${path} failed: ${res.status}`);
  return res.json().catch(() => ({}));
}

async function loadPlayers() {
  const json = await apiGet("/players");
  players = json?.data?.players ?? [];
}

async function loadPlayerById(id) {
  const json = await apiGet(`/players/${id}`);
  return json?.data?.player ?? null;
}

async function loadTeams() {
  try {
    const json = await apiGet("/teams");
    teams = json?.data?.teams ?? [];
  } catch {
    teams = [];
  }
}

function renderRoster() {
  if (!players.length) {
    $roster.innerHTML = `<p>No puppies found.</p>`;
    return;
  }

  $roster.replaceChildren(
    ...players.map((player) => {
      const card = document.createElement("article");
      card.className = "card";
      card.dataset.id = player.id;
      card.innerHTML = `
        <img src="${player.imageUrl || player.image || ""}" alt="${
        player.name
      }" />
        <h3>${player.name}</h3>
        <p class="meta">${safeText(player.breed, "Unknown breed")}</p>
      `;
      card.addEventListener("click", async () => {
        try {
          const full = await loadPlayerById(player.id);
          selectedPlayer = full || player;
          renderDetails();
        } catch (err) {
          console.error(err);
          $details.innerHTML = `<p>Failed to load details. Please try again.</p>`;
        }
      });
      return card;
    })
  );
}

function renderDetails() {
  if (!selectedPlayer) {
    $details.innerHTML = `<p>No player selected. Click a puppy from the roster to see details.</p>`;
    return;
  }

  const imgUrl = selectedPlayer.imageUrl || selectedPlayer.image || "";
  const teamName =
    selectedPlayer.team?.name ||
    selectedPlayer.teamName ||
    (selectedPlayer.teamId ? `Team #${selectedPlayer.teamId}` : "Unassigned");

  $details.innerHTML = `
    <div class="details-card">
      <img src="${imgUrl}" alt="${selectedPlayer.name}" />
      <h3>${safeText(selectedPlayer.name)}</h3>
      <p class="meta"><strong>ID:</strong> ${safeText(selectedPlayer.id)}</p>
      <p class="meta"><strong>Breed:</strong> ${safeText(
        selectedPlayer.breed,
        "Unknown"
      )}</p>
      <p class="meta"><strong>Status:</strong> ${safeText(
        selectedPlayer.status,
        "Unknown"
      )}</p>
      <p class="meta"><strong>Team:</strong> ${safeText(
        teamName,
        "Unassigned"
      )}</p>
      <div class="actions">
        <button id="remove-btn">Remove from roster</button>
      </div>
    </div>
  `;

  const $removeBtn = document.querySelector("#remove-btn");
  $removeBtn.addEventListener("click", async () => {
    if (!selectedPlayer) return;
    const id = selectedPlayer.id;
    $removeBtn.disabled = true;
    $removeBtn.textContent = "Removing…";
    try {
      await apiDelete(`/players/${id}`);
      await loadPlayers();
      renderRoster();
      selectedPlayer = null;
      renderDetails();
    } catch (err) {
      console.error(err);
      $removeBtn.disabled = false;
      $removeBtn.textContent = "Remove from roster";
      alert("Failed to remove player. Please try again.");
    }
  });
}

function renderTeamOptions() {
  if (!$team) return;
  while ($team.options.length > 1) $team.remove(1);

  teams.forEach((t) => {
    const opt = document.createElement("option");
    opt.value = t.id;
    opt.textContent = t.name;
    $team.append(opt);
  });
}

$form.addEventListener("submit", async (e) => {
  e.preventDefault();
  $formStatus.textContent = "";
  const fd = new FormData($form);
  const name = fd.get("name")?.toString().trim();
  const breed = fd.get("breed")?.toString().trim();
  const teamIdRaw = fd.get("teamId")?.toString() ?? "";
  const teamId = teamIdRaw === "" ? undefined : Number(teamIdRaw);

  if (!name || !breed) {
    $formStatus.textContent = "Please provide both name and breed.";
    return;
  }

  const payload = { name, breed };
  if (teamId) payload.teamId = teamId;

  try {
    await apiPost("/players", payload);
    $form.reset();
    $formStatus.textContent = "Puppy added! Refreshing roster…";
    await loadPlayers();
    renderRoster();
  } catch (err) {
    console.error(err);
    $formStatus.textContent = "Failed to add puppy. Please try again.";
  }
});

(async function init() {
  try {
    await Promise.all([loadPlayers(), loadTeams()]);
    renderRoster();
    renderTeamOptions();
    renderDetails();
  } catch (err) {
    console.error(err);
    $roster.innerHTML = `<p>Failed to load roster.</p>`;
  }
})();
