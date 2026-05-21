# EsameWebDev — Recipe App Workspace

## Project Overview
This project is an interactive, data-driven single-page state web application developed as a Final Exam submission for the EPICODE Institute of Technology. It addresses the practical requirement of transitioning a platform from static layouts into a highly interactive, responsive application environment. 

The application connects asynchronously to a live culinary database to allow seamless recipe discovery, dynamic search filtering, and localized weekly meal planning management.

## Project Structure & Architecture
To comfortably satisfy the exam criteria requiring at least four structural pages plus one login module, the application consists of the following deployment files:
1. `login.html` — The gateway authentication wall.
2. `index.html` — The central User Dashboard featuring personalized greetings, dynamic statistical counters, and an API recommendation engine.
3. `discover.html` — An advanced recipe filtration hub sorting global registry arrays alphabetically.
4. `planner.html` — The stateful Weekly Meal Planner module allowing individual and batch element purging.
5. `profile.html` — A personal configuration profile setup to update user meta data.
6. `style.css` — Centralized global style definitions utilizing custom properties (CSS variables) for theme manipulation.
7. `app.js` — Core logical script housing page route protection guards, fetch modules, and interface event loop listeners.

---

## Core Features Implemented

### 1. Dynamic User Greeting & Live Metrics (Home Dashboard)
* **Contextual Greetings:** Reads profile objects stored inside `localStorage` to welcome the logged-in client by name.
* **Live Counter Array:** Evaluates the array bounds of the user's planner data to render live, real-time metrics summarizing saved item loads.
* **Chef's Special Recommendation:** Auto-triggers an asynchronous payload look-up to `TheMealDB`'s random endpoint on initialization, displaying a uniquely highlighted daily card recommendation layout.

### 2. Live Advanced Sorting Registry (Discover Hub)
* **Instant Population:** Loads an initial batch of recipes immediately upon initialization instead of showing an empty grid.
* **Deterministic Alphabetical Ordering:** Re-allocates incoming JSON properties inside a JavaScript `.sort()` arrangement utilizing local string comparison variables (`localeCompare`) to format output structures cleanly from A to Z.
* **Flexible Query Paths:** Features a dual-state dropdown menu that shifts API endpoints programmatically depending on whether the client inputs text searching by **Name** or **Main Ingredient**.

### 3. State-Persisted Weekly Planner
* **Ingredients Fetch Extraction:** Features interactive buttons that asynchronously retrieve recipe ingredients arrays and instruction text layouts on-demand, preventing bulk grid alignment issues.
* **Dynamic Scope Protection:** Encapsulates deletion and clear-all event handlers completely within conditional view scopes, maintaining an error-free browser console across unrelated pages.
* **State Syncing:** Saves all additions, individual item omissions, and global storage clears to the browser's `localStorage` to ensure immediate data parity.

### 4. Adaptive Light/Dark Theme Switching
* **CSS Custom Variable Mapping:** Swaps text, card borders, shadows, and base canvas backgrounds globally by toggling a single `.dark-theme` target class flag on the main document body.
* **Preference Persistence:** Caches the user's color selection in `localStorage`, maintaining their preferred style settings intact as they navigate across the different subpages.
* **Smooth Animation Transitions:** Implements subtle timing delays (`transition: background-color 0.3s ease`) to provide elegant, fluid visual shifts during theme toggle actions.

### 5. Authentication Routing & Form Validation
* **Strict Route Guards:** Evaluates session tokens upon any page initialization event. Unauthenticated clients are safely booted back to the `login.html` directory.
* **Regular Expression/Length Constraints:** Ensures user registration inputs conform to form safety metrics (minimum 3 characters for usernames, minimum 6 characters for passwords) before granting mock approval tokens.

---

## Technical Specifications Matrix
* **Markup:** Semantic HTML5 (`<nav>`, `<main>`, `<section>`, `<header>`) for clean layout separation and accessibility.
* **Styling:** CSS3 Flexbox grids, layout constraints configuration (`align-items: flex-start` to avoid component stretching bugs), and media query boundaries for mobile/desktop responsiveness.
* **Scripting Logic:** Functional Vanilla JavaScript (ES6+), `fetch()` Promise trees, JSON state handling, and dynamic DOM manipulation.

---

## How to Run the Application
1. Download or clone this repository to your local directory setup.
2. Unzip the project folder if downloaded as a compressed `.zip` archive package.
3. Open the workspace root using a development local server module (e.g., VS