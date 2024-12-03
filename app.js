const baseUrl = 'https://www.themealdb.com/api/json/v1/1';
const savedRecipes = JSON.parse(localStorage.getItem('savedRecipes')) || [];

// Evento del botón de búsqueda
document.getElementById('searchButton').addEventListener('click', () => {
    const ingredients = document.getElementById('ingredientInput').value;
    searchRecipes(ingredients);
});

// Función para cargar el carrusel de recetas populares
function displayCarousel() {
    fetch(`${baseUrl}/search.php?f=b`) 
        .then(response => response.json())
        .then(data => {
            const carouselContainer = document.getElementById('carouselContainer');
            carouselContainer.innerHTML = data.meals.slice(0, 5).map(meal => `
                <div class="recipe-card">
                    <h3>${meal.strMeal}</h3>
                    <img class="img-popular" src="${meal.strMealThumb}" alt="${meal.strMeal}">
                    <button onclick="viewRecipe('${meal.idMeal}')">Ver Receta</button>
                </div>
            `).join('');
        });
}

// Búsqueda de recetas y almacenamiento en caché
function searchRecipes(ingredients) {
    const cachedData = JSON.parse(localStorage.getItem(`search_${ingredients}`));

    if (cachedData) {
        displaySearchResults(cachedData);
    } else {
        fetch(`${baseUrl}/filter.php?i=${ingredients}`)
            .then(response => response.json())
            .then(data => {
                localStorage.setItem(`search_${ingredients}`, JSON.stringify(data.meals));
                displaySearchResults(data.meals);
            })
            .catch(error => {
                console.error("No hay conexión a Internet y no hay datos en caché", error);
            });
    }
}

// Mostrar resultados de búsqueda
function displaySearchResults(meals) {
    const recipeList = document.getElementById('recipeList');
    recipeList.innerHTML = meals.map(meal => `
        <div class="recipe-card">
            <h3>${meal.strMeal}</h3>
            <img class="img-popular" src="${meal.strMealThumb}" alt="${meal.strMeal}">
            <button onclick="viewRecipe('${meal.idMeal}')">Ver receta</button>
            <button class="saveButton" onclick="saveRecipe('${meal.idMeal}', '${meal.strMeal}', '${meal.strMealThumb}')">Save</button>
        </div>
    `).join('');
}

// Mostrar detalles de una receta
function viewRecipe(id) {
    fetch(`${baseUrl}/lookup.php?i=${id}`)
        .then(response => response.json())
        .then(data => {
            const meal = data.meals[0];
            displayRecipeDetails(meal);
        });
}

// Mostrar detalles específicos de una receta
function displayRecipeDetails(meal) {
    document.getElementById('recipeTitle').textContent = meal.strMeal;
    document.getElementById('recipeImage').src = meal.strMealThumb;

    // Mostrar ingredientes
    const ingredientList = document.getElementById('ingredientList');
    ingredientList.innerHTML = '';
    for (let i = 1; i <= 20; i++) {
        const ingredient = meal[`strIngredient${i}`];
        const measure = meal[`strMeasure${i}`];
        if (ingredient && ingredient.trim() !== '') {
            const listItem = document.createElement('li');
            listItem.textContent = `${measure} ${ingredient}`;
            ingredientList.appendChild(listItem);
        }
    }

    // Mostrar instrucciones
    document.getElementById('instructions').textContent = meal.strInstructions;

    // Mostrar la sección de detalles y ocultar las otras
    document.getElementById('recipeDetails').style.display = 'block';
    document.getElementById('recipes').style.display = 'none';
    document.getElementById('carousel').style.display = 'none';
    document.getElementById('saved').style.display = 'none';
}

// Cerrar la vista de detalles de la receta y mostrar secciones principales
function closeRecipeDetails() {
    document.getElementById('recipeDetails').style.display = 'none';
    document.getElementById('recipes').style.display = 'block';
    document.getElementById('carousel').style.display = 'block';
    document.getElementById('saved').style.display = 'none';
}

// Guardar una receta
function saveRecipe(id, title, image) {
    if (!savedRecipes.find(recipe => recipe.id === id)) {
        savedRecipes.push({ id, title, image });
        localStorage.setItem('savedRecipes', JSON.stringify(savedRecipes));
        displaySavedRecipes();
        alert("Receta guardada exitosamente.");
    }
}

// Mostrar recetas guardadas en la sección "Guardadas"
function displaySavedRecipes() {
    const savedList = document.getElementById('savedRecipesList');
    savedList.innerHTML = savedRecipes.map(recipe => `
        <div class="recipe-card">
            <h3>${recipe.title}</h3>
            <img class="img-popular" src="${recipe.image}" alt="${recipe.title}">
            <button onclick="viewRecipe('${recipe.id}')">Ver Receta</button>
        </div>
    `).join('');
}

// Alternar visibilidad de la sección "Guardadas" al hacer clic en el icono de guardado
document.querySelector('.saved-icon').addEventListener('click', () => {
    const savedSection = document.getElementById('saved');
    savedSection.style.display = savedSection.style.display === 'none' || savedSection.style.display === '' ? 'block' : 'none';
    document.getElementById('recipeDetails').style.display = 'none';
    document.getElementById('recipes').style.display = 'none';
    document.getElementById('carousel').style.display = 'none';
});

// Evento para regresar a la pantalla inicial al hacer clic en el icono de "home"
document.querySelector('.home-icon').addEventListener('click', () => {
    // Mostrar secciones de carrusel y recetas populares
    document.getElementById('carousel').style.display = 'block';
    document.getElementById('recipes').style.display = 'block';
    
    // Ocultar otras secciones
    document.getElementById('saved').style.display = 'none';
    document.getElementById('recipeDetails').style.display = 'none';
});

// Cargar el carrusel y las recetas guardadas al iniciar
window.addEventListener('load', () => {
    displayCarousel();
    displaySavedRecipes();
});
