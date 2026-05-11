# Mexicano Individual Rounds Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement Issue 8: generate Mexicano individual rounds from seed or current ranking using #1 + #4 vs #2 + #3 within ranked groups of four.

**Architecture:** Add pure Mexicano scheduler Module using leaderboard order as input. It selects active players in ranked order for this slice; bye fairness is Issue 10.

**Tech Stack:** TypeScript, Vitest, Next.js App Router, Testing Library.
