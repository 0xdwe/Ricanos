# Byes, Fair Active Selection, and Manual Rest Flags Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement Issue 10: select active players/teams fairly when roster exceeds court capacity, respecting manual rest/unavailable flags before ranking-based pairing.

**Architecture:** Add a pure active-selection Module shared by schedulers. It filters unavailable entries, prioritizes fewer matches played, then longest since bye, then ranking/name. Mexicano schedulers accept optional fairness inputs and use the selector before pairing.

**Tech Stack:** TypeScript, Vitest, Next.js App Router, Testing Library.
