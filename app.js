document.addEventListener("DOMContentLoaded", () => {
    
    // --- 1. Fake Login & Navigation Logic ---
    const loginForm = document.getElementById("loginForm");
    const logoutBtn = document.getElementById("logoutBtn");
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    const recipeContainer = document.getElementById("recipeContainer");
    const searchForm = document.getElementById("searchForm");
    const themeToggleBtn = document.getElementById("themeToggleBtn");
    const currentTheme = localStorage.getItem("theme");
    
    if (currentTheme === "dark") {
            document.body.classList.add("dark-theme");
    }

    // Event listener for theme switching interactions
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener("click", () => {
            document.body.classList.toggle("dark-theme");
            
            // Store choice globally
            if (document.body.classList.contains("dark-theme")) {
                localStorage.setItem("theme", "dark");
            } else {
                localStorage.setItem("theme", "light");
            }
        });
    }

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
                let currentPlanner = JSON.parse(localStorage.getItem("mealPlanner")) || [];
                
                const exists = currentPlanner.some(item => item.idMeal === meal.idMeal);
                if (!exists) {
                    // CRITICAL: We now explicitly save the idMeal alongside the other properties
                    currentPlanner.push({
                        idMeal: meal.idMeal,
                        strMeal: meal.strMeal,
                        strMealThumb: meal.strMealThumb
                    });
                    localStorage.setItem("mealPlanner", JSON.stringify(currentPlanner));
                    alert(`${meal.strMeal} has been added to your Meal Planner!`);
                } else {
                    alert(`${meal.strMeal} is already in your planner.`);
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
        if (!isLoggedIn) {
            window.location.href = "login.html";
        }

        const plannerContainer = document.getElementById("plannerContainer");
        const plannerFeedback = document.getElementById("plannerFeedback");
        const clearAllBtn = document.getElementById("clearAllBtn");

        function displayPlanner() {
            let currentPlanner = JSON.parse(localStorage.getItem("mealPlanner")) || [];

            if (currentPlanner.length === 0) {
                plannerFeedback.textContent = "Your planner is empty! Go to the Home page to discover and add recipes.";
                plannerContainer.innerHTML = "";
                if (clearAllBtn) clearAllBtn.style.display = "none";
                return;
            }

            if (clearAllBtn) clearAllBtn.style.display = "inline-block";
            plannerFeedback.textContent = "";
            plannerContainer.innerHTML = ""; 

            currentPlanner.forEach((meal, index) => {
                const plannerCard = document.createElement("div");
                plannerCard.classList.add("recipe-item");

                // Layout with an added layout divider, a view details button, and a hidden details display element
                plannerCard.innerHTML = `
                    <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
                    <div class="recipe-info">
                        <h3>${meal.strMeal}</h3>
                        <div style="display: flex; gap: 10px; margin-top: 10px;">
                            <button class="btn view-btn" style="background-color: #3498db; flex: 1;">Ingredients</button>
                            <button class="btn delete-btn" style="background-color: #e74c3c; flex: 1;">Remove</button>
                        </div>
                        <div class="recipe-details" style="display: none; margin-top: 15px; text-align: left; font-size: 0.9rem; border-top: 1px solid #eee; padding-top: 10px;">
                            <p style="color: #7f8c8d;">Loading content details...</p>
                        </div>
                    </div>
                `;

                const viewBtn = plannerCard.querySelector(".view-btn");
                const detailsDiv = plannerCard.querySelector(".recipe-details");

                // Interactive Dynamic Element Toggle Listener
                viewBtn.addEventListener("click", () => {
                    // If the text wrapper element is visible, close it
                    if (detailsDiv.style.display === "block") {
                        detailsDiv.style.display = "none";
                        viewBtn.textContent = "Ingredients";
                        return;
                    }

                    // Show the menu compartment container layout
                    detailsDiv.style.display = "block";
                    viewBtn.textContent = "Hide Details";

                    // Handle cached/offline mode values safely
                    if (meal.idMeal === "1" || meal.idMeal === "2") {
                        detailsDiv.innerHTML = `
                            <strong style="color: var(--primary-color);">Ingredients:</strong>
                            <p>• Fresh Salmon filet / Fish selection<br>• Olive Oil & Mixed Table Herbs</p>
                            <strong style="color: var(--primary-color); display:block; margin-top:5px;">Instructions:</strong>
                            <p>Bake components uniformly in hot oven at 180°C until internal temperature metrics cook clean.</p>
                        `;
                        return;
                    }

                    // Query search full database detail elements matching unique internal tracking key
                    fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`)
                        .then(res => res.json())
                        .then(data => {
                            if (data.meals && data.meals[0]) {
                                const recipeInfo = data.meals[0];
                                
                                // Assemble list items by iterating through API parameters properties
                                let elementsArray = [];
                                for (let i = 1; i <= 20; i++) {
                                    const ingredient = recipeInfo[`strIngredient${i}`];
                                    const measure = recipeInfo[`strMeasure${i}`];
                                    if (ingredient && ingredient.trim() !== "") {
                                        elementsArray.push(`<li>${measure ? measure : ""} ${ingredient}</li>`);
                                    }
                                }

                                // Construct HTML content inside card compartment block dynamically
                                detailsDiv.innerHTML = `
                                    <h4 style="margin-bottom: 5px; color: var(--primary-color);">Ingredients:</h4>
                                    <ul style="padding-left: 20px; margin-bottom: 10px; font-size: 0.85rem;">
                                        ${elementsArray.join("")}
                                    </ul>
                                    <h4 style="margin-bottom: 5px; color: var(--primary-color);">Instructions:</h4>
                                    
                                    <p class="recipe-instructions">
                                        ${recipeInfo.strInstructions}
                                    </p>
                                `;
                            }
                        })
                        .catch(err => {
                            detailsDiv.innerHTML = "<p style='color: #e74c3c;'>Error gathering instructions details.</p>";
                            console.error(err);
                        });
                });

                // Remove structural element button selector
                plannerCard.querySelector(".delete-btn").addEventListener("click", () => {
                    currentPlanner.splice(index, 1);
                    localStorage.setItem("mealPlanner", JSON.stringify(currentPlanner));
                    displayPlanner(); 
                });

                plannerContainer.appendChild(plannerCard);
            });
        }

        if (clearAllBtn) {
            clearAllBtn.addEventListener("click", () => {
                if (confirm("Are you sure you want to clear your entire weekly meal plan?")) {
                    localStorage.removeItem("mealPlanner");
                    displayPlanner(); 
                }
            });
        }
        // Run on page load
        displayPlanner();
    }
});