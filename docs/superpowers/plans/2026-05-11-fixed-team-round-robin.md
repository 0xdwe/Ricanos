# Fixed-Team Round-Robin Schedule Preview Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement Issue 7: generate deterministic fixed-team round-robin schedule previews.

**Architecture:** Extend schedule engine with a pure fixed-team round-robin generator that returns rounds, courts, byes, and warnings without persistence.

**Tech Stack:** TypeScript, Vitest, Next.js App Router, Testing Library.
