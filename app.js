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
    // This handles the dynamic DOM creation and event binding for both API and fallback data
    function renderRecipes(meals, titleText) {
        if (!recipeContainer) return;

        const feedback = document.getElementById("searchFeedback");
        if (feedback) feedback.textContent = titleText;

        recipeContainer.innerHTML = ""; 

        meals.forEach(meal => {
            const recipeCard = document.createElement("div");
            recipeCard.classList.add("recipe-item");
            
            recipeCard.innerHTML = `
                <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
                <div class="recipe-info">
                    <h3>${meal.strMeal}</h3>
                    <button class="btn save-btn">Add to Planner</button>
                </div>
            `;

            recipeCard.querySelector(".save-btn").addEventListener("click", () => {
                // Get existing planner items or initialize empty array
                let currentPlanner = JSON.parse(localStorage.getItem("mealPlanner")) || [];
                
                // Prevent duplicate additions
                const exists = currentPlanner.some(item => item.strMeal === meal.strMeal);
                if (!exists) {
                    currentPlanner.push({
                        strMeal: meal.strMeal,
                        strMealThumb: meal.strMealThumb
                    });
                    localStorage.setItem("mealPlanner", JSON.stringify(currentPlanner));
                    alert(`${meal.strMeal} has been added to your Meal Planner!`); // Feedback
                } else {
                    alert(`${meal.strMeal} is already in your planner.`); // Feedback
                }
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
            localStorage.removeItem("username");
            localStorage.removeItem("userEmail");
            localStorage.removeItem("userDiet");
            localStorage.removeItem("mealPlanner")
            window.location.href = "login.html";
        });
    }

    // --- 6. Profile Page Logic ---
    if (window.location.pathname.includes("profile.html")) {
        // Route Protection: Boot unauthenticated users to login page
        if (!isLoggedIn) {
            window.location.href = "login.html";
        }

        // DOM Elements
        const displayUsername = document.getElementById("displayUsername");
        const displayEmail = document.getElementById("displayEmail");
        const displayDiet = document.getElementById("displayDiet");
        const profileForm = document.getElementById("profileForm");
        const profileFeedback = document.getElementById("profileFeedback");

        // Load saved values from localStorage or fallback to defaults
        const currentUsername = localStorage.getItem("username") || "Guest";
        const currentEmail = localStorage.getItem("userEmail") || "hello@example.com";
        const currentDiet = localStorage.getItem("userDiet") || "None Specified";

        // Dynamically manipulate the DOM to display current user details
        displayUsername.textContent = currentUsername;
        displayEmail.textContent = currentEmail;
        displayDiet.textContent = currentDiet;

        // Pre-fill form inputs for better UX
        document.getElementById("editEmail").value = currentEmail;
        document.getElementById("editDiet").value = currentDiet;

        // Form Submission & Validation Handler
        profileForm.addEventListener("submit", (e) => {
            e.preventDefault();
            
            const emailInput = document.getElementById("editEmail").value.trim();
            const dietInput = document.getElementById("editDiet").value;

            // Basic Regex Email Validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!emailRegex.test(emailInput)) {
                // Error Feedback
                profileFeedback.style.color = "#ff6b6b";
                profileFeedback.textContent = "Please enter a valid email address.";
                return;
            }

            // Simulated Submission
            console.log(`Simulated Data Submit -> Email: ${emailInput}, Diet: ${dietInput}`);

            // Persist the verified updates locally
            localStorage.setItem("userEmail", emailInput);
            localStorage.setItem("userDiet", dietInput);

            // Dynamic DOM Updates: Instantly update UI text values without reloading page
            displayEmail.textContent = emailInput;
            displayDiet.textContent = dietInput;

            // Success Feedback
            profileFeedback.style.color = "#2ecc71"; // Green color for success
            profileFeedback.textContent = "Profile updated successfully!";
        });
    }

    // --- 7. Planner Page Logic ---
    if (window.location.pathname.includes("planner.html")) {
        // Route Protection
        if (!isLoggedIn) {
            window.location.href = "login.html";
        }

        const plannerContainer = document.getElementById("plannerContainer");
        const plannerFeedback = document.getElementById("plannerFeedback");
        const clearAllBtn = document.getElementById("clearAllBtn");

        function displayPlanner() {
            let currentPlanner = JSON.parse(localStorage.getItem("mealPlanner")) || [];

            // Provide User Feedback if the layout is empty
            if (currentPlanner.length === 0) {
                plannerFeedback.textContent = "Your planner is empty! Go to the Home page to discover and add recipes.";
                plannerContainer.innerHTML = "";
                if (clearAllBtn) clearAllBtn.style.display = "none";
                return;
            }

            if (clearAllBtn) clearAllBtn.style.display = "inline-block";
            plannerFeedback.textContent = "";
            plannerContainer.innerHTML = ""; // Reset current elements

            // Dynamically build and add elements to the DOM
            currentPlanner.forEach((meal, index) => {
                const plannerCard = document.createElement("div");
                plannerCard.classList.add("recipe-item");

                plannerCard.innerHTML = `
                    <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
                    <div class="recipe-info">
                        <h3>${meal.strMeal}</h3>
                        <button class="btn delete-btn" style="background-color: #e74c3c; margin-top: 10px;">Remove</button>
                    </div>
                `;

                // Dynamic Element Modification
                plannerCard.querySelector(".delete-btn").addEventListener("click", () => {
                    // Remove from array array
                    currentPlanner.splice(index, 1);
                    // Update storage
                    localStorage.setItem("mealPlanner", JSON.stringify(currentPlanner));
                    // Re-render UI to update DOM immediately
                    displayPlanner();
                });

                plannerContainer.appendChild(plannerCard);
            });
        }

        // Handle Clear All Button
        if (clearAllBtn) {
            clearAllBtn.addEventListener("click", () => {
                if (confirm("Are you sure you want to clear your entire weekly meal plan?")) {
                    localStorage.removeItem("mealPlanner");
                    displayPlanner(); // Refresh UI
                }
            });
        }

        // Run on page load
        displayPlanner();
    }
});