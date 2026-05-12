# Match Generation Testing Guide

## What Was Fixed

The `generateSingleMatchAction` function now correctly handles all 4 format combinations:
1. Americano + Individual
2. Americano + Fixed Team
3. Mexicano + Individual
4. Mexicano + Fixed Team

## Unit Tests Status

✅ All tests pass (113 total):
- `src/features/schedules/schedule-form-actions.test.ts` - 2 tests
- `src/features/schedules/single-match-generation.test.ts` - 4 tests (NEW)

## Manual Testing Steps

### 1. Test Americano Individual Match Generation

```bash
# Start dev server
npm run dev

# Navigate to: http://localhost:3000/admin/login
# Login, create event with:
# - Format: Americano
# - Pairing: Individual
# - Add 4+ players
# - Go to Scores page
# - Click "Generate first match"
```

**Expected:** One match created with 2v2 players

### 2. Test Mexicano Individual Match Generation

```bash
# Create event with:
# - Format: Mexicano
# - Pairing: Individual
# - Add 4+ players
# - Go to Scores page
# - Click "Generate first match"
```

**Expected:** One match created with 2v2 players (ranked by leaderboard)

### 3. Test Americano Fixed Team Match Generation

```bash
# Create event with:
# - Format: Americano
# - Pairing: Fixed Team
# - Add 2+ teams
# - Go to Scores page
# - Click "Generate first match"
```

**Expected:** One match created with team vs team

### 4. Test Mexicano Fixed Team Match Generation

```bash
# Create event with:
# - Format: Mexicano
# - Pairing: Fixed Team
# - Add 2+ teams
# - Go to Scores page
# - Click "Generate first match"
```

**Expected:** One match created with team vs team (ranked by leaderboard)

## Common Issues & Solutions

### Issue: "Event not found"
**Solution:** Check that event ID is valid in URL

### Issue: "Need at least 4 players"
**Solution:** Add more players to roster (individual mode only)

### Issue: "Need at least 2 teams"
**Solution:** Add more teams (fixed team mode only)

### Issue: Button doesn't respond
**Solution:** 
1. Check browser console for errors
2. Check server logs: `tail -f .next/dev/logs/next-development.log`
3. Verify database connection in `.env.local`

## Code Changes Summary

### `src/features/schedules/schedule-form-actions.ts`

**Individual pairing mode (lines 145-163):**
- Mexicano: calls `generateMexicanoIndividualRound()`
- Americano: calls `generateAmericanoSchedule().rounds[0]`
- Both return matches with `teamOnePlayerIds` and `teamTwoPlayerIds`

**Fixed team pairing mode (lines 165-189):**
- Mexicano: calls `generateMexicanoTeamRound()`
- Americano: calls `generateTeamRoundRobinSchedule().rounds[0]`
- Both return matches with `teamOneId` and `teamTwoId`
- Wraps IDs in arrays: `[match.teamOneId]`, `[match.teamTwoId]`

## Verification Commands

```bash
# Run all tests
npm test

# Run only schedule tests
npm test -- src/features/schedules

# Build production
npm run build

# Type check
npm run typecheck
```

All should pass ✅

## If Match Generation Still Fails

1. **Check database connection:**
   ```bash
   # Verify .env.local has valid DATABASE_URL
   grep DATABASE_URL .env.local
   ```

2. **Check event exists:**
   ```sql
   SELECT id, name, format, pairing_mode FROM events WHERE id = 'YOUR_EVENT_ID';
   ```

3. **Check roster/teams exist:**
   ```sql
   -- For individual mode
   SELECT * FROM roster WHERE event_id = 'YOUR_EVENT_ID';
   
   -- For team mode
   SELECT * FROM teams WHERE event_id = 'YOUR_EVENT_ID';
   ```

4. **Enable debug logging:**
   Add to `src/features/schedules/schedule-form-actions.ts` line 128:
   ```typescript
   console.log("Event:", event);
   console.log("Roster:", roster);
   console.log("Players:", schedulePlayers);
   ```

5. **Check server action response:**
   Open browser DevTools → Network → Click "Generate first match" → Check response

## Contact

If issue persists after these checks, provide:
1. Event format + pairing mode
2. Number of players/teams
3. Browser console errors
4. Server logs from `.next/dev/logs/next-development.log`
