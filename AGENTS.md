# AGENTS.md

## Project overview
This is an Expo + React Native + TypeScript mobile app for learning English words with flashcards.
The app is iPhone-first and currently tested in Expo Go on a real iPhone.
This project started from create-expo-app and should remain inside the Expo managed workflow.

## Product goal
Build a clean and polished MVP for studying English vocabulary with flashcards.

Core flow:
- Start screen with a "Начать" button
- Study screen with one flashcard at a time
- Tap to flip card
- Swipe left = does not know the word
- Swipe right = knows the word
- Progress indicator during session
- Results screen at the end
- Ability to repeat unknown words
- Ability to restart full deck

## Current design direction
Style:
- minimal iPhone-first UI
- premium spacing
- subtle liquid-glass accents
- strong readability
- modern, clean, calm interface

Important design rules:
- Do not make the whole UI overly transparent
- Prioritize readability over visual effects
- The main flashcard should stay mostly solid / milky, not fully glass
- Use glass/frosted effects only as accents for smaller UI elements
- Keep layout balanced and elegant

## Layout rules
### Start screen
- Minimal screen
- App title
- Large primary button labeled "Начать"

### Study screen
- Vertical layout:
  - top 20% = progress / small header UI
  - middle 60% = main flashcard area
  - bottom 20% = swipe guidance / small supporting UI
- Main flashcard must be:
  - square
  - visually dominant
  - centered in the middle zone
  - well padded from screen edges

### Result screen
- Clean summary of session results
- Show:
  - total words
  - known words
  - unknown words
- Actions:
  - repeat unknown words
  - start over

## Data rules
- Use local static data only for now
- No backend
- No auth
- No cloud sync
- No remote database
- Word data should stay simple and typed

Each word item should include:
- id
- english
- russian

## Technical rules
- Stay within Expo managed workflow
- Keep compatibility with Expo Go in mind
- Use only Expo-compatible packages
- Keep TypeScript clean and readable
- Avoid overengineering
- Avoid unnecessary abstractions
- Preserve simple maintainable file structure

Preferred structure:
- app/index.tsx
- app/study.tsx or equivalent main study route
- app/result.tsx
- components/Flashcard.tsx
- data/words.ts
- types/index.ts (optional)

## Interaction rules
- Swipe should feel light, responsive, and natural on iPhone
- Avoid stiff or heavy gestures
- Card should follow the finger naturally
- Swipe threshold should not require extreme drag distance
- Flip interaction should feel smooth and readable
- Reset flip state correctly when moving to next card

## When making changes
Always:
1. Inspect the current code first
2. Briefly explain the plan
3. Make the smallest safe change
4. Preserve working behavior unless explicitly changing it
5. Summarize:
   - files changed
   - packages added
   - why the change was made

## What not to add unless explicitly requested
- authentication
- backend
- analytics
- settings page
- profile page
- dark complex dashboards
- multiplayer/social features
- cloud sync
- spaced repetition engine
- notifications
- onboarding flow beyond the simple start screen

## Quality bar
Every change should aim for:
- polished MVP quality
- clean UX
- readable UI
- smooth motion
- simple code
- easy future extension