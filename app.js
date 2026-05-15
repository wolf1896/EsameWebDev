document.addEventListener("DOMContentLoaded", () => {
    
    // --- 1. Fake Login System [cite: 31, 32] ---
    const loginForm = document.getElementById("loginForm");
    const logoutBtn = document.getElementById("logoutBtn");
    const isLoggedIn = localStorage.getItem("isLoggedIn");

    // Protect routes: Redirect based on auth state
    if (window.location.pathname.includes("index.html") && !isLoggedIn) {
        window.location.href = "login.html";
    }
    if (window.location.pathname.includes("login.html") && isLoggedIn) {
        window.location.href = "index.html";
    }

    // Handle Login Form Submit
    if (loginForm) {
        loginForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const username = document.getElementById("username").value;
            const feedback = document.getElementById("authFeedback");
            
            // Form Validation and simulated submission 
            if (username.length >= 3) {
                console.log(`Simulated Data Submit: User ${username} logged in.`);
                localStorage.setItem("isLoggedIn", "true");
                localStorage.setItem("username", username);
                window.location.href = "index.html";
            } else {
                feedback.textContent = "Username must be at least 3 characters."; // Feedback [cite: 27]
            }
            console.log(`Why are you looking here, ${username}?\n I know what you did last summer!`); // Funny console log
        });
    }

    // Handle Logout
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.removeItem("isLoggedIn");
            localStorage.removeItem("username");
            window.location.href = "login.html";
        });
    }

    // --- 2. Fetch API & DOM Manipulation [cite: 22, 35] ---
    const searchForm = document.getElementById("searchForm");
    const recipeContainer = document.getElementById("recipeContainer");

    if (searchForm) {
        searchForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const query = document.getElementById("searchInput").value;
            const feedback = document.getElementById("searchFeedback");
            
            console.log(`Simulated Data Submit: Searching for ${query}`); // 
            feedback.textContent = "Loading recipes...";
            recipeContainer.innerHTML = ""; // Clear DOM
            
            // Using public TheMealDB API 
            fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`)
                .then(response => response.json())
                .then(data => {
                    feedback.textContent = ""; 
                    if (data.meals) {
                        data.meals.forEach(meal => {
                            // Dynamically adding elements 
                            const recipeCard = document.createElement("div");
                            recipeCard.classList.add("recipe-item");
                            recipeCard.innerHTML = `
                                <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
                                <h3>${meal.strMeal}</h3>
                                <p>Category: ${meal.strCategory}</p>
                                <button class="btn" style="margin-top: 10px;">Save to Planner</button>
                            `;
                            recipeContainer.appendChild(recipeCard);
                        });
                    } else {
                        feedback.textContent = "No recipes found. Try another search!"; // Feedback [cite: 27]
                    }
                })
                .catch(error => {
                    console.error("Error fetching data:", error);
                    feedback.textContent = "Error loading data. Please try again.";
                });
        });
    }
});