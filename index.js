const COHORT = "2510-Jerrad";
const API_BASE = "https://fsa-puppy-bowl.herokuapp.com/api/" + COHORT;

let players = [];
let selectedPlayer = null;
let teams = [];

const $roster = document.querySelector("#roster");
const $details = document.querySelector("#details");
const $form = document.querySelector("#add-form");
const $formStatus = document.querySelector("#form-status");
const $team = document.querySelector("#team");

async function fetchAllPlayers() {
  try {
    const response = await fetch(API_BASE + "/players");
    const result = await response.json();

    if (result.data && result.data.players) {
      return result.data.players;
    } else {
      return [];
    }
  } catch (e) {
    console.error(e);
    return [];
  }
}

async function fetchSinglePlayer(playerId) {
  try {
    const response = await fetch(API_BASE + "/players/" + playerId);
    const result = await response.json();

    if (result.data && result.data.player) {
      return result.data.player;
    } else {
      return null;
    }
  } catch (e) {
    console.error(e);
    return null;
  }
}

async function addNewPlayer(newPlayer) {
  try {
    await fetch(API_BASE + "/players", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newPlayer),
    });

    players = await fetchAllPlayers();
    render();
  } catch (e) {
    console.error(e);
  }
}

async function removePlayer(playerId) {
  try {
    await fetch(API_BASE + "/players/" + playerId, { method: "DELETE" });
    selectedPlayer = null;
    players = await fetchAllPlayers();
    render();
  } catch (e) {
    console.error(e);
  }
}

async function getTeams() {
  try {
    const res = await fetch(API_BASE + "/teams");
    const result = await res.json();

    if (result.data && result.data.teams) {
      teams = result.data.teams;
    } else {
      teams = [];
    }
  } catch (e) {
    console.error(e);
  }
}

function PlayerListItem(player) {
  const $li = document.createElement("li");

  if (selectedPlayer && player.id === selectedPlayer.id) {
    $li.classList.add("selected");
  }

  let img = "";
  if (player.imageUrl) {
    img = player.imageUrl;
  }

  let name = "";
  if (player.name) {
    name = player.name;
  }

  $li.innerHTML = `
    <button class="card">
      <img src="${img}" alt="${name}">
      <h4>${name}</h4>
      <p>ID ${player.id}</p>
    </button>
  `;

  const $btn = $li.querySelector("button");
  $btn.addEventListener("click", function () {
    fetchSinglePlayer(player.id).then(function (data) {
      selectedPlayer = data;
      render();
    });
  });

  return $li;
}

function PlayerList() {
  const $ul = document.createElement("ul");
  $ul.classList.add("players");

  const items = players.map(PlayerListItem);

  $ul.innerHTML = "";
  for (let i = 0; i < items.length; i++) {
    $ul.appendChild(items[i]);
  }

  return $ul;
}

function SelectedPlayer() {
  if (!selectedPlayer) {
    const $p = document.createElement("p");
    $p.textContent = "Select a puppy to see details.";
    return $p;
  }

  const p = selectedPlayer;

  let img = "";
  if (p.imageUrl) {
    img = p.imageUrl;
  }

  let name = "";
  if (p.name) {
    name = p.name;
  }

  let breed = "Unknown";
  if (p.breed) {
    breed = p.breed;
  }

  let status = "Unknown";
  if (p.status) {
    status = p.status;
  }

  let teamName = "Unassigned";
  if (p.team && p.team.name) {
    teamName = p.team.name;
  } else if (p.teamId) {
    const found = teams.find(function (team) {
      return team.id === p.teamId;
    });
    if (found && found.name) {
      teamName = found.name;
    } else {
      teamName = "Team #" + p.teamId;
    }
  }

  const $section = document.createElement("section");
  $section.innerHTML = `
    <img src="${img}" alt="${name}">
    <h3>${name} #${p.id}</h3>
    <p><strong>Breed:</strong> ${breed}</p>
    <p><strong>Status:</strong> ${status}</p>
    <p><strong>Team:</strong> ${teamName}</p>
    <button id="remove-btn">Remove from roster</button>
  `;

  const $remove = $section.querySelector("#remove-btn");
  $remove.addEventListener("click", function () {
    removePlayer(p.id);
  });

  return $section;
}

function renderTeamOptions() {
  while ($team.options.length > 1) {
    $team.remove(1);
  }

  teams.forEach(function (t) {
    const opt = document.createElement("option");
    opt.value = t.id;
    opt.textContent = t.name;
    $team.appendChild(opt);
  });
}

function render() {
  if (players.length === 0) {
    $roster.textContent = "No puppies found.";
  } else {
    const list = PlayerList();
    $roster.replaceChildren(list);
  }

  const details = SelectedPlayer();
  $details.replaceChildren(details);
}

if ($form) {
  $form.addEventListener("submit", function (e) {
    e.preventDefault();
    const data = new FormData($form);

    const nameValue = data.get("name");
    const breedValue = data.get("breed");
    if (!nameValue || !breedValue) {
      return;
    }

    const name = nameValue;
    const breed = breedValue;

    const teamIdValue = data.get("teamId");
    let payload;

    if (teamIdValue && teamIdValue !== "") {
      payload = {
        name: name,
        breed: breed,
        teamId: Number(teamIdValue),
      };
    } else {
      payload = {
        name: name,
        breed: breed,
      };
    }

    addNewPlayer(payload);
    $form.reset();

    if ($formStatus) {
      $formStatus.textContent = "Puppy added!";
    }
  });
}

async function init() {
  await getTeams();
  players = await fetchAllPlayers();
  render();
  renderTeamOptions();
}

init();
