.PHONY: help install dev build preview lint format format-check typecheck pre-commit test test-watch validate ci update outdated audit audit-fix clean clean-cache fresh-install


.DEFAULT_GOAL := help

help install dev build preview lint format format-check typecheck pre-commit test test-watch validate ci update outdated audit audit-fix clean clean-cache fresh-install:
	@node makefile.mjs $@
