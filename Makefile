.PHONY: help install dev build preview lint format format-check typecheck pre-commit test test-watch validate ci update outdated audit audit-fix clean clean-cache fresh-install scrape scrape-all scrape-characters scrape-gallery scrape-talents scrape-weapons consolidate


.DEFAULT_GOAL := help

help install dev build preview lint format format-check typecheck pre-commit test test-watch validate ci update outdated audit audit-fix clean clean-cache fresh-install scrape scrape-all scrape-characters scrape-gallery scrape-talents scrape-weapons consolidate:
	@node makefile.mjs $@
