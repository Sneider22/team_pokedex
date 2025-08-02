// Pokémon types with colors for badges
const typeColors = {
    normal: '#A8A878', fighting: '#C03028', flying: '#A890F0', poison: '#A040A0',
    ground: '#E0C068', rock: '#B8A038', bug: '#A8B820', ghost: '#705898',
    steel: '#B8B8D0', fire: '#F08030', water: '#6890F0', grass: '#78C850',
    electric: '#F8D030', psychic: '#F85888', ice: '#98D8D8', dragon: '#7038F8',
    dark: '#705848', fairy: '#EE99AC'
};

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    initializeTabs();
    loadPokemonTypes();
    setupEventListeners();
});

// Tab functionality
function initializeTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const searchTabs = document.querySelectorAll('.search-tab');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            // Remove active class from all tabs and buttons
            tabButtons.forEach(btn => btn.classList.remove('active'));
            searchTabs.forEach(tab => tab.classList.remove('active'));
            
            // Add active class to clicked button and corresponding tab
            this.classList.add('active');
            document.getElementById(`${targetTab}-search`).classList.add('active');
            
            // Clear previous results
            clearResults();
        });
    });
}

// Load Pokémon types into dropdown
async function loadPokemonTypes() {
    try {
        const response = await fetch('https://pokeapi.co/api/v2/type/');
        const data = await response.json();
        const typeSelect = document.getElementById('pokemonType');
        const typeSelect2 = document.getElementById('pokemonType2');
        
        data.results.forEach(type => {
            // First dropdown
            const option = document.createElement('option');
            option.value = type.name;
            option.textContent = type.name.charAt(0).toUpperCase() + type.name.slice(1);
            typeSelect.appendChild(option);
            
            // Second dropdown
            const option2 = document.createElement('option');
            option2.value = type.name;
            option2.textContent = type.name.charAt(0).toUpperCase() + type.name.slice(1);
            typeSelect2.appendChild(option2);
        });
    } catch (error) {
        console.error('Error loading types:', error);
    }
}

// Setup event listeners
function setupEventListeners() {
    document.getElementById('fetchByIdButton').addEventListener('click', () => searchPokemonById());
    document.getElementById('fetchByNameButton').addEventListener('click', () => searchPokemonByName());
    document.getElementById('fetchByTypeButton').addEventListener('click', () => searchPokemonByType());
    document.getElementById('fetchRandomButton').addEventListener('click', () => searchRandomPokemon());
    
    // Enter key support
    document.getElementById('pokemonId').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') searchPokemonById();
    });
    document.getElementById('pokemonName').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') searchPokemonByName();
    });
}

// Search by ID
async function searchPokemonById() {
    const pokemonId = document.getElementById('pokemonId').value;
    const pokemonInfoDiv = document.getElementById('pokemonInfo');
    
    if (!pokemonId || pokemonId < 1 || pokemonId > 1010) {
        pokemonInfoDiv.innerHTML = '<p>Por favor, ingresa un ID válido (1-1010).</p>';
        return;
    }
    
    showLoading();
    
    try {
        const pokemon = await fetchPokemonData(pokemonId);
        displayPokemon(pokemon);
    } catch (error) {
        pokemonInfoDiv.innerHTML = '<p>Error al obtener los datos. Verifica el ID e intenta de nuevo.</p>';
    }
}

// Search by name
async function searchPokemonByName() {
    const pokemonName = document.getElementById('pokemonName').value.toLowerCase().trim();
    const pokemonInfoDiv = document.getElementById('pokemonInfo');
    
    if (!pokemonName) {
        pokemonInfoDiv.innerHTML = '<p>Por favor, ingresa el nombre de un Pokémon.</p>';
        return;
    }
    
    showLoading();
    
    try {
        const pokemon = await fetchPokemonData(pokemonName);
        displayPokemon(pokemon);
    } catch (error) {
        pokemonInfoDiv.innerHTML = '<p>Pokémon no encontrado. Verifica el nombre e intenta de nuevo.</p>';
    }
}

// Search random Pokemon
async function searchRandomPokemon() {
    const pokemonInfoDiv = document.getElementById('pokemonInfo');
    
    showLoading();
    document.getElementById('pokemonList').innerHTML = '';
    
    try {
        // Generate random ID between 1 and 1010
        const randomId = Math.floor(Math.random() * 1010) + 1;
        const pokemon = await fetchPokemonData(randomId);
        displayPokemon(pokemon);
    } catch (error) {
        pokemonInfoDiv.innerHTML = '<p>Error al obtener Pokémon aleatorio. Intenta de nuevo.</p>';
    }
}

