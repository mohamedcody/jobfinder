# 🔍 Search Term Highlighting Feature

## Overview
When users search for jobs by title, the matching text is now **highlighted in yellow** in both the job title and job description for better visual feedback.

## What Changed

### 1. New Utility: `highlight-utils.ts`
**Location:** `frontend/src/lib/jobs/highlight-utils.ts`

- `getHighlightParts()`: Splits text into matched/unmatched parts
- `highlightText()`: Returns React JSX element with matched terms highlighted in yellow

**Styling:** 
- Background: `bg-yellow-400/30` (light yellow)
- Text: `text-yellow-100` (bright yellow text)
- Font: `font-semibold` (bold)
- Border: `rounded` (slightly rounded corners)

### 2. Updated Components

#### `JobCard` 
- Added `searchTerm?: string` prop
- Highlights title: `highlightText(job.title, searchTerm)`
- Highlights description: `highlightText(job.description, searchTerm)`

#### `JobsResultsSection`
- Passes `searchTerm` from parent to each `JobCard`

#### `JobsList`
- Extracts `searchTerm` from `appliedFilters.title`
- Passes it to `JobsResultsSection`

## How It Works

1. User enters search text (e.g., "React Engineer")
2. Search is performed via the API
3. Component receives `searchTerm` prop
4. `highlightText()` function:
   - Escapes regex special characters
   - Splits text by case-insensitive matches
   - Wraps matches in `<mark>` tags with yellow styling
   - Returns React Fragment with styled elements

## Example

**Search Term:** "engineer"

**Before:**
```
Senior Software Engineer at TechCorp
```

**After:**
```
Senior Software [Engineer] at TechCorp
                   ↑ (highlighted in yellow)
```

## Case Sensitivity
- Search is **case-insensitive**
- "engineer" matches "Engineer", "ENGINEER", "engineer"

## Performance
- Regex compilation only happens when `searchTerm` is provided
- No re-render optimization needed (memoized components)
- Efficient string splitting approach

## Files Modified
- ✅ `frontend/src/lib/jobs/highlight-utils.ts` (NEW)
- ✅ `frontend/src/components/jobs/job-card.tsx`
- ✅ `frontend/src/components/jobs/jobs-results-section.tsx`
- ✅ `frontend/src/components/jobs/jobs-list.tsx`

## Testing
Build successful: `npm run build` ✓

To test locally:
```bash
cd frontend
npm run dev
# Search for any job title term
# You should see matches highlighted in yellow
```

