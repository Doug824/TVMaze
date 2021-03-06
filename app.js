const NO_IMAGE = "https://tinyurl.com/missing-tv";

/** Given a query string, return array of matching shows: { id, name, summary, image, episodesUrl }*/
async function searchShows(query) {
  let response = await axios.get(
    `https://api.tvmaze.com/search/shows?q=${query}`);
  let shows = response.data.map(result => {
    let show = result.show;
    return {
      id: show.id,
      name: show.name,
      genres: show.genres,
      status: show.status,
      runtime: show.runtime,
      summary: show.summary,
      cast: show.cast,
      image: show.image ? show.image.medium : NO_IMAGE,
    };
  });
  return shows;
}


/** Populate shows list:- given list of shows, add shows to DOM*/
function populateShows(shows) {
  const $showsList = $("#shows-list");
  $showsList.empty();
  for (let show of shows) {
    let showSummary;
    if (show.summary) {
      showSummary = show.summary;
    } else {
      showSummary = "No summary provided";
    }
    let $item = $(
      `<div class="col-md-6 col-lg-3 Show" data-show-id="${show.id}">
        <div class="card" data-show-id="${show.id}">
          <img class="card-img-top" src="${show.image}">
          <div class="card-body">
            <h5 class="card-title">${show.name}</h5>
            <p class="card-text">${show.summary}</p>
            <button class="btn btn-primary get-episodes">Episodes</button>
            <button class="btn btn-info get-cast">Cast</button>
          </div>
        </div>  
      </div>
      `);
    $showsList.append($item);
  }
}

/** Handle search form submission:
 *    - hide episodes area
 *    - get list of matching shows and show in shows list
 */
$("#search-form").on("submit", async function handleSearch (evt) {
  evt.preventDefault();
  let query = $("#search-query").val();
  if (!query) return;
  $("#episodes-area").hide();
  let shows = await searchShows(query);
  populateShows(shows);
});


/** Given a show ID, return list of episodes: { id, name, season, number }*/
async function getEpisodes(id) {
  let response = await axios.get(`http://api.tvmaze.com/shows/${id}/episodes`);
  let episodes = response.data.map(episode => ({
    id: episode.id,
    name: episode.name,
    season: episode.season,
    number: episode.number,
  }));
  return episodes;
}


/** Given a show ID, return list of cast Members */
async function getActors(id) {
  let response = await axios.get(`http://api.tvmaze.com/shows/${id}/cast`);
  let actors = response.data.map(cast => ({
    id: cast.person.id,
    character: cast.character.name,
    person: cast.person.name,
  }));
  return actors;
}


/** Populate Episodes list */
function populateEpisodes(episodes) {
  const $episodesList = $("#episodes-list");
  $episodesList.empty();
    
  for (let episode of episodes) {
    let $item = $(
      `<li>
        ${episode.name}
        (season ${episode.season}, episode ${episode.number})
      </li>
      `);
    $episodesList.append($item);
  }
  $("#episodes-area").show();
}


/** Populate Cast list */
function populateActors(actors) {
  const $actorsList = $("#episodes-actors");
  $actorsList.empty();
    
  for (let actor of actors) {
    let $item = $(
      `<li>
        ${actor.character}
        (Played by ${actor.person})
      </li>
      `);
    $actorsList.append($item);
  }
  $("#episodes-cast").show();
}


/** Handle click on show name. */
$("#shows-list").on("click", ".get-episodes", async function handleEpisodeClick(e) {
  let showId = $(e.target).closest(".Show").data("show-id");
  let episodes = await getEpisodes(showId);
  populateEpisodes(episodes);
});


$("#shows-list").on("click", ".get-cast", async function handleEpisodeClick(e) {
  let showId = $(e.target).closest(".Show").data("show-id");
  let actors = await getActors(showId);
  populateActors(actors);
});