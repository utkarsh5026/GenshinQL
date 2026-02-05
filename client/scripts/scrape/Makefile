# GenshinQL Scraper Makefile
# This Makefile provides convenient shortcuts for running scraping operations.
# All commands are delegated to makefile.mjs which handles execution and output formatting.
#
# Usage: make <target>

.PHONY: help characters-base characters-detailed characters-check characters \
        gallery gallery-check talents weapons-base weapons-detailed \
        weapons-calendar weapons-full weapons primitives all

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
# Data Processing
#------------------------------------------------------------------------------

primitives:
	@node makefile.mjs primitives

#------------------------------------------------------------------------------
# Combined Tasks
#------------------------------------------------------------------------------

all:
	@node makefile.mjs all