// Search by type
async function searchPokemonByType() {
    const selectedType = document.getElementById('pokemonType').value;
    const selectedType2 = document.getElementById('pokemonType2').value;
    const pokemonListDiv = document.getElementById('pokemonList');
    const pokemonInfoDiv = document.getElementById('pokemonInfo');
    
    if (!selectedType) {
        pokemonInfoDiv.innerHTML = '<p>Por favor, selecciona al menos un tipo.</p>';
        return;
    }
    
    showLoading();
    pokemonInfoDiv.innerHTML = '';
    
    try {
        let pokemonList = [];
        let titleText = '';
        
        if (selectedType2) {
            // Dual type search
            const [response1, response2] = await Promise.all([
                fetch(`https://pokeapi.co/api/v2/type/${selectedType}`),
                fetch(`https://pokeapi.co/api/v2/type/${selectedType2}`)
            ]);
            
            const [typeData1, typeData2] = await Promise.all([
                response1.json(),
                response2.json()
            ]);
            
            // Find Pokemon that have both types
            const pokemonSet1 = new Set(typeData1.pokemon.map(p => p.pokemon.name));
            const pokemonSet2 = new Set(typeData2.pokemon.map(p => p.pokemon.name));
            
            const dualTypePokemon = typeData1.pokemon.filter(p => 
                pokemonSet2.has(p.pokemon.name)
            );
            
            pokemonList = dualTypePokemon;
            titleText = `Pokémon de tipo ${selectedType.charAt(0).toUpperCase() + selectedType.slice(1)} y ${selectedType2.charAt(0).toUpperCase() + selectedType2.slice(1)}`;
        } else {
            // Single type search
            const response = await fetch(`https://pokeapi.co/api/v2/type/${selectedType}`);
            const typeData = await response.json();
            
            pokemonList = typeData.pokemon;
            titleText = `Pokémon de tipo ${selectedType.charAt(0).toUpperCase() + selectedType.slice(1)}`;
        }
        
        pokemonListDiv.innerHTML = `<h3>${titleText} (${pokemonList.length} encontrados)</h3>`;
        
        if (pokemonList.length === 0) {
            pokemonListDiv.innerHTML += '<p>No se encontraron Pokémon con esta combinación de tipos.</p>';
            return;
        }
        
        const pokemonCards = await Promise.all(
            pokemonList.map(async (pokemon) => {
                try {
                    const pokemonData = await fetchPokemonData(pokemon.pokemon.name);
                    return createPokemonCard(pokemonData);
                } catch (error) {
                    return null;
                }
            })
        );
        
        const validCards = pokemonCards.filter(card => card !== null);
        pokemonListDiv.innerHTML += validCards.join('');
        
        // Add click listeners to cards
        document.querySelectorAll('.pokemon-card').forEach(card => {
            card.addEventListener('click', async function() {
                const pokemonName = this.getAttribute('data-pokemon');
                showLoading();
                try {
                    const pokemon = await fetchPokemonData(pokemonName);
                    displayPokemon(pokemon);
                    document.getElementById('pokemonInfo').scrollIntoView({ behavior: 'smooth' });
                } catch (error) {
                    console.error('Error loading pokemon details:', error);
                }
            });
        });
        
    } catch (error) {
        pokemonListDiv.innerHTML = '<p>Error al obtener Pokémon de este tipo.</p>';
    }
}

// Fetch Pokemon data from API
async function fetchPokemonData(identifier) {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${identifier}`);
    if (!response.ok) throw new Error('Pokemon not found');
    return await response.json();
}

// Display individual Pokemon
function displayPokemon(pokemon) {
    const pokemonInfoDiv = document.getElementById('pokemonInfo');
    const abilities = pokemon.abilities.map(ability => ability.ability.name).join(', ');
    const types = pokemon.types.map(type => type.type.name);
    
    const typesBadges = types.map(type => 
        `<span class="type-badge" style="background-color: ${typeColors[type] || '#68A090'}; color: white;">${type}</span>`
    ).join(' ');
    
    const statsHtml = pokemon.stats.map(stat => 
        `<div class="stat-item">
            <div class="stat-name">${stat.stat.name}</div>
            <div class="stat-value">${stat.base_stat}</div>
        </div>`
    ).join('');
    
    pokemonInfoDiv.innerHTML = `
        <div class="pokemon-card-detailed">
            <h2>${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)} #${pokemon.id}</h2>
            <img src="${pokemon.sprites.front_default || pokemon.sprites.front_shiny}" alt="${pokemon.name}">
            
            <div class="pokemon-info-section">
                <div class="info-group">
                    <h4>Información Básica</h4>
                    <div class="pokemon-info-grid">
                        <div class="pokemon-info-item">
                            <strong>Tipos</strong>
                            <span>${typesBadges}</span>
                        </div>
                        <div class="pokemon-info-item">
                            <strong>ID Nacional</strong>
                            <span>#${pokemon.id}</span>
                        </div>
                    </div>
                </div>
                
                <div class="info-group">
                    <h4>Características</h4>
                    <div class="pokemon-info-grid">
                        <div class="pokemon-info-item">
                            <strong>Altura</strong>
                            <span>${pokemon.height / 10} m</span>
                        </div>
                        <div class="pokemon-info-item">
                            <strong>Peso</strong>
                            <span>${pokemon.weight / 10} kg</span>
                        </div>
                    </div>
                </div>
                
                <div class="info-group">
                    <h4>Habilidades y Experiencia</h4>
                    <div class="pokemon-info-grid">
                        <div class="pokemon-info-item full-width">
                            <strong>Habilidades</strong>
                            <span>${abilities}</span>
                        </div>
                        <div class="pokemon-info-item full-width">
                            <strong>Experiencia Base</strong>
                            <span>${pokemon.base_experience || 'N/A'}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="pokemon-stats">
                <h3>📊 Estadísticas Base</h3>
                <div class="stats-grid">
                    ${statsHtml}
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('pokemonList').innerHTML = '';
}

// Create Pokemon card for type search
function createPokemonCard(pokemon) {
    const types = pokemon.types.map(type => type.type.name);
    const typesBadges = types.map(type => 
        `<span class="type-badge" style="background-color: ${typeColors[type] || '#68A090'}; color: white;">${type}</span>`
    ).join(' ');
    
    return `
        <div class="pokemon-card" data-pokemon="${pokemon.name}">
            <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
            <h4>${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</h4>
            <p>#${pokemon.id}</p>
            <p>${typesBadges}</p>
        </div>
    `;
}

// Show loading state
function showLoading() {
    document.getElementById('pokemonInfo').innerHTML = '<p>🔄 Cargando...</p>';
    document.getElementById('pokemonList').innerHTML = '';
}

// Clear results
function clearResults() {
    document.getElementById('pokemonInfo').innerHTML = '';
    document.getElementById('pokemonList').innerHTML = '';
}