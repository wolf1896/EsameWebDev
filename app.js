document.addEventListener("DOMContentLoaded", () => {
    
    // --- 1. Fake Login & Navigation Logic ---
    const loginForm = document.getElementById("loginForm");
    const logoutBtn = document.getElementById("logoutBtn");
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    const recipeContainer = document.getElementById("recipeContainer");
    const searchForm = document.getElementById("searchForm");

    // Route Protection
    if (window.location.pathname.includes("index.html") && !isLoggedIn) {
        window.location.href = "login.html";
    }

    // --- 2. Initialization: Load Featured Recipes ---
    // This ensures the page is not empty at the start [cite: 9, 22]
    if (window.location.pathname.includes("index.html") || window.location.pathname === "/") {
        loadFeaturedRecipes();
    }

    function loadFeaturedRecipes() {
        const feedback = document.getElementById("searchFeedback");
        const recipeContainer = document.getElementById("recipeContainer");

        // Attempt to fetch external data 
        fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=Arrabiata`)
            .then(response => {
                if (!response.ok) throw new Error('Network response was not ok');
                return response.json();
            })
            .then(data => {
                const featuredMeals = data.meals.slice(0, 6);
                renderRecipes(featuredMeals, `${featuredMeals[0].strMeal}`);
            })
            .catch(err => {
                // Log error for debugging, then trigger fallback
                console.warn("CORS/API Blocked. Loading local fallback data...", err);
                
                // --- Fallback Data ---
                // If the API fails, we manually create a small array to show we handled the error 
                const fallbackMeals = [
                    {
                        strMeal: "Baked Salmon (Offline Mode)",
                        strMealThumb: "https://www.themealdb.com/images/media/meals/1548772327.jpg",
                        idMeal: "1"
                    },
                    {
                        strMeal: "Fish Pie (Offline Mode)",
                        strMealThumb: "https://www.themealdb.com/images/media/meals/ysqupp1511640538.jpg",
                        idMeal: "2"
                    }
                ];
                
                feedback.textContent = "Notice: API currently unavailable. Loading saved favorites.";
                renderRecipes(fallbackMeals, "Featured Recipes (Cached)");
            });
}

    // --- 3. Helper Function to Render Recipe Cards ---
    // This handles the dynamic DOM creation required by your project 
    function renderRecipes(meals, titleText) {
        if (!recipeContainer) return;

        // Update a heading or status if necessary
        const feedback = document.getElementById("searchFeedback");
        if (feedback) feedback.textContent = titleText;

        recipeContainer.innerHTML = ""; // Clear existing content 

        meals.forEach(meal => {
            const recipeCard = document.createElement("div");
            recipeCard.classList.add("recipe-item");
            
            // Note: The structure below uses semantic HTML and interactive elements [cite: 17, 21]
            recipeCard.innerHTML = `
                <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
                <div class="recipe-info">
                    <h3>${meal.strMeal}</h3>
                    <button class="btn save-btn">Add to Planner</button>
                </div>
            `;

            // Add an event listener to the dynamic button [cite: 21, 22]
            recipeCard.querySelector(".save-btn").addEventListener("click", () => {
                alert(`${meal.strMeal} added to your meal planner!`);
            });

            recipeContainer.appendChild(recipeCard);
        });
    }

    // --- 4. Search Functionality ---
    if (searchForm) {
        searchForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const query = document.getElementById("searchInput").value;
            
            // Provide user feedback during the fetch operation 
            const feedback = document.getElementById("searchFeedback");
            feedback.textContent = `Searching for "${query}"...`;

            fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`)
                .then(response => response.json())
                .then(data => {
                    if (data.meals) {
                        renderRecipes(data.meals, `Search Results for "${query}"`);
                    } else {
                        feedback.textContent = "No recipes found. Try searching for 'Pasta' or 'Chicken'.";
                        recipeContainer.innerHTML = "";
                    }
                })
                .catch(err => {
                    feedback.textContent = "Error fetching recipes. Please check your connection.";
                    console.error(err);
                });
        });
    }

    // --- 5. Login/Logout Handlers ---
    if (loginForm) {
        loginForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const username = document.getElementById("username").value;
            localStorage.setItem("isLoggedIn", "true");
            localStorage.setItem("username", username);
            window.location.href = "index.html";
            console.log(`Why are you looking here, ${username}?\n I know what you did last summer!`);
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.removeItem("isLoggedIn");
            window.location.href = "login.html";
        });
    }
});