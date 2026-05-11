# Americano Individual Schedule Preview Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement Issue 6: generate seeded Americano individual rotations with preview-shaped rounds and admin schedule preview UI shell.

**Architecture:** Add a pure `schedule-engine` Module for deterministic seeded Americano generation. It returns rounds/courts/matches without persistence so future server actions can save previews after admin confirmation.

**Tech Stack:** TypeScript, Vitest, Next.js App Router, Testing Library.
