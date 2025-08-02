// Pokémon types with colors for badges
const typeColors = {
    normal: '#A8A878', fighting: '#C03028', flying: '#A890F0', poison: '#A040A0',
    ground: '#E0C068', rock: '#B8A038', bug: '#A8B820', ghost: '#705898',
    steel: '#B8B8D0', fire: '#F08030', water: '#6890F0', grass: '#78C850',
    electric: '#F8D030', psychic: '#F85888', ice: '#98D8D8', dragon: '#7038F8',
    dark: '#705848', fairy: '#EE99AC'
};

// Pokemon names list for autocomplete
let pokemonNamesList = [];

// Type effectiveness chart - what each type is strong/weak against
const typeEffectiveness = {
    normal: { weak: ['fighting'], strong: [], immune: ['ghost'] },
    fighting: { weak: ['flying', 'psychic', 'fairy'], strong: ['normal', 'rock', 'steel', 'ice', 'dark'], immune: ['ghost'] },
    flying: { weak: ['rock', 'electric', 'ice'], strong: ['fighting', 'bug', 'grass'], immune: ['ground'] },
    poison: { weak: ['ground', 'psychic'], strong: ['fighting', 'poison', 'bug', 'grass', 'fairy'], immune: [] },
    ground: { weak: ['water', 'grass', 'ice'], strong: ['poison', 'rock', 'steel', 'fire', 'electric'], immune: ['flying', 'electric'] },
    rock: { weak: ['fighting', 'ground', 'steel', 'water', 'grass'], strong: ['normal', 'flying', 'poison', 'fire'], immune: [] },
    bug: { weak: ['flying', 'rock', 'fire'], strong: ['fighting', 'ground', 'grass'], immune: [] },
    ghost: { weak: ['ghost', 'dark'], strong: ['poison', 'bug'], immune: ['normal', 'fighting'] },
    steel: { weak: ['fighting', 'ground', 'fire'], strong: ['normal', 'flying', 'rock', 'bug', 'steel', 'grass', 'psychic', 'ice', 'dragon', 'fairy'], immune: ['poison'] },
    fire: { weak: ['ground', 'rock', 'water'], strong: ['bug', 'steel', 'fire', 'grass', 'ice', 'fairy'], immune: [] },
    water: { weak: ['grass', 'electric'], strong: ['steel', 'fire', 'water', 'ice'], immune: [] },
    grass: { weak: ['flying', 'poison', 'bug', 'fire', 'ice'], strong: ['ground', 'rock', 'water'], immune: [] },
    electric: { weak: ['ground'], strong: ['flying', 'steel', 'electric'], immune: [] },
    psychic: { weak: ['bug', 'ghost', 'dark'], strong: ['fighting', 'psychic'], immune: [] },
    ice: { weak: ['fighting', 'rock', 'steel', 'fire'], strong: ['ice'], immune: [] },
    dragon: { weak: ['ice', 'dragon', 'fairy'], strong: ['fire', 'water', 'electric', 'grass'], immune: [] },
    dark: { weak: ['fighting', 'bug', 'fairy'], strong: ['ghost', 'dark'], immune: ['psychic'] },
    fairy: { weak: ['poison', 'steel'], strong: ['fighting', 'bug', 'dark'], immune: ['dragon'] }
};

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    initializeTabs();
    loadPokemonTypes();
    loadPokemonNames();
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

