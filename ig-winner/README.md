# ig-winner - BYU Football Tickets Instagram Giveaway Picker

A web application designed for Pioneer Party Gift & Copy's Instagram giveaway. It displays submitted Instagram commenter handles, flies them into a swirling cyclone, and randomly eliminates handles until a grand prize winner and two runners-up are revealed, accompanied by fireworks and celebratory sound effects.

## Features
- **Pioneer Party Branding**: Official branding and color palette (`#1D3E6E`), featuring Emily holding the tickets.
- **Dynamic Cyclone Animation**: Participant handles fly in from screen edges and swirl in a physics-based vortex before random elimination.
- **Winner & Runners-Up**: Selects and displays the winner along with 1st and 2nd runners-up.
- **Audio & Visual Celebration**: Web Audio API sound effects, sound toggle, confetti, and fireworks particle bursts.
- **Comment Video Extraction Utility**: Built-in script in `scripts/` to parse commenter handles from screen recordings.
- **Rules Disclaimer**: Clear terms regarding BYU non-affiliation, electronic ticket transfer, and 24-hour claim window.

## Usage
Simply open `index.html` in your web browser:
```bash
open index.html
```

## Running a giveaway (Giveaway 4 workflow, Oct 2026)
Entries are one per comment, across Instagram and Facebook. Scripts take file paths as arguments, so nothing is tied to one machine.

1. **Record the comment threads.** A Mac screen recording of the phone-mirrored Instagram comments (810x1552) and one of the Facebook thread. Scroll steadily; each comment needs to be on screen for a few frames.
2. **Extract comments with OCR** (Apple Vision, needs Xcode command line tools):
   ```bash
   swiftc -O scripts/extract_giveaway4_comments.swift -o /tmp/extract_ig
   /tmp/extract_ig "<instagram.mov>" data/giveaway4_raw_comments.json 0.3
   swiftc -O scripts/extract_facebook_comments.swift -o /tmp/extract_fb
   /tmp/extract_fb "<facebook.mov>" data/giveaway4_facebook_raw.json 0.3
   ```
   The Instagram script's crop box and comment-boundary rules are for the Mac layout ("2d  Reply" on one line); `extract_giveaway3_comments.swift` is the iPhone-recording version.
3. **Tally entries:** `python3 scripts/giveaway4_entries.py` merges OCR look-alikes and writes `data/giveaway4_entries.json` and `data/giveaway4_summary.md` (top commenters and odds).
4. **Influence and history:** `python3 scripts/build_unified_database.py` (add the new campaign to `CAMPAIGNS`), then `python3 scripts/all_time_influence.py` for `data/all_time_influence.md` (people tagged, network reach, recruiters, four-time entrants).
5. **Customers:** `python3 scripts/match_customers.py <shopify customers_export.csv>` matches entrants to the Shopify export by name and email with a confidence score. Keep the export and its output outside the repo.
6. **Reveal page:** set `data/config.js` (`revealWinners` for chosen winners, or leave it out for a random draw) and `data/handles.js` / `data/handles.json` (one name per person; Facebook names are shown as written). With chosen winners, `data/shortlist.js` is the "final 20": the cyclone narrows to those names, then one Price-is-Right reel per winner spins slowly and lands on the winner before the card and fireworks. Open `index.html` or serve the folder with `python3 -m http.server`. Test hooks: `?test=cyclone`, `?test=spinner`, `?test=winner`.
7. **Music:** `celebrationTrack` in `data/config.js` names the song played at the reveal (Giveaway 4 expects `assets/audio/rise-and-shout.mp3`, the BYU fight song; add the file yourself, it is not in the repo). If the file is missing the page falls back to `assets/audio/celebration.mp3`. `soundEffects: false` keeps the ticks, pops and booms off; the cyclone and celebration music still play.
