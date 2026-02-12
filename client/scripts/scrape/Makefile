# GenshinQL Scraper Makefile
# This Makefile provides convenient shortcuts for running scraping operations.
# All commands are delegated to makefile.mjs which handles execution and output formatting.
#
# Usage: make <target>

.PHONY: help characters-base characters-detailed characters-check characters-roles characters \
        characters-optimize characters-optimize-files characters-optimize-all \
        gallery gallery-check talents weapons-base weapons-detailed \
        weapons-calendar weapons-full weapons primitives artifacts imaginarium-theater all version

# Default target
.DEFAULT_GOAL := help

#------------------------------------------------------------------------------
# Help
#------------------------------------------------------------------------------

help:
	@node makefile.mjs help

#------------------------------------------------------------------------------
# Character Scraping
#------------------------------------------------------------------------------

characters-base:
	@node makefile.mjs characters-base

characters-detailed:
	@node makefile.mjs characters-detailed

characters-check:
	@node makefile.mjs characters-check

characters:
	@node makefile.mjs characters

characters-roles:
	@node makefile.mjs characters-roles

characters-optimize:
	@node makefile.mjs characters-optimize

characters-optimize-files:
	@node makefile.mjs characters-optimize-files

characters-optimize-all:
	@node makefile.mjs characters-optimize-all

#------------------------------------------------------------------------------
# Gallery Scraping
#------------------------------------------------------------------------------

gallery:
	@node makefile.mjs gallery

gallery-check:
	@node makefile.mjs gallery-check

#------------------------------------------------------------------------------
# Talent Scraping
#------------------------------------------------------------------------------

talents:
	@node makefile.mjs talents

#------------------------------------------------------------------------------
# Weapon Scraping
#------------------------------------------------------------------------------

weapons-base:
	@node makefile.mjs weapons-base

weapons-detailed:
	@node makefile.mjs weapons-detailed

weapons-calendar:
	@node makefile.mjs weapons-calendar

weapons-full:
	@node makefile.mjs weapons-full

weapons:
	@node makefile.mjs weapons

#------------------------------------------------------------------------------
# Artifact Scraping
#------------------------------------------------------------------------------

artifacts:
	@node makefile.mjs artifacts

#------------------------------------------------------------------------------
# Imaginarium Theater Scraping
#------------------------------------------------------------------------------

imaginarium-theater:
	@node makefile.mjs imaginarium-theater

#------------------------------------------------------------------------------
# Data Processing
#------------------------------------------------------------------------------

primitives:
	@node makefile.mjs primitives

#------------------------------------------------------------------------------
# Combined Tasks
#------------------------------------------------------------------------------

all:
	@node makefile.mjs all


version:
	@node makefile.mjs version