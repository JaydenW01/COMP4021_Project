# COMP4021_Project
COMP4021 Project (Bomberman)

Title: Bomberman


To start the game: npm install -> npm start / npm run dev

Game Front Page:
- User registration/ Log in
- Game info
- Ranking page (Rank the players by points)
- Start playing => Will bring the player to a waiting room to wait for the second player

Game Play page:
- Traditional Bomberman
- Place a bomb to destroy the wall
- Each wall may have hidden some bonus items (coin to get extra 10 points and heart to get an extra life (max:3))
- Bomb can also be used to attack the other player (e.g. -1hp)
- Once the health of a player is used up, the player loses and the game ends
- If no player dies within the game time, whoever gets mroe points wins (points can be obtained from destroying walls and bonus items)
- If player A is killed by player B, then all the points of player A will be transferred to player B, leaving player A with no points!
- Control: WASD / keyboard up/down/left/right arrow keys, enable cheat mode: c, disable cheat mode: v

Game Over page:
- Shows the winner and loser
- A message box for the 2 players to do a simple communication (e.g. concrat!)
- Play again (send them back to the waiting room)
- Main Menu