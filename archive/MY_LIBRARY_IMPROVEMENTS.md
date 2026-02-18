# My Library — UX Improvement Proposals

Current state: A simple grid of cards showing title, category badge, description, download date, review status, and a download button. No search, no filtering, no sorting.

---

## 1. Rename to "My Library" + Updated Empty State

**What:** Rename "My Downloads" → "My Library". Improve empty state with a friendly illustration, a short value prop ("Your downloaded enhancements will appear here"), and a prominent CTA to browse the marketplace. Optionally show 3 popular/featured templates as suggestions.

**Why:** "Library" implies ownership and a collection you return to. A good empty state reduces bounce and guides new users.

**Complexity:** Simple  
**Priority:** Must

---

## 2. Search Within Library

**What:** Add a search input at the top that filters library items by title, description, or category (client-side filter is fine for <100 items).

**Why:** Once a user has 10+ enhancements, finding one by memory is painful. This is table-stakes for any collection view.

**Complexity:** Simple  
**Priority:** Must

---

## 3. Sort & Filter Controls

**What:** Add a sort dropdown (Recently downloaded, Alphabetical, Category) and category filter chips derived from the user's actual downloads.

**Why:** Lets users find what they need quickly. Category filter is especially useful if they have enhancements across multiple categories.

**Complexity:** Simple  
**Priority:** Should

---

## 4. "Update Available" Indicator + Version Info

**What:** Show the version the user downloaded vs the template's current version. If there's a newer version, show an "Update Available" badge on the card with a one-click re-download.

**Why:** This is the #1 reason users return to a library page. Without it, they have no idea updates exist. Drives re-engagement and keeps users on the latest.

**Complexity:** Medium (requires storing `downloaded_version` on the purchase record and comparing against `templates.version`)  
**Priority:** Must

---

## 5. Re-download Button (Already Exists — Improve It)

**What:** The download button already exists. Rename to "Download Again" or "Re-download" to make it clear. Add the `openclaw template install {slug}` command as a copyable snippet on each card (like the detail page has).

**Why:** Users come back to re-download after setting up a new machine. The install command is the fastest path.

**Complexity:** Simple  
**Priority:** Should

---

## 6. Grid/List View Toggle

**What:** Add a toggle to switch between the current card grid and a compact list/table view (title, category, date, version, actions in columns).

**Why:** Power users with many downloads prefer scanning a dense list. Casual users prefer the visual grid. Let them choose.

**Complexity:** Medium  
**Priority:** Nice

---

## 7. Quick Actions Row on Each Card

**What:** Add icon buttons at the bottom of each card: Re-download, View Template Page (external link icon), Copy Install Command. Keep the review CTA as-is.

**Why:** Reduces clicks. Users shouldn't have to navigate to the detail page just to grab the install command.

**Complexity:** Simple  
**Priority:** Should

---

## 8. "Recently Downloaded" Section

**What:** If the user has 6+ items, show a "Recently Downloaded" row (last 3, horizontal) at the top, then "All Enhancements" grid below.

**Why:** Most visits to "My Library" are to find something just downloaded. This surfaces it instantly.

**Complexity:** Simple  
**Priority:** Nice

---

## 9. Download Date + Last Downloaded

**What:** Show both "First downloaded: Jan 5" and "Last downloaded: Feb 16" if they've re-downloaded. Shows the user they're keeping things current.

**Why:** Gives users temporal context. Helps them remember which enhancements they've used recently vs. forgotten about.

**Complexity:** Medium (requires tracking re-download timestamps)  
**Priority:** Nice

---

## 10. Mobile Responsive Improvements

**What:** On mobile: single-column card layout (already works via sm:grid-cols-2), but also ensure search/filter controls stack properly, and card actions are touch-friendly (min 44px tap targets). Consider a bottom sheet for filters on mobile.

**Why:** Many users will check their library on mobile even if they install on desktop.

**Complexity:** Simple  
**Priority:** Should

---

## 11. Screenshots on Library Cards

**What:** Show the template's first screenshot as a card thumbnail (like `TemplateCard` does on the marketplace). The current dashboard cards have no visual — just text.

**Why:** Visual recognition is faster than reading titles. Makes the page feel more like a real library and less like a spreadsheet.

**Complexity:** Simple  
**Priority:** Should

---

## Summary Table

| # | Improvement | Complexity | Priority |
|---|------------|-----------|----------|
| 1 | Rename + Empty State | Simple | Must |
| 2 | Search | Simple | Must |
| 3 | Sort & Filter | Simple | Should |
| 4 | Update Available Indicator | Medium | Must |
| 5 | Improve Re-download UX | Simple | Should |
| 6 | Grid/List Toggle | Medium | Nice |
| 7 | Quick Actions Row | Simple | Should |
| 8 | Recently Downloaded Section | Simple | Nice |
| 9 | Download Date + Last Downloaded | Medium | Nice |
| 10 | Mobile Improvements | Simple | Should |
| 11 | Screenshot Thumbnails | Simple | Should |

### Suggested Implementation Order
1. #1 Rename + Empty State (quick win)
2. #11 Screenshot Thumbnails (quick win, big visual impact)
3. #2 Search
4. #4 Update Available Indicator (highest value, needs backend change)
5. #3 Sort & Filter
6. #5 + #7 Re-download UX + Quick Actions (do together)
7. #10 Mobile polish
8. #8 Recently Downloaded section
9. #6 Grid/List toggle
10. #9 Download tracking
