//If you would like to, you can create a variable to store the API_URL here.
//This is optional. if you do not want to, skip this and move on.


/////////////////////////////
/*This looks like a good place to declare any state or global variables you might need*/

////////////////////////////



/**
 * Fetches all players from the API.
 * This function should not be doing any rendering
 * @returns {Object[]} the array of player objects
 */
const fetchAllPlayers = async () => {
  //TODO

};

/**
 * Fetches a single player from the API.
 * This function should not be doing any rendering
 * @param {number} playerId
 * @returns {Object} the player object
 */
const fetchSinglePlayer = async (playerId) => {
  //TODO
};

/**
 * Adds a new player to the roster via the API.
 * Once a player is added to the database, the new player
 * should appear in the all players page without having to refresh
 * @param {Object} newPlayer the player to add
 */
/* Note: we need data from our user to be able to add a new player
 * Do we have a way to do that currently...? 
*/
/**
 * Note#2: addNewPlayer() expects you to pass in a
 * new player object when you call it. How can we
 * create a new player object and then pass it to addNewPlayer()?
 */

const addNewPlayer = async (newPlayer) => {
  //TODO
};

/**
 * Removes a player from the roster via the API.
 * Once the player is removed from the database,
 * the player should also be removed from our view without refreshing
 * @param {number} playerId the ID of the player to remove
 */
/**
 * Note: In order to call removePlayer() some information is required.
 * Unless we get that information, we cannot call removePlayer()....
 */
/**
 * Note#2: Don't be afraid to add parameters to this function if you need to!
 */

const removePlayer = async (playerId) => {
  //TODO

};

/**
 * Updates html to display a list of all players or a single player page.
 *
 * If there are no players, a corresponding message is displayed instead.
 *
 * Each player in the all player list is displayed with the following information:
 * - name
 * - id
 * - image (with alt text of the player's name)
 *
 * Additionally, for each player we should be able to:
 * - See details of a single player. The page should show
 *    specific details about the player clicked 
 * - Remove from roster. when clicked, should remove the player
 *    from the database and our current view without having to refresh
 *
 */
const render = () => {
  // TODO

  
};


/**
 * Initializes the app by calling render
 * HOWEVER....
 */
const init = async () => {
  //Before we render, what do we always need...?

  render();

};

init();
