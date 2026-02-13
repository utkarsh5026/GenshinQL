# R2 Asset Migration Tool

A comprehensive CLI tool for migrating Genshin Impact assets from Wikia CDN to Cloudflare R2 storage, or using local assets.

## 📋 Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Quick Start](#quick-start)
- [Available Commands](#available-commands)
- [Workflows](#workflows)
- [Directory Structure](#directory-structure)
- [Advanced Usage](#advanced-usage)
- [Troubleshooting](#troubleshooting)

---

## Overview

This tool manages the complete asset migration pipeline:

1. **Extract** - Scan character JSON files for Wikia URLs
2. **Download** - Download assets from Wikia (with deduplication)
3. **Upload** - Upload assets to Cloudflare R2
4. **Update** - Replace Wikia URLs in JSON files with R2 URLs or local paths
5. **Sync** - Keep assets synchronized as new content is scraped

### Key Features

- ✅ Concurrent downloads/uploads (CPU-optimized)
- ✅ Automatic retry logic with exponential backoff
- ✅ Rate limiting protection
- ✅ File type detection and validation
- ✅ Deduplication using URL hashing
- ✅ Progress tracking and statistics
- ✅ Backup and restore functionality
- ✅ Local asset mode (no R2 required)
- ✅ Mapping database sync across machines

---

## Prerequisites

### Required

- **Node.js** >= 18.x
- **npm** or **yarn**
- **Internet connection** (for Wikia and R2 access)

### Optional (for R2 cloud mode)

- **Cloudflare R2 Account** with:
  - R2 bucket created
  - API tokens generated (Read & Write access)
  - Public URL configured for the bucket

---

## Environment Setup

### 1. Create `.env` file

Create a `.env` file in the **project root** (not in the r2 folder):

```bash
# Required for R2 cloud mode
R2_ACCOUNT_ID=your_account_id_here
R2_ACCESS_KEY_ID=your_access_key_here
R2_SECRET_ACCESS_KEY=your_secret_key_here
R2_BUCKET_NAME=genshin-assets
R2_PUBLIC_URL=https://pub-xxxxxxxxxxxxx.r2.dev
```

### 2. Get Cloudflare R2 Credentials

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **R2** → **Overview**
3. Create a bucket (e.g., `genshin-assets`)
4. Go to **R2** → **Manage R2 API Tokens**
5. Create a new API token with **Read & Write** permissions
6. Copy the credentials to your `.env` file

### 3. Configure Public URL

1. In your R2 bucket settings, enable **Public Access**
2. Copy the public URL (e.g., `https://pub-xxxxx.r2.dev`)
3. Add it to `.env` as `R2_PUBLIC_URL`

---

## Quick Start

### Option 1: R2 Cloud Mode (Full Migration)

```bash
# From the project root
cd client

# Check migration status
npm run r2:status

# Run full migration (download + upload + update JSONs)
npm run r2:migrate

# Verify uploads
npm run r2:verify
```

### Option 2: Local Assets Mode (No R2)

```bash
# From the project root
cd client

# Download assets to local public/assets/
npm run r2:download-local

# Update JSONs to use local paths
npm run r2:update-local

# Or run full local migration
npm run r2:migrate-local
```

---

## Using Custom Paths

By default, all commands process files in `client/public/characters/`. You can now target any file or directory using the `--path` flag.

### Examples

**Process a single file:**

```bash
# Migrate assets from version/latest.json
npm run r2:migrate -- --path version/latest.json

# Download assets from a specific file
npm run r2:download -- --path weapons.json

# Update a single artifact file
npm run r2:update -- --path artifacts/Gladiator.json
```

**Process a directory:**

```bash
# Migrate all files in the version directory
npm run r2:migrate -- --path version

# Download assets from weapons directory
npm run r2:download -- --path weapons

# Sync characters directory (explicit default)
npm run r2:sync -- --path characters
```

**Process entire public folder:**

```bash
# Migrate all JSON files in public/
npm run r2:migrate -- --path .
```

### Path Rules

- **Relative to `client/public/`** - All paths are resolved from the public directory
- **Security** - Paths must stay within the `public/` directory (path traversal blocked)
- **File validation** - File paths must point to `.json` files
- **Directory scanning** - Directories are scanned recursively for all `.json` files
- **Use forward slashes** - Even on Windows, use `/` as separator (e.g., `version/latest.json`)

### Backward Compatibility

If you don't specify `--path`, the default is `characters`:

```bash
# These are equivalent:
npm run r2:migrate
npm run r2:migrate -- --path characters
```

All existing workflows and npm scripts continue to work unchanged.

---

## Available Commands

### Status & Information

| Command  | npm Script          | Description                           |
| -------- | ------------------- | ------------------------------------- |
| `status` | `npm run r2:status` | Show migration status and statistics  |
| `audit`  | _(Makefile only)_   | Audit R2 storage and list all objects |

### Download Phase

| Command                  | npm Script                  | Description                                |
| ------------------------ | --------------------------- | ------------------------------------------ |
| `download`               | `npm run r2:download`       | Download assets from Wikia to `downloads/` |
| `download --local`       | `npm run r2:download-local` | Download assets to `public/assets/`        |
| `download --path <path>` | _(Add flag to npm script)_  | Download from specific file/directory      |
| `clean`                  | _(Makefile only)_           | Clear download cache                       |

### Upload Phase (R2 Only)

| Command        | npm Script          | Description                           |
| -------------- | ------------------- | ------------------------------------- |
| `upload`       | `npm run r2:upload` | Upload downloaded assets to R2        |
| `verify`       | `npm run r2:verify` | Verify uploaded assets are accessible |
| `retry-upload` | _(CLI only)_        | Retry failed uploads                  |

### Update Phase

| Command                | npm Script                 | Description                    |
| ---------------------- | -------------------------- | ------------------------------ |
| `update`               | _(CLI only)_               | Update JSONs with R2 URLs      |
| `update --local`       | `npm run r2:update-local`  | Update JSONs with local paths  |
| `update --path <path>` | _(Add flag to npm script)_ | Update specific file/directory |
| `restore <timestamp>`  | _(CLI only)_               | Restore JSONs from backup      |

### Full Migration

| Command                 | npm Script                 | Description                                 |
| ----------------------- | -------------------------- | ------------------------------------------- |
| `migrate`               | `npm run r2:migrate`       | Full migration (download + upload + update) |
| `migrate --local`       | `npm run r2:migrate-local` | Full local migration (no R2)                |
| `migrate --path <path>` | _(Add flag to npm script)_ | Migrate specific file/directory             |

### Sync Operations

| Command              | npm Script              | Description                         |
| -------------------- | ----------------------- | ----------------------------------- |
| `sync`               | `npm run r2:sync`       | Sync new assets after re-scraping   |
| `sync --local`       | `npm run r2:sync-local` | Sync new assets to local            |
| `sync --path <path>` | _(Add flag to script)_  | Sync specific file/directory        |
| `sync-r2`            | `npm run r2:sync-r2`    | Sync mapping database with R2 state |

### Mapping Management

| Command        | npm Script   | Description                         |
| -------------- | ------------ | ----------------------------------- |
| `push-mapping` | _(CLI only)_ | Upload `url-mapping.json` to R2     |
| `pull-mapping` | _(CLI only)_ | Download `url-mapping.json` from R2 |

### Fixes

| Command | npm Script   | Description              |
| ------- | ------------ | ------------------------ |
| `fix`   | _(CLI only)_ | Fix file type mismatches |

---

## Workflows

### 🎯 Workflow 1: Initial Migration to R2

**Goal:** Migrate all assets from Wikia to R2

```bash
# Step 1: Check current status
npm run r2:status

# Step 2: Run full migration
npm run r2:migrate

# Step 3: Verify uploads
npm run r2:verify

# Optional: Check final status
npm run r2:status
```

**What happens:**

1. Extracts all Wikia URLs from character JSONs
2. Downloads assets to `client/downloads/` (organized by category)
3. Uploads assets to R2 bucket
4. Creates backups of character JSONs
5. Replaces Wikia URLs with R2 URLs in JSONs

---

### 🎯 Workflow 2: Use Local Assets (No R2)

**Goal:** Use local assets without R2 for development

```bash
# Run local migration
npm run r2:migrate-local

# Or step by step:
npm run r2:download-local  # Downloads to public/assets/
npm run r2:update-local    # Updates JSONs with /assets/... paths
```

**What happens:**

1. Downloads assets to `client/public/assets/` (flat structure)
2. Updates character JSONs with local paths (e.g., `/assets/abc123.webp`)
3. No R2 upload (assets served directly from public folder)

**Use case:** Development, testing, or when R2 is not available

---

### 🎯 Workflow 3: Sync After Re-Scraping

**Goal:** Update only new assets after running scraper

```bash
# After running scraper, sync new assets
npm run r2:sync

# Or for local mode
npm run r2:sync-local
```

**What happens:**

1. Extracts all URLs from character JSONs
2. Compares with existing mapping database
3. Downloads only NEW assets (not in mapping)
4. Uploads new assets to R2
5. Updates character JSONs

**When to use:** After running the scraper and adding new characters/weapons

---

### 🎯 Workflow 4: Multi-Machine Setup

**Goal:** Keep mapping database synchronized across multiple machines

**Machine A (primary):**

```bash
# Run migration
npm run r2:migrate

# Push mapping to R2 (automatic, but can be manual)
npx tsx scripts/r2/index.ts push-mapping
```

**Machine B (secondary):**

```bash
# Pull mapping from R2
npx tsx scripts/r2/index.ts pull-mapping

# Run sync (uses pulled mapping)
npm run r2:sync
```

**What happens:**

- Mapping database (`url-mapping.json`) is stored in R2
- Each machine can pull/push the mapping
- Prevents duplicate uploads and maintains consistency

---

### 🎯 Workflow 5: Restore from Backup

**Goal:** Rollback character JSONs to previous state

```bash
# List backups (check client/public/backups/)
ls client/public/backups/

# Restore from specific timestamp
npx tsx scripts/r2/index.ts restore 2024-02-13T10-30-00-000Z

# Or restore all latest backups
npx tsx scripts/r2/index.ts restore
```

**When to use:** When JSON updates cause issues or incorrect replacements

---

## Directory Structure

```
client/scripts/r2/
├── README.md              # This file
├── index.ts               # Main CLI entry point
├── config.ts              # Configuration and env validation
├── client.ts              # R2 S3 client wrapper
├── download.ts            # Download logic
├── upload.ts              # Upload logic
├── mapping.ts             # Mapping database management
├── update-json.ts         # JSON update logic
├── sync.ts                # Sync operations
├── audit.ts               # R2 audit tools
├── fix-file-types.ts      # File type mismatch fixes
├── extract-urls.ts        # URL extraction from JSONs
├── utils.ts               # Utility functions
├── status.ts              # Status display
├── url-mapping.json       # Mapping database (generated)
├── Makefile               # Make commands
└── makefile.mjs           # Makefile helper

client/downloads/          # Download cache (R2 mode)
├── icons/
├── talents/
├── videos/
├── stickers/
└── misc/

client/public/assets/      # Local assets (local mode)
└── *.{png,webp,mp4}      # Flat structure

client/public/backups/     # JSON backups (preserves subdirectory structure)
├── characters/
│   └── 2024-02-13T10-30-00-000Z_Aino.json
└── version/
    └── 2024-02-13T10-30-00-000Z_latest.json
```

---

## Advanced Usage

### Using Direct CLI Commands

Instead of npm scripts, you can use the CLI directly:

```bash
# From client directory
npx tsx scripts/r2/index.ts <command> [options]

# Examples:
npx tsx scripts/r2/index.ts status
npx tsx scripts/r2/index.ts download --local
npx tsx scripts/r2/index.ts migrate
npx tsx scripts/r2/index.ts migrate --path version/latest.json
npx tsx scripts/r2/index.ts sync --path weapons --local
```

### Combining Flags

You can combine `--path` with other flags:

```bash
# Local mode + custom path
npm run r2:migrate -- --local --path version/latest.json

# Download from specific directory to local assets
npm run r2:download -- --local --path weapons

# Sync specific file with R2
npm run r2:sync -- --path version/latest.json
```

### Using Makefile (Unix/Linux/macOS)

```bash
# From client/scripts/r2/ directory
make help          # Show all commands
make status        # Show migration status
make migrate       # Full migration
make sync          # Sync new assets
```

### Parallel Operations

The tool automatically uses CPU cores for parallel downloads/uploads:

```typescript
// Configured in config.ts
concurrentDownloads: CPU_COUNT; // e.g., 8 parallel downloads
concurrentUploads: CPU_COUNT; // e.g., 8 parallel uploads
```

### Custom Configuration

Edit `config.ts` to customize:

```typescript
export const MIGRATION_CONFIG = {
  concurrentDownloads: 8, // Parallel downloads
  concurrentUploads: 8, // Parallel uploads
  maxRetries: 3, // Retry attempts
  retryDelayMs: 1000, // Initial retry delay
  retryBackoffMultiplier: 2, // Exponential backoff
  rateLimitWaitMs: 5000, // Rate limit wait time
  hashLength: 16, // URL hash length
};
```

---

## Troubleshooting

### ❌ "Missing required environment variables"

**Problem:** `.env` file is missing or incomplete

**Solution:**

```bash
# Create .env in project root
cp .env.example .env
# Fill in your R2 credentials
```

### ❌ "Failed to fetch" or Network Errors

**Problem:** Internet connection issues or Wikia blocking

**Solutions:**

- Check internet connection
- Retry with: `npm run r2:retry-upload`
- Assets are cached, so re-running is safe

### ❌ "Maximum update depth exceeded"

**Problem:** Infinite loop in URL replacement

**Solution:**

- This shouldn't happen, but if it does:
- Restore from backup: `npx tsx scripts/r2/index.ts restore`
- Report the issue with character name

### ❌ File Type Mismatch Warnings

**Problem:** URL extension doesn't match actual file type

**Solution:**

```bash
# Automatically fix mismatches
npx tsx scripts/r2/index.ts fix
```

### ❌ Assets Not Uploading

**Problem:** R2 credentials or permissions issue

**Solutions:**

1. Verify R2 credentials in `.env`
2. Check bucket permissions (Read & Write)
3. Test connection: `npm run r2:status`

### ❌ JSONs Not Updating

**Problem:** No R2 URLs or local paths in mapping

**Solutions:**

- For R2 mode: Run `npm run r2:upload` first
- For local mode: Run `npm run r2:download-local` first
- Check mapping: `cat client/scripts/r2/url-mapping.json`

### 🔍 Debug Mode

Enable detailed logging:

```bash
# Set environment variable
DEBUG=true npm run r2:migrate

# Or edit config.ts and set LOG_LEVEL
```

### 📊 View Detailed Statistics

```bash
# Show detailed migration status
npm run r2:status

# Audit R2 bucket (list all objects)
make audit  # From r2/ directory
```

---

## Additional Resources

### Related Files

- Character JSONs: `client/public/characters/*.json`
- Primitives: `client/public/primitives.json`
- Backups: `client/public/backups/`

### Environment Variables Reference

| Variable               | Required      | Description           | Example                  |
| ---------------------- | ------------- | --------------------- | ------------------------ |
| `R2_ACCOUNT_ID`        | Yes (R2 mode) | Cloudflare account ID | `abc123def456`           |
| `R2_ACCESS_KEY_ID`     | Yes (R2 mode) | R2 access key         | `abc123`                 |
| `R2_SECRET_ACCESS_KEY` | Yes (R2 mode) | R2 secret key         | `secret123`              |
| `R2_BUCKET_NAME`       | Yes (R2 mode) | R2 bucket name        | `genshin-assets`         |
| `R2_PUBLIC_URL`        | Yes (R2 mode) | Public bucket URL     | `https://pub-xxx.r2.dev` |

### Asset Categories

Assets are organized into categories:

- **icons** - Character/weapon/artifact icons
- **talents** - Talent and constellation icons
- **videos** - Character showcase videos
- **stickers** - Character sticker images
- **misc** - Other assets

---

## Support

If you encounter issues:

1. Check this README
2. Review error messages
3. Check `url-mapping.json` for debugging
4. Restore from backup if needed
5. Open an issue on GitHub

---

**Last Updated:** 2026-02-13
