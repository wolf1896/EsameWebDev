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
    if (window.location.pathname.includes("index.html") || window.location.pathname === "/" || window.location.pathname.endsWith("/")) {
        if (!isLoggedIn) {
            window.location.href = "login.html";
        }

        // Fulfill dynamic user greeting criteria
        const welcomeGreeting = document.getElementById("welcomeGreeting");
        const statsPlannerCount = document.getElementById("statsPlannerCount");
        const featuredRecipeContainer = document.getElementById("featuredRecipeContainer");

        const savedProfile = JSON.parse(localStorage.getItem("userProfile")) || { name: "Chef User" };
        const currentPlanner = JSON.parse(localStorage.getItem("mealPlanner")) || [];

        if (welcomeGreeting) welcomeGreeting.textContent = `Welcome back, ${savedProfile.name}!`;
        if (statsPlannerCount) statsPlannerCount.textContent = `${currentPlanner.length} Saved Dishes`;

        // Async operation fetching a single random recipe block layout
        fetch("https://www.themealdb.com/api/json/v1/1/random.php")
            .then(res => res.json())
            .then(data => {
                if (data.meals && data.meals[0] && featuredRecipeContainer) {
                    const meal = data.meals[0];
                    
                    // Render an extra premium card presentation block layout
                    featuredRecipeContainer.innerHTML = `
                        <div class="recipe-item" style="width: 100%; max-width: 500px; margin: 0 auto; display: flex; flex-direction: column;">
                            <img src="${meal.strMealThumb}" alt="${meal.strMeal}" style="height: 250px; object-fit: cover;">
                            <div class="recipe-info" style="text-align: center;">
                                <span style="background: var(--primary-color); color: white; padding: 3px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase;">${meal.strCategory || "Featured"}</span>
                                <h3 style="margin: 10px 0 5px 0;">${meal.strMeal}</h3>
                                <p style="font-size: 0.85rem; color: #7f8c8d; margin-bottom: 15px;">Origin: ${meal.strArea || "International"}</p>
                                <button id="addFeaturedBtn" class="btn" style="width: 100%;">Add to Weekly Planner</button>
                            </div>
                        </div>
                    `;

                    // Handle interactive click tracking integration
                    document.getElementById("addFeaturedBtn").addEventListener("click", () => {
                        let currentPlannerList = JSON.parse(localStorage.getItem("mealPlanner")) || [];
                        const exists = currentPlannerList.some(item => item.idMeal === meal.idMeal);

                        if (!exists) {
                            currentPlannerList.push({
                                idMeal: meal.idMeal,
                                strMeal: meal.strMeal,
                                strMealThumb: meal.strMealThumb
                            });
                            localStorage.setItem("mealPlanner", JSON.stringify(currentPlannerList));
                            
                            // Live update counter metric instantly
                            if (statsPlannerCount) statsPlannerCount.textContent = `${currentPlannerList.length} Saved Dishes`;
                            alert(`"${meal.strMeal}" successfully appended to your planner!`);
                        } else {
                            alert(`"${meal.strMeal}" is already inside your planner layout arrays.`);
                        }
                    });
                }
            })
            .catch(err => {
                if (featuredRecipeContainer) {
                    featuredRecipeContainer.innerHTML = "<p style='color: #e74c3c; text-align: center;'>Unable to load recommendation recommendation matrix.</p>";
                }
                console.error(err);
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

                // Injected a full-width green "Download PDF" button button element layout
                plannerCard.innerHTML = `
                    <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
                    <div class="recipe-info">
                        <h3>${meal.strMeal}</h3>
                        <div style="display: flex; gap: 10px; margin-top: 10px;">
                            <button class="btn view-btn" style="background-color: #3498db; flex: 1;">Ingredients</button>
                            <button class="btn delete-btn" style="background-color: #e74c3c; flex: 1;">Remove</button>
                        </div>
                        <button class="btn download-btn" style="background-color: #27ae60; color: white; width: 100%; margin-top: 10px;">📄 Download PDF</button>
                        
                        <div class="recipe-details" style="display: none; margin-top: 15px; text-align: left; font-size: 0.9rem; border-top: 1px solid #eee; padding-top: 10px;">
                            <p style="color: #7f8c8d;">Loading content details...</p>
                        </div>
                    </div>
                `;
                
                const viewBtn = plannerCard.querySelector(".view-btn");
                const downloadBtn = plannerCard.querySelector(".download-btn");
                const detailsDiv = plannerCard.querySelector(".recipe-details");

                // Interactive Dynamic Element Toggle Listener
                viewBtn.addEventListener("click", () => {
                    if (detailsDiv.style.display === "block") {
                        detailsDiv.style.display = "none";
                        viewBtn.textContent = "Ingredients";
                        return;
                    }

                    detailsDiv.style.display = "block";
                    viewBtn.textContent = "Hide Details";

                    if (meal.idMeal === "1" || meal.idMeal === "2") {
                        detailsDiv.innerHTML = `
                            <strong style="color: var(--primary-color);">Ingredients:</strong>
                            <p>• Fresh Salmon filet / Fish selection<br>• Olive Oil & Mixed Table Herbs</p>
                            <strong style="color: var(--primary-color); display:block; margin-top:5px;">Instructions:</strong>
                            <p>Bake components uniformly in hot oven at 180°C until internal temperature metrics cook clean.</p>
                        `;
                        return;
                    }

                    fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`)
                        .then(res => res.json())
                        .then(data => {
                            if (data.meals && data.meals[0]) {
                                const recipeInfo = data.meals[0];
                                let elementsArray = [];
                                for (let i = 1; i <= 20; i++) {
                                    const ingredient = recipeInfo[`strIngredient${i}`];
                                    const measure = recipeInfo[`strMeasure${i}`];
                                    if (ingredient && ingredient.trim() !== "") {
                                        elementsArray.push(`<li>${measure ? measure : ""} ${ingredient}</li>`);
                                    }
                                }

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

                // --- Client Side PDF Export Operation (Clean Page Print) ---
                downloadBtn.addEventListener("click", () => {
                    // Helper function to build a dedicated print page layout and compile it
                    const printCleanRecipePDF = (recipeInfo) => {
                        // 1. Gather the formatted ingredients list properties
                        let ingredientsListHTML = "";
                        for (let i = 1; i <= 20; i++) {
                            const ingredient = recipeInfo[`strIngredient${i}`];
                            const measure = recipeInfo[`strMeasure${i}`];
                            if (ingredient && ingredient.trim() !== "") {
                                ingredientsListHTML += `<li style="margin-bottom: 5px;">${measure ? measure : ""} ${ingredient}</li>`;
                            }
                        }

                        // 2. Build a beautifully isolated, styled document layout in memory
                        const printWorkerElement = document.createElement("div");
                        printWorkerElement.innerHTML = `
                            <div style="padding: 40px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; line-height: 1.6; max-width: 800px; margin: 0 auto;">
                                <div style="text-align: center; border-bottom: 2px solid var(--primary-color, #e67e22); padding-bottom: 15px; margin-bottom: 30px;">
                                    <h1 style="margin: 0; color: #2c3e50; font-size: 2.2rem;">${recipeInfo.strMeal}</h1>
                                    <p style="margin: 5px 0 0 0; color: #7f8c8d; font-style: italic; text-transform: uppercase; font-size: 0.85rem; letter-spacing: 1px;">
                                        Category: ${recipeInfo.strCategory || "General"} | Origin: ${recipeInfo.strArea || "International"}
                                    </p>
                                </div>

                                <div style="display: flex; gap: 30px; margin-bottom: 30px; align-items: flex-start;">
                                    <img src="${recipeInfo.strMealThumb}" alt="${recipeInfo.strMeal}" style="width: 250px; height: 250px; object-fit: cover; border-radius: 6px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                                    <div style="flex: 1;">
                                        <h3 style="margin-top: 0; color: #2c3e50; border-bottom: 1px solid #ddd; padding-bottom: 5px;">Ingredients Required</h3>
                                        <ul style="padding-left: 20px; font-size: 0.95rem;">
                                            ${ingredientsListHTML}
                                        </ul>
                                    </div>
                                </div>

                                <div style="margin-top: 20px;">
                                    <h3 style="color: #2c3e50; border-bottom: 1px solid #ddd; padding-bottom: 5px;">Preparation Instructions</h3>
                                    <p style="white-space: pre-line; font-size: 0.95rem; text-align: justify; color: #34495e;">
                                        ${recipeInfo.strInstructions}
                                    </p>
                                </div>

                                <div style="margin-top: 50px; text-align: center; border-top: 1px solid #eee; padding-top: 15px; font-size: 0.8rem; color: #95a5a6;">
                                    Generated via RecipeApp Workspace — Final Exam Submission
                                </div>
                            </div>
                        `;

                        // 3. Configure file download settings
                        const configurationOptions = {
                            margin:       0.3,
                            filename:     `${recipeInfo.strMeal.replace(/\s+/g, '_')}_Official_Recipe.pdf`,
                            image:        { type: 'jpeg', quality: 0.98 },
                            html2canvas:  { scale: 2, useCORS: true, logging: false },
                            jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
                        };

                        // 4. Pass the custom off-screen element right to the printer bundle
                        html2pdf().set(configurationOptions).from(printWorkerElement).save();
                    };

                    // Check if it's our mockup default recipe data
                    if (meal.idMeal === "1" || meal.idMeal === "2") {
                        const localMockData = {
                            strMeal: meal.strMeal,
                            strMealThumb: meal.strMealThumb,
                            strCategory: "Featured Selection",
                            strArea: "Healthy",
                            strIngredient1: "Fresh Salmon filet", strMeasure1: "1 Large",
                            strIngredient2: "Olive Oil & Mixed Table Herbs", strMeasure2: "To taste",
                            strInstructions: "Bake components uniformly in a hot oven at 180°C until internal temperature metrics cook clean."
                        };
                        printCleanRecipePDF(localMockData);
                        return;
                    }

                    // Otherwise fetch live raw details from API and feed it right into our printer setup
                    downloadBtn.disabled = true;
                    downloadBtn.textContent = "⌛ Compiling PDF...";

                    fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`)
                        .then(res => res.json())
                        .then(data => {
                            if (data.meals && data.meals[0]) {
                                printCleanRecipePDF(data.meals[0]);
                            } else {
                                alert("Could not fetch the clean API data for this recipe.");
                            }
                        })
                        .catch(err => {
                            console.error(err);
                            alert("API connectivity problem occurred while creating PDF.");
                        })
                        .finally(() => {
                            downloadBtn.disabled = false;
                            downloadBtn.textContent = "📄 Download PDF";
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

    // --- 8. Discover Page Logic ---
    if (window.location.pathname.includes("discover.html")) {
        if (!isLoggedIn) {
            window.location.href = "login.html";
        }

        const searchInput = document.getElementById("searchInput");
        const searchType = document.getElementById("searchType");
        const searchBtn = document.getElementById("searchBtn");
        const discoverContainer = document.getElementById("discoverContainer");
        const discoverFeedback = document.getElementById("discoverFeedback");

        function loadRecipes(query = "", type = "name") {
            if (!discoverFeedback || !discoverContainer) return;

            discoverFeedback.style.color = "var(--text-dark)";
            discoverFeedback.textContent = query === "" ? "Loading all registry files..." : "Searching culinary database...";
            discoverContainer.innerHTML = "";

            let apiUrl = `https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`;
            if (type === "ingredient" && query !== "") {
                apiUrl = `https://www.themealdb.com/api/json/v1/1/filter.php?i=${query}`;
            }

            fetch(apiUrl)
                .then(res => res.json())
                .then(data => {
                    if (!data.meals) {
                        discoverFeedback.style.color = "#ff6b6b";
                        discoverFeedback.textContent = `No matches found for "${query}". Try another term!`;
                        return;
                    }

                    // Strict alphabetical sorting sorting metric rule configuration
                    const sortedMeals = data.meals.sort((a, b) => a.strMeal.localeCompare(b.strMeal));

                    discoverFeedback.textContent = query === "" 
                        ? `Browse our comprehensive collection of ${sortedMeals.length} recipes:`
                        : `Found ${sortedMeals.length} records matching your metrics:`;

                    sortedMeals.forEach(meal => {
                        const card = document.createElement("div");
                        card.classList.add("recipe-item");

                        card.innerHTML = `
                            <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
                            <div class="recipe-info">
                                <h3>${meal.strMeal}</h3>
                                <button class="btn save-btn" style="margin-top: 10px; width: 100%;">Add to Planner</button>
                            </div>
                        `;

                        card.querySelector(".save-btn").addEventListener("click", () => {
                            let currentPlannerList = JSON.parse(localStorage.getItem("mealPlanner")) || [];
                            const exists = currentPlannerList.some(item => item.idMeal === meal.idMeal);

                            if (!exists) {
                                currentPlannerList.push({
                                    idMeal: meal.idMeal,
                                    strMeal: meal.strMeal,
                                    strMealThumb: meal.strMealThumb
                                });
                                localStorage.setItem("mealPlanner", JSON.stringify(currentPlannerList));
                                alert(`"${meal.strMeal}" successfully cataloged into your planner!`);
                            } else {
                                alert(`"${meal.strMeal}" is already active in your system parameters.`);
                            }
                        });

                        discoverContainer.appendChild(card);
                    });
                })
                .catch(err => {
                    discoverFeedback.style.color = "#ff6b6b";
                    discoverFeedback.textContent = "Error pulling database arrays.";
                    console.error(err);
                });
        }

        // Default boot state: Load everything sorted alphabetically on initialization
        loadRecipes();

        if (searchBtn) {
            searchBtn.addEventListener("click", () => {
                const query = searchInput.value.trim();
                const type = searchType.value;
                loadRecipes(query, query === "" ? "name" : type);
            });
        }
    }
});