// Load Pokemon names for autocomplete
async function loadPokemonNames() {
    try {
        const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1010');
        const data = await response.json();
        pokemonNamesList = data.results.map((pokemon, index) => ({
            id: index + 1,
            name: pokemon.name
        }));
    } catch (error) {
        console.error('Error loading Pokemon names:', error);
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
    
    // Autocomplete functionality
    setupAutocomplete();
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

// Calculate type effectiveness for a Pokemon
function calculateTypeEffectiveness(pokemonTypes) {
    const weaknesses = new Set();
    const resistances = new Set();
    const immunities = new Set();
    const strongAgainst = new Set();
    
    pokemonTypes.forEach(type => {
        const effectiveness = typeEffectiveness[type];
        if (effectiveness) {
            // Add weaknesses (what this Pokemon is weak to)
            effectiveness.weak.forEach(weakType => weaknesses.add(weakType));
            // Add resistances (what this Pokemon resists)
            effectiveness.strong.forEach(strongType => resistances.add(strongType));
            // Add immunities (what this Pokemon is immune to)
            effectiveness.immune.forEach(immuneType => immunities.add(immuneType));
        }
        
        // Find what this Pokemon's attacks are strong against
        Object.keys(typeEffectiveness).forEach(defenderType => {
            const defenderData = typeEffectiveness[defenderType];
            if (defenderData.weak.includes(type)) {
                strongAgainst.add(defenderType);
            }
        });
    });
    
    // Remove overlaps (if a type appears in both weak and strong, it's neutral)
    const finalWeaknesses = [...weaknesses].filter(type => !resistances.has(type) && !immunities.has(type));
    const finalResistances = [...resistances].filter(type => !weaknesses.has(type) && !immunities.has(type));
    const finalImmunities = [...immunities];
    const finalStrongAgainst = [...strongAgainst];
    
    return {
        weaknesses: finalWeaknesses,
        resistances: finalResistances,
        immunities: finalImmunities,
        strongAgainst: finalStrongAgainst
    };
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
    
    const statsHtml = pokemon.stats.map(stat => {
        const statClass = stat.stat.name.replace('-', '');
        return `<div class="stat-item stat-${statClass}">
            <div class="stat-name">${stat.stat.name}</div>
            <div class="stat-value">${stat.base_stat}</div>
        </div>`;
    }).join('');
    
    // Calculate type effectiveness
    const effectiveness = calculateTypeEffectiveness(types);
    
    // Create type effectiveness badges
    const createTypeBadges = (typeList, className) => {
        return typeList.map(type => 
            `<span class="type-badge ${className}" style="background-color: ${typeColors[type] || '#68A090'}; color: white;">${type}</span>`
        ).join(' ');
    };
    
    const weaknessBadges = createTypeBadges(effectiveness.weaknesses, 'weakness');
    const resistanceBadges = createTypeBadges(effectiveness.resistances, 'resistance');
    const immunityBadges = createTypeBadges(effectiveness.immunities, 'immunity');
    const strongAgainstBadges = createTypeBadges(effectiveness.strongAgainst, 'strong-against');
    
    pokemonInfoDiv.innerHTML = `
        <div class="pokemon-card-detailed">
            <h2>${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)} #${pokemon.id}</h2>
            <img src="${pokemon.sprites.front_default || pokemon.sprites.front_shiny}" alt="${pokemon.name}">
            
            <div class="pokemon-info-section">
                <div class="info-group">
                    <h4>Información Básica</h4>
                    <div class="pokemon-info-grid">
                        <div class="pokemon-info-item combined-item">
                            <div class="combined-content">
                                <div class="info-part">
                                    <strong>ID Nacional</strong>
                                    <span>#${pokemon.id}</span>
                                </div>
                                <div class="info-part">
                                    <strong>Tipos</strong>
                                    <span>${typesBadges}</span>
                                </div>
                            </div>
                        </div>
                        <div class="pokemon-info-item combined-item">
                            <div class="combined-content">
                                <div class="info-part">
                                    <strong>Altura</strong>
                                    <span>${pokemon.height / 10} m</span>
                                </div>
                                <div class="info-part">
                                    <strong>Peso</strong>
                                    <span>${pokemon.weight / 10} kg</span>
                                </div>
                            </div>
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
            
            <div class="type-effectiveness-container">
                <h3>⚔️ Efectividad de Tipos</h3>
                <div class="effectiveness-grid">
                    ${effectiveness.strongAgainst.length > 0 ? `
                        <div class="effectiveness-card strong-against-card">
                            <div class="effectiveness-header">
                                <span class="effectiveness-icon">🗡️</span>
                                <strong>Es fuerte contra</strong>
                            </div>
                            <div class="effectiveness-types">${strongAgainstBadges}</div>
                        </div>
                    ` : ''}
                    ${effectiveness.weaknesses.length > 0 ? `
                        <div class="effectiveness-card weakness-card">
                            <div class="effectiveness-header">
                                <span class="effectiveness-icon">🛡️</span>
                                <strong>Débil contra</strong>
                            </div>
                            <div class="effectiveness-types">${weaknessBadges}</div>
                        </div>
                    ` : ''}
                    ${effectiveness.resistances.length > 0 ? `
                        <div class="effectiveness-card resistance-card">
                            <div class="effectiveness-header">
                                <span class="effectiveness-icon">💪</span>
                                <strong>Resistente a</strong>
                            </div>
                            <div class="effectiveness-types">${resistanceBadges}</div>
                        </div>
                    ` : ''}
                    ${effectiveness.immunities.length > 0 ? `
                        <div class="effectiveness-card immunity-card">
                            <div class="effectiveness-header">
                                <span class="effectiveness-icon">🚫</span>
                                <strong>Inmune a</strong>
                            </div>
                            <div class="effectiveness-types">${immunityBadges}</div>
                        </div>
                    ` : ''}
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

// Setup autocomplete functionality
function setupAutocomplete() {
    const input = document.getElementById('pokemonName');
    const dropdown = document.getElementById('autocomplete-dropdown');
    let currentSelection = -1;
    
    input.addEventListener('input', function() {
        const query = this.value.toLowerCase().trim();
        
        if (query.length < 2) {
            hideDropdown();
            return;
        }
        
        const matches = pokemonNamesList.filter(pokemon => 
            pokemon.name.toLowerCase().startsWith(query)
        ).slice(0, 8); // Limit to 8 suggestions
        
        if (matches.length > 0) {
            showDropdown(matches);
        } else {
            hideDropdown();
        }
        
        currentSelection = -1;
    });
    
    input.addEventListener('keydown', function(e) {
        const items = dropdown.querySelectorAll('.autocomplete-item');
        
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            currentSelection = Math.min(currentSelection + 1, items.length - 1);
            updateSelection(items);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            currentSelection = Math.max(currentSelection - 1, -1);
            updateSelection(items);
        } else if (e.key === 'Enter') {
            if (currentSelection >= 0 && items[currentSelection]) {
                e.preventDefault();
                selectPokemon(items[currentSelection]);
            }
        } else if (e.key === 'Escape') {
            hideDropdown();
        }
    });
    
    // Hide dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (!input.contains(e.target) && !dropdown.contains(e.target)) {
            hideDropdown();
        }
    });
    
    function showDropdown(matches) {
        dropdown.innerHTML = '';
        
        matches.forEach(pokemon => {
            const item = document.createElement('div');
            item.className = 'autocomplete-item';
            item.innerHTML = `
                <span class="pokemon-id">#${pokemon.id}</span>
                <span class="pokemon-name">${pokemon.name}</span>
            `;
            
            item.addEventListener('click', () => selectPokemon(item));
            dropdown.appendChild(item);
        });
        
        dropdown.style.display = 'block';
    }
    
    function hideDropdown() {
        dropdown.style.display = 'none';
        currentSelection = -1;
    }
    
    function updateSelection(items) {
        items.forEach((item, index) => {
            item.classList.toggle('highlighted', index === currentSelection);
        });
    }
    
    function selectPokemon(item) {
        const pokemonName = item.querySelector('.pokemon-name').textContent;
        input.value = pokemonName;
        hideDropdown();
        // Automatically search when selected
        searchPokemonByName();
    }
}

// Clear results
function clearResults() {
    document.getElementById('pokemonInfo').innerHTML = '';
    document.getElementById('pokemonList').innerHTML = '';
}