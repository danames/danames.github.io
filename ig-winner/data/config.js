// Giveaway settings shown on the page.
// revealWinners set = "winner reveal" mode: the chosen winners are announced (not a random draw).
// Instagram winners are handles; a Facebook winner is the commenter's name as shown on Facebook.
window.GIVEAWAY_CONFIG = {
  id: "giveaway4",
  tag: "Giveaway #4",
  title: "BYU Football Tickets",
  postImage: null,              // e.g. "assets/giveaway4-post.png" once added
  revealWinners: ["hey_itsme_morg", "fb:natalie.holbrookbagley"],   // fb: prefix = Facebook username (shown as @username via Facebook)
  prizeEach: "2 tickets",
  revealLabel: "This Week's Winners",
  revealNote: "2 tickets each \u00b7 chosen by Emily at Pioneer Party",
  celebrationTrack: "assets/audio/rise-and-shout.mp3",   // BYU fight song; drop the file in assets/audio/ (falls back to celebration.mp3 if missing)
  celebrationLoop: true,
  soundEffects: false            // no ticks, pops or booms; music only
};
