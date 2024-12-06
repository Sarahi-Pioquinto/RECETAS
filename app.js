if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js')
        .then((registration) => {
            console.log('Service Worker registrado con éxito:', registration.scope);
        })
        .catch((error) => {
            console.error('Error al registrar el Service Worker:', error);
        });
}

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
                    <button class="saveButton" onclick="saveRecipe('${meal.idMeal}', '${meal.strMeal}', '${meal.strMealThumb}')">Guardar</button>
                </div>
            `).join('');
        });
}

// Búsqueda de recetas
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
            <button onclick="viewRecipe('${meal.idMeal}')">Ver Receta</button>
            <button class="saveButton" onclick="saveRecipe('${meal.idMeal}', '${meal.strMeal}', '${meal.strMealThumb}')">Guardar</button>
        </div>
    `).join('');
}

// Guardar una receta
function saveRecipe(id, title, image) {
    if (!savedRecipes.find(recipe => recipe.id === id)) {
        fetch(`${baseUrl}/lookup.php?i=${id}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error("Error al obtener los detalles de la receta");
                }
                return response.json();
            })
            .then(data => {
                const meal = data.meals[0];
                const newRecipe = {
                    id: meal.idMeal,
                    title: meal.strMeal,
                    image: meal.strMealThumb,
                    instructions: meal.strInstructions
                };

                savedRecipes.push(newRecipe);
                localStorage.setItem('savedRecipes', JSON.stringify(savedRecipes));
                displaySavedRecipes();
                alert("Receta guardada exitosamente.");
            })
            .catch(error => {
                console.error("No se pudo guardar la receta", error);
            });
    } else {
        alert("La receta ya está guardada.");
    }
}

// Ver receta (usando datos guardados en localStorage)
function viewRecipe(id) {
    const recipe = savedRecipes.find(recipe => recipe.id === id);
    if (recipe) {
        displayRecipeDetails(recipe);
    } else {
        alert("Esta receta no está guardada y no se puede ver sin conexión.");
    }
}

// Mostrar detalles de una receta
function displayRecipeDetails(meal) {
    document.getElementById('recipeTitle').textContent = meal.title;
    document.getElementById('recipeImage').src = meal.image;
    document.getElementById('instructions').textContent = meal.instructions;

    // Mostrar la sección de detalles
    document.getElementById('recipeDetails').style.display = 'block';
    document.getElementById('recipes').style.display = 'none';
    document.getElementById('carousel').style.display = 'none';
    document.getElementById('saved').style.display = 'none';
}

// Mostrar recetas guardadas
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

// Alternar visibilidad de la sección "Guardadas"
document.querySelector('.saved-icon').addEventListener('click', () => {
    const savedSection = document.getElementById('saved');
    savedSection.style.display = savedSection.style.display === 'none' || savedSection.style.display === '' ? 'block' : 'none';
    document.getElementById('recipeDetails').style.display = 'none';
    document.getElementById('recipes').style.display = 'none';
    document.getElementById('carousel').style.display = 'none';
});

// Regresar a la pantalla inicial
document.querySelector('.home-icon').addEventListener('click', () => {
    document.getElementById('carousel').style.display = 'block';
    document.getElementById('recipes').style.display = 'block';
    document.getElementById('saved').style.display = 'none';
    document.getElementById('recipeDetails').style.display = 'none';
});

// Cargar el carrusel y las recetas guardadas al iniciar
window.addEventListener('load', () => {
    displayCarousel();
    displaySavedRecipes();
});
