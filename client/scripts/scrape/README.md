# GenshinQL Data Scraper

This directory contains web scraping scripts that extract game data from the [Genshin Impact Wiki](https://genshin-impact.fandom.com) using Selenium WebDriver.

## Overview

The scraper collects comprehensive Genshin Impact data including:

- **Characters**: Base stats, talents, constellations, materials, ascension data
- **Weapons**: Stats, passives, materials, ascension phases, farming schedules
- **Artifacts**: Set bonuses, piece stats, icon URLs
- **Talents**: Talent material farming schedules
- **Primitives**: Elements, regions, weapon types (extracted from character data)
- **Gallery**: Character artwork and promotional images
- **Version Data**: New characters, weapons, events, artifacts per game version
- **Imaginarium Theater**: Current season data

## Prerequisites

### Required Dependencies

```bash
npm install selenium-webdriver chalk zod
```

### ChromeDriver Setup

The scraper uses Chrome/Chromium via Selenium. Ensure you have:

- Chrome or Chromium browser installed
- ChromeDriver matching your browser version (auto-handled by `setup.ts`)

## Quick Start

### Using Make (Recommended)

```bash
# Show all available commands
make help

# Scrape all data
make all

# Scrape specific data types
make characters
make weapons
make artifacts
```

### Using Node Directly

```bash
# Via makefile.mjs (same as make commands)
node makefile.mjs help
node makefile.mjs characters

# Direct script execution with tsx
npx tsx characters.ts --base
npx tsx weapons.ts --base --calendar
```

## Available Commands

### Character Scraping

| Command                          | Description                                               |
| -------------------------------- | --------------------------------------------------------- |
| `make characters-base`           | Scrape base character data from wiki table                |
| `make characters-detailed`       | Scrape detailed data (talents, constellations, materials) |
| `make characters-check`          | Validate character data completeness                      |
| `make characters-roles`          | Scrape and update character role information              |
| `make characters-optimize`       | Remove redundant URL fields from characters.json          |
| `make characters-optimize-files` | Optimize individual character JSON files                  |
| `make characters`                | Full pipeline: base + detailed scraping                   |

**Direct Command:**

```bash
npx tsx characters.ts --base            # Base data only
npx tsx characters.ts --detailed        # Detailed data only
npx tsx characters.ts --check           # Validation check
npx tsx characters.ts --roles           # Role scraping
npx tsx characters.ts --optimize        # Optimize main file
npx tsx characters.ts --optimize-files  # Optimize individual files
```

### Weapon Scraping

| Command                 | Description                                           |
| ----------------------- | ----------------------------------------------------- |
| `make weapons-base`     | Scrape base weapon data from wiki tables              |
| `make weapons-detailed` | Scrape detailed data (materials, passives, ascension) |
| `make weapons-calendar` | Scrape weapon material farming calendar               |
| `make weapons-full`     | Base + calendar + auto-optimization                   |
| `make weapons`          | Full pipeline: base + detailed scraping               |

**Direct Command:**

```bash
npx tsx weapons.ts --base      # Base weapon stats
npx tsx weapons.ts --detailed  # Detailed weapon info
npx tsx weapons.ts --calendar  # Material calendar
npx tsx weapons.ts --base --calendar  # Combined (optimizes automatically)
```

### Artifact Scraping

| Command          | Description                        |
| ---------------- | ---------------------------------- |
| `make artifacts` | Scrape all artifact sets from wiki |

**Direct Command:**

```bash
npx tsx artifacts.ts
```

### Gallery Scraping

| Command              | Description                                    |
| -------------------- | ---------------------------------------------- |
| `make gallery`       | Scrape and merge gallery images for characters |
| `make gallery-check` | Check gallery data coverage                    |

**Direct Command:**

```bash
npx tsx gallery.ts --merge  # Scrape and merge
npx tsx gallery.ts --check  # Coverage check
```

### Talent Material Scraping

| Command        | Description                             |
| -------------- | --------------------------------------- |
| `make talents` | Scrape talent material farming schedule |

**Direct Command:**

```bash
npx tsx talents.ts
```

### Primitives Generation

| Command           | Description                                                 |
| ----------------- | ----------------------------------------------------------- |
| `make primitives` | Extract elements, regions, weapon types from character data |

**Direct Command:**

```bash
npx tsx primitives.ts
```

**Note:** Requires `characters.json` to exist. Run after character scraping.

### Version Data Scraping

| Command        | Description                                                    |
| -------------- | -------------------------------------------------------------- |
| `make version` | Scrape version-specific data (new characters, events, weapons) |

**Direct Command:**

```bash
npx tsx version.ts
```

### Imaginarium Theater

| Command                    | Description                                    |
| -------------------------- | ---------------------------------------------- |
| `make imaginarium-theater` | Scrape current Imaginarium Theater season data |

**Direct Command:**

```bash
npx tsx imaginarium-theater.ts
```

### Combined Operations

| Command    | Description                        |
| ---------- | ---------------------------------- |
| `make all` | Run all scraping tasks in sequence |

## File Structure

```
client/scripts/scrape/
├── README.md                   # This file
├── Makefile                    # Make command definitions
├── makefile.mjs               # Node-based task runner
│
├── characters.ts              # Character scraping logic
├── weapons.ts                 # Weapon scraping logic
├── artifacts.ts               # Artifact scraping logic
├── gallery.ts                 # Gallery image scraping
├── talents.ts                 # Talent material calendar
├── primitives.ts              # Primitive data extraction
├── version.ts                 # Version-specific data scraping
├── imaginarium-theater.ts     # Theater season scraping
│
├── setup.ts                   # WebDriver setup and utilities
├── utils.ts                   # Common scraping utilities
├── scraping-helpers.ts        # Helper functions for parsing
├── fileio.ts                  # File I/O operations
├── schema.ts                  # Zod validation schemas
└── urls.ts                    # Wiki URL constants
```

## Script Details

### characters.ts

Scrapes character data in two phases:

1. **Base scraping** (`--base`): Extracts character list with basic stats from wiki tables
2. **Detailed scraping** (`--detailed`): For each character, scrapes:
   - Talents (Normal Attack, Elemental Skill, Elemental Burst)
   - Constellations (all 6 levels)
   - Ascension materials
   - Character images
   - Release version

**Flags:**

- `--base`: Scrape base character data
- `--detailed`: Scrape detailed individual character pages
- `--check`: Validate completeness of character files
- `--roles`: Update character role information
- `--optimize`: Remove redundant URLs from characters.json
- `--optimize-files`: Optimize individual character JSON files

### weapons.ts

Scrapes weapon data across weapon types (Sword, Claymore, Polearm, Bow, Catalyst):

1. **Base scraping** (`--base`): Weapon stats, effects, icons
2. **Detailed scraping** (`--detailed`): Weapon passives, materials, ascension phases
3. **Calendar scraping** (`--calendar`): Material farming schedule by nation/weekday

**Flags:**

- `--base`: Scrape base weapon data tables
- `--detailed`: Scrape individual weapon pages
- `--calendar`: Scrape material calendar
- `--base --calendar`: Auto-optimizes weapon data with indices

**Auto-optimization:** When both `--base` and `--calendar` are used, weapon data is automatically optimized by adding nation/weekday indices instead of full strings.

### artifacts.ts

Scrapes artifact set data:

- Set names and bonuses (2-piece and 4-piece)
- Individual artifact pieces (Flower, Plume, Sands, Goblet, Circlet)
- Icon URLs for each piece

**No flags required** - runs complete scrape by default.

### gallery.ts

Manages character gallery images:

- Extracts promotional art from character wiki pages
- Merges with existing gallery data
- Checks coverage across all characters

**Flags:**

- `--merge`: Scrape and merge gallery data
- `--check`: Check which characters are missing gallery images

### talents.ts

Scrapes the talent material farming calendar:

- Organizes materials by region (Mondstadt, Liyue, etc.)
- Shows which days materials are available
- Lists characters that use each material

**No flags required** - runs complete scrape by default.

### primitives.ts

Extracts primitive/enum data from scraped character data:

- Elements (Pyro, Hydro, Cryo, etc.)
- Regions (Mondstadt, Liyue, Inazuma, etc.)
- Weapon Types (Sword, Claymore, etc.)

**Prerequisites:** Requires `public/characters.json` to exist.

### version.ts

Scrapes version-specific content (e.g., 5.4, 5.5):

- New characters with descriptions and rarities
- New weapons with stats
- Events and wish banners
- New areas and regions
- Spiral Abyss updates
- New artifact sets

**No flags required** - scrapes latest version data.

### imaginarium-theater.ts

Scrapes current Imaginarium Theater season:

- Season schedule and dates
- Stage information
- Recommended characters

**No flags required** - scrapes current season.

## Common Workflows

### Initial Setup (Fresh Scrape)

```bash
# 1. Scrape base data first
make characters-base
make weapons-base
make artifacts

# 2. Generate primitives from base data
make primitives

# 3. Scrape detailed data (takes longer)
make characters-detailed
make weapons-detailed

# 4. Optional: Gallery, talents, version data
make gallery
make talents
make version
```

### Update Existing Data

```bash
# Force re-scrape specific data type
make characters-detailed  # Skips already-scraped characters by default
make weapons-detailed     # Skips already-scraped weapons by default

# To force complete re-scrape, delete the relevant public/ files first
```

### Quick Data Validation

```bash
make characters-check  # Validate character data completeness
make gallery-check     # Check gallery coverage
```

### Optimize Data Files

```bash
# Remove redundant URL fields to reduce file size
make characters-optimize
make characters-optimize-files
```

## Output Files

All scraped data is saved to `client/public/` directory:

| File                     | Generated By               | Description                     |
| ------------------------ | -------------------------- | ------------------------------- |
| `characters.json`        | `characters.ts --base`     | Array of base character data    |
| `characters/{name}.json` | `characters.ts --detailed` | Individual character details    |
| `weapons.json`           | `weapons.ts --base`        | Weapon data organized by type   |
| `weapons/{name}.json`    | `weapons.ts --detailed`    | Individual weapon details       |
| `weapons-detailed.json`  | `weapons.ts --detailed`    | Combined detailed weapons       |
| `weaponCalendar.json`    | `weapons.ts --calendar`    | Material farming schedule       |
| `artifacts.json`         | `artifacts.ts`             | All artifact sets               |
| `talents.json`           | `talents.ts`               | Talent material calendar        |
| `primitives.json`        | `primitives.ts`            | Elements, regions, weapon types |
| `gallery.json`           | `gallery.ts`               | Character artwork URLs          |
| `version/latest.json`    | `version.ts`               | Latest version content          |

## Troubleshooting

### ChromeDriver Issues

```bash
# If ChromeDriver fails to start or version mismatch occurs
# The setup.ts script should auto-download the correct version
# If issues persist, manually specify ChromeDriver path in setup.ts
```

### Cloudflare Challenges

The scraper includes `handleCloudflareChallenge()` to wait for Cloudflare protection pages. If you see:

```
Waiting for Cloudflare challenge to complete...
```

The script is waiting for the challenge to pass (usually 5-10 seconds).

### Rate Limiting

If you encounter rate limiting:

- The scraper includes delays between requests
- Detailed scraping is sequential (one character/weapon at a time)
- If blocked, wait a few minutes and retry

### Incomplete Data

```bash
# Check what's missing
make characters-check
make gallery-check

# Re-scrape specific items by deleting their files
rm client/public/characters/Aether.json
make characters-detailed  # Will re-scrape Aether
```

### Memory Issues

For large scraping operations:

```bash
# Increase Node.js heap size
NODE_OPTIONS="--max-old-space-size=4096" make all
```

## Development

### Adding New Scraping Scripts

1. Create new TypeScript file: `my-script.ts`
2. Add CLI flag handling in `main()` function:

```typescript
async function main() {
  const args = process.argv.slice(2);
  if (args.includes('--my-flag')) {
    // Your scraping logic
  }
}
```

3. Add command to `makefile.mjs`:

```javascript
'my-command': {
  description: 'My command description',
  category: 'My Category',
  action: () => runTsxScript('my-script.ts', ['--my-flag']),
}
```

4. Add target to `Makefile`:

```makefile
my-command:
	@node makefile.mjs my-command
```

### Debugging

```typescript
// Enable debug logging
import { logger } from '../logger.js';

logger.debug('Debug message'); // Only in debug mode
logger.info('Info message'); // Always shown
logger.warn('Warning'); // Yellow warning
logger.error('Error'); // Red error
logger.success('Success'); // Green success
```

## Performance Tips

1. **Use base scraping first**: Always run `--base` before `--detailed` to get the list of items to scrape
2. **Selective re-scraping**: Delete specific JSON files to re-scrape only those items
3. **Parallel operations**: Run independent scrapers in parallel:
   ```bash
   make characters & make weapons & make artifacts
   ```
4. **Skip already-scraped**: By default, detailed scrapers skip existing files

## Data Validation

All scraped data is validated using Zod schemas defined in [schema.ts](schema.ts):

- `characterSchema`: Character data structure
- `weaponSchema`: Weapon data structure
- `artifactSchema`: Artifact data structure
- `primitivesSchema`: Primitives data structure

Failed validations are logged with specific field errors.

## Contributing

When modifying scraping scripts:

1. Test with small datasets first (comment out loops to test single items)
2. Validate output against schemas
3. Add error handling for missing elements
4. Update this README with new commands/flags
5. Use consistent logging patterns

## License

Part of the GenshinQL project. See root LICENSE file.
