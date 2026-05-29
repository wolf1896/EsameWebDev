# RecipeApp — Meal Planner & Recipe Discovery

A single-page recipe discovery and meal planning application built with vanilla JavaScript, HTML5, and CSS3. Fetches recipes from TheMealDB API and manages weekly meal plans with localStorage persistence.

## Features

- **Authentication** — Mock login/logout with localStorage session persistence
- **Recipe Discovery** — Search recipes by name or ingredient with alphabetical sorting
- **Weekly Meal Planner** — Add/remove meals from your weekly plan (persisted to localStorage)
- **Home Dashboard** — Personalized greeting, meal plan stats, and random recipe recommendation
- **User Profile** — Store and manage user metadata (name, birthday)
- **Birthday Surprise** — Automatic cake recipe on your birthday
- **Light/Dark Theme** — Toggle with localStorage preference persistence

## Project Structure

```
.
├── index.html       # Home dashboard with meal stats & daily recommendation
├── login.html       # Authentication gateway
├── discover.html    # Recipe search & browse
├── planner.html     # Weekly meal planner
├── profile.html     # User settings & metadata
├── app.js           # Core logic: auth guards, API calls, event handlers
└── style.css        # Global styles with CSS variables for theming
```

## Technical Stack

- **Frontend:** Vanilla JavaScript (ES6+), Semantic HTML5, CSS3 Flexbox
- **Storage:** localStorage for authentication, preferences, and meal plans
- **API:** [TheMealDB](https://www.themealdb.com) — free recipe database
- **Styling:** CSS custom properties (variables) for easy theme switching

## How to Run

1. Serve the project with a local server (e.g., VS Code Live Server extension)
2. Open `login.html` in your browser
3. Enter any username (3+ chars) and password (6+ chars) to log in
4. Navigate using the header menu to explore features

## Key Implementation Details

- **Auth Guard:** All pages check `localStorage.isLoggedIn` on load; unauthenticated users redirect to login
- **API Integration:** `fetch()` calls to TheMealDB for recipe search and random recommendations
- **State Management:** All user data (profile, planner, preferences) stored in localStorage
- **Responsive Design:** Media queries for mobile/desktop with Flexbox layouts

---

**Author:** Mattia Lupo — EPICODE Web Development Student