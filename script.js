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

// Current Pokemon data for shiny toggle
let currentPokemonData = null;
let isShinyMode = false;

// Attacker vs Defender type chart (multipliers) for Generation 6+
const typeChart = {
    normal: { poison: 0.5, rock: 0.5, ghost: 0, steel: 0.5 },
    fire: { fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2 },
    water: { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
    electric: { water: 2, electric: 0.5, grass: 0.5, ground: 0, flying: 2, dragon: 0.5 },
    grass: { fire: 0.5, water: 2, grass: 0.5, poison: 0.5, ground: 2, flying: 0.5, bug: 0.5, rock: 2, dragon: 0.5, steel: 0.5 },
    ice: { fire: 0.5, water: 0.5, grass: 2, ice: 0.5, ground: 2, flying: 2, dragon: 2, steel: 0.5 },
    fighting: { normal: 2, ice: 2, fighting: 1, poison: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 2, ghost: 0, dark: 2, steel: 2, fairy: 0.5 },
    poison: { grass: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0, fairy: 2 },
    ground: { fire: 2, electric: 2, grass: 0.5, poison: 2, flying: 0, bug: 0.5, rock: 2, steel: 2 },
    flying: { electric: 0.5, grass: 2, fighting: 2, bug: 2, rock: 0.5, steel: 0.5 },
    psychic: { fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5 },
    bug: { fire: 0.5, fighting: 0.5, poison: 0.5, flying: 0.5, grass: 2, psychic: 2, ghost: 0.5, dark: 2, steel: 0.5, fairy: 0.5 },
    rock: { fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2, steel: 0.5 },
    ghost: { normal: 0, psychic: 2, ghost: 2, dark: 0.5 },
    dragon: { dragon: 2, steel: 0.5, fairy: 0 },
    dark: { fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, fairy: 0.5 },
    steel: { fire: 0.5, water: 0.5, electric: 0.5, ice: 2, rock: 2, steel: 0.5, fairy: 2 },
    fairy: { fire: 0.5, fighting: 2, poison: 0.5, dragon: 2, dark: 2, steel: 0.5 }
};

const allTypes = ['normal', 'fire', 'water', 'electric', 'grass', 'ice', 'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'];

// Modal control helpers
function openModalLoading() {
    const modal = document.getElementById('pokemonModal');
    const loading = document.getElementById('modalLoading');
    const content = document.getElementById('modalContent');
    
    loading.innerHTML = `
        <div class="spinner"></div>
        <p>Cargando datos del Pokémon...</p>
    `;
    
    loading.style.display = 'flex';
    content.style.display = 'none';
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    const modal = document.getElementById('pokemonModal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

function showModalError(message) {
    const loading = document.getElementById('modalLoading');
    loading.innerHTML = `
        <div class="error-message" style="text-align: center; padding: 20px;">
            <div style="font-size: 3em; color: #dc2626; font-weight: bold; margin-bottom: 10px;">!</div>
            <p style="margin: 15px 0; color: #dc2626; font-weight: 600;">${message}</p>
            <button onclick="closeModal()" class="search-btn" style="margin-top: 10px;">Cerrar</button>
        </div>
    `;
}

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    initializeTabs();
    loadPokemonTypes();
    setupCustomDropdowns();
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

// Dynamic style changes and element icon updates for type selectors
function updateTypeSelectUI(selectEl, badgeId, iconId) {
    const val = selectEl.value;
    const badge = document.getElementById(badgeId);
    const icon = document.getElementById(iconId);
    if (!badge || !icon) return;
    
    if (val && typeColors[val]) {
        badge.style.backgroundColor = typeColors[val];
        badge.classList.remove('empty');
        icon.src = `https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/${val}.svg`;
    } else {
        badge.style.backgroundColor = '';
        badge.classList.add('empty');
        // Simple generic grey circle SVG placeholder
        icon.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'><circle cx='12' cy='12' r='10'></circle></svg>";
    }
}

// Load Pokémon types into dropdowns with Spanish translation and element icons
async function loadPokemonTypes() {
    try {
        const response = await fetch('https://pokeapi.co/api/v2/type/');
        const data = await response.json();
        const typeSelect = document.getElementById('pokemonType');
        const typeSelect2 = document.getElementById('pokemonType2');
        
        if (!typeSelect || !typeSelect2) return;
        
        // Reset selections
        typeSelect.innerHTML = '<option value="">Tipo principal...</option>';
        typeSelect2.innerHTML = '<option value="">Tipo secundario (opcional)...</option>';
        
        const typeDetails = {
            normal: { name: 'Normal', icon: '⚪' },
            fighting: { name: 'Lucha', icon: '🥊' },
            flying: { name: 'Volador', icon: '🦅' },
            poison: { name: 'Veneno', icon: '☠️' },
            ground: { name: 'Tierra', icon: '🏜️' },
            rock: { name: 'Roca', icon: '🪨' },
            bug: { name: 'Bicho', icon: '🐛' },
            ghost: { name: 'Fantasma', icon: '👻' },
            steel: { name: 'Acero', icon: '⚙️' },
            fire: { name: 'Fuego', icon: '🔥' },
            water: { name: 'Agua', icon: '💧' },
            grass: { name: 'Planta', icon: '🍃' },
            electric: { name: 'Eléctrico', icon: '⚡' },
            psychic: { name: 'Psíquico', icon: '🔮' },
            ice: { name: 'Hielo', icon: '❄️' },
            dragon: { name: 'Dragón', icon: '🐲' },
            dark: { name: 'Siniestro', icon: '🌑' },
            fairy: { name: 'Hada', icon: '🧚' }
        };
        
        data.results.forEach(type => {
            const info = typeDetails[type.name];
            if (!info) return; // Skip unknown / shadow types
            
            // First dropdown
            const option = document.createElement('option');
            option.value = type.name;
            option.textContent = `${info.name} ${info.icon}`;
            typeSelect.appendChild(option);
            
            // Second dropdown
            const option2 = document.createElement('option');
            option2.value = type.name;
            option2.textContent = `${info.name} ${info.icon}`;
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

function setupEventListeners() {
    document.getElementById('fetchByIdButton').addEventListener('click', () => searchPokemonById());
    document.getElementById('fetchByNameButton').addEventListener('click', () => searchPokemonByName());
    document.getElementById('fetchByTypeButton').addEventListener('click', () => searchPokemonByType());
    
    const randomPokeball = document.getElementById('randomPokeball');
    if (randomPokeball) {
        randomPokeball.addEventListener('click', () => searchRandomPokemon());
    }
    
    // Enter key support
    document.getElementById('pokemonId').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') searchPokemonById();
    });
    document.getElementById('pokemonName').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') searchPokemonByName();
    });
    
    // Autocomplete functionality
    setupAutocomplete();

    // Modal close listeners
    document.getElementById('modalClose').addEventListener('click', closeModal);
    document.getElementById('modalOverlay').addEventListener('click', closeModal);
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });
}

// Search by ID
async function searchPokemonById() {
    const pokemonId = document.getElementById('pokemonId').value;
    
    if (!pokemonId || pokemonId < 1 || pokemonId > 1010) {
        alert('Por favor, ingresa un ID válido (1-1010).');
        return;
    }
    
    openModalLoading();
    
    try {
        const pokemon = await fetchPokemonData(pokemonId);
        await displayPokemon(pokemon);
    } catch (error) {
        showModalError('Error al obtener los datos. Verifica el ID e intenta de nuevo.');
    }
}

// Search by name
async function searchPokemonByName() {
    const pokemonName = document.getElementById('pokemonName').value.toLowerCase().trim();
    
    if (!pokemonName) {
        alert('Por favor, ingresa el nombre de un Pokémon.');
        return;
    }
    
    openModalLoading();
    
    try {
        const pokemon = await fetchPokemonData(pokemonName);
        await displayPokemon(pokemon);
    } catch (error) {
        showModalError('Pokémon no encontrado. Verifica el nombre e intenta de nuevo.');
    }
}

// Search random Pokemon
async function searchRandomPokemon() {
    const pokeball = document.getElementById('randomPokeball');
    if (pokeball) {
        pokeball.classList.add('spinning');
        // Wait 750ms for spin animation to play out
        await new Promise(resolve => setTimeout(resolve, 750));
        pokeball.classList.remove('spinning');
    }
    
    openModalLoading();
    
    try {
        const randomId = Math.floor(Math.random() * 1010) + 1;
        const pokemon = await fetchPokemonData(randomId);
        await displayPokemon(pokemon);
    } catch (error) {
        showModalError('Error al obtener Pokémon aleatorio. Intenta de nuevo.');
    }
}

// Search by type
// Selected type values for custom dropdown selectors
let selectedType1 = '';
let selectedType2 = '';

// Toggle dynamic custom type selects
function setupCustomDropdowns() {
    const trigger1 = document.getElementById('typeTrigger1');
    const container1 = document.getElementById('typeSelectContainer1');
    const trigger2 = document.getElementById('typeTrigger2');
    const container2 = document.getElementById('typeSelectContainer2');
    
    if (!trigger1 || !trigger2) return;
    
    trigger1.addEventListener('click', function(e) {
        e.stopPropagation();
        container2.classList.remove('active');
        container1.classList.toggle('active');
    });
    
    trigger2.addEventListener('click', function(e) {
        e.stopPropagation();
        container1.classList.remove('active');
        container2.classList.toggle('active');
    });
    
    // Close dropdowns on outside click
    document.addEventListener('click', function() {
        if (container1) container1.classList.remove('active');
        if (container2) container2.classList.remove('active');
    });
}

// Load Pokémon types into dynamic custom dropdown options panels
function loadPokemonTypes() {
    const panel1 = document.getElementById('optionsPanel1');
    const panel2 = document.getElementById('optionsPanel2');
    if (!panel1 || !panel2) return;
    
    panel1.innerHTML = '';
    panel2.innerHTML = '';
    
    const typesList = [
        { id: 'normal', name: 'Normal' },
        { id: 'fire', name: 'Fuego' },
        { id: 'water', name: 'Agua' },
        { id: 'electric', name: 'Eléctrico' },
        { id: 'grass', name: 'Planta' },
        { id: 'ice', name: 'Hielo' },
        { id: 'fighting', name: 'Lucha' },
        { id: 'poison', name: 'Veneno' },
        { id: 'ground', name: 'Tierra' },
        { id: 'flying', name: 'Volador' },
        { id: 'psychic', name: 'Psíquico' },
        { id: 'bug', name: 'Bicho' },
        { id: 'rock', name: 'Roca' },
        { id: 'ghost', name: 'Fantasma' },
        { id: 'dragon', name: 'Dragón' },
        { id: 'dark', name: 'Siniestro' },
        { id: 'steel', name: 'Acero' },
        { id: 'fairy', name: 'Hada' }
    ];
    
    // Add default reset option for select 1
    const reset1 = document.createElement('div');
    reset1.className = 'custom-option-item selected';
    reset1.setAttribute('data-value', '');
    reset1.innerHTML = `
        <span class="type-icon-badge empty" style="width: 28px; height: 28px;">
            <img class="dropdown-type-icon" src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'><circle cx='12' cy='12' r='10'></circle></svg>" style="width: 14px; height: 14px;">
        </span>
        <span>Tipo principal...</span>
    `;
    reset1.addEventListener('click', () => selectCustomOption(1, '', 'Tipo principal...', '#e2e8f0', reset1));
    panel1.appendChild(reset1);
    
    // Add default reset option for select 2
    const reset2 = document.createElement('div');
    reset2.className = 'custom-option-item selected';
    reset2.setAttribute('data-value', '');
    reset2.innerHTML = `
        <span class="type-icon-badge empty" style="width: 28px; height: 28px;">
            <img class="dropdown-type-icon" src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'><circle cx='12' cy='12' r='10'></circle></svg>" style="width: 14px; height: 14px;">
        </span>
        <span>Ninguno</span>
    `;
    reset2.addEventListener('click', () => selectCustomOption(2, '', 'Ninguno', '#e2e8f0', reset2));
    panel2.appendChild(reset2);
    
    // Populating list items
    typesList.forEach(type => {
        const color = typeColors[type.id] || '#68A090';
        
        // Option item for Selector 1
        const opt1 = document.createElement('div');
        opt1.className = 'custom-option-item';
        opt1.setAttribute('data-value', type.id);
        opt1.innerHTML = `
            <span class="type-icon-badge" style="background-color: ${color}; width: 28px; height: 28px;">
                <img class="dropdown-type-icon" src="https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/${type.id}.svg" style="width: 14px; height: 14px;">
            </span>
            <span>${type.name}</span>
        `;
        opt1.addEventListener('click', () => selectCustomOption(1, type.id, type.name, color, opt1));
        panel1.appendChild(opt1);
        
        // Option item for Selector 2
        const opt2 = document.createElement('div');
        opt2.className = 'custom-option-item';
        opt2.setAttribute('data-value', type.id);
        opt2.innerHTML = `
            <span class="type-icon-badge" style="background-color: ${color}; width: 28px; height: 28px;">
                <img class="dropdown-type-icon" src="https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/${type.id}.svg" style="width: 14px; height: 14px;">
            </span>
            <span>${type.name}</span>
        `;
        opt2.addEventListener('click', () => selectCustomOption(2, type.id, type.name, color, opt2));
        panel2.appendChild(opt2);
    });
}

function selectCustomOption(dropdownId, value, label, color, element) {
    const textEl = document.getElementById(`textTrigger${dropdownId}`);
    const badgeEl = document.getElementById(`badgeTrigger${dropdownId}`);
    const iconEl = document.getElementById(`iconTrigger${dropdownId}`);
    const panelEl = document.getElementById(`optionsPanel${dropdownId}`);
    
    if (dropdownId === 1) {
        selectedType1 = value;
    } else {
        selectedType2 = value;
    }
    
    // Update Trigger Field UI
    if (textEl) {
        textEl.textContent = label;
        textEl.style.color = value ? '#1e293b' : '#475569';
    }
    
    if (badgeEl) {
        badgeEl.style.backgroundColor = value ? color : '';
        if (value) {
            badgeEl.classList.remove('empty');
        } else {
            badgeEl.classList.add('empty');
        }
    }
    
    if (iconEl) {
        if (value) {
            iconEl.src = `https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/${value}.svg`;
        } else {
            iconEl.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'><circle cx='12' cy='12' r='10'></circle></svg>";
        }
    }
    
    // Toggle Highlight classes
    if (panelEl) {
        panelEl.querySelectorAll('.custom-option-item').forEach(item => {
            item.classList.remove('selected');
        });
        if (element) {
            element.classList.add('selected');
        } else {
            const resetItem = panelEl.querySelector('.custom-option-item[data-value=""]');
            if (resetItem) resetItem.classList.add('selected');
        }
    }
}

// Search by type
async function searchPokemonByType() {
    const pokemonListDiv = document.getElementById('pokemonList');
    const pokemonInfoDiv = document.getElementById('pokemonInfo');
    
    if (!selectedType1) {
        alert('Por favor, selecciona al menos un tipo.');
        return;
    }
    
    showLoading();
    pokemonInfoDiv.innerHTML = '';
    
    try {
        let pokemonList = [];
        let titleText = '';
        
        const typeNamesMap = {
            normal: 'Normal', fire: 'Fuego', water: 'Agua', electric: 'Eléctrico',
            grass: 'Planta', ice: 'Hielo', fighting: 'Lucha', poison: 'Veneno',
            ground: 'Tierra', flying: 'Volador', psychic: 'Psíquico', bug: 'Bicho',
            rock: 'Roca', ghost: 'Fantasma', dragon: 'Dragón', dark: 'Siniestro',
            steel: 'Acero', fairy: 'Hada'
        };
        
        if (selectedType2) {
            // Dual type search
            const [response1, response2] = await Promise.all([
                fetch(`https://pokeapi.co/api/v2/type/${selectedType1}`),
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
            titleText = `Pokémon de tipo ${typeNamesMap[selectedType1]} y ${typeNamesMap[selectedType2]}`;
        } else {
            // Single type search
            const response = await fetch(`https://pokeapi.co/api/v2/type/${selectedType1}`);
            const typeData = await response.json();
            
            pokemonList = typeData.pokemon;
            titleText = `Pokémon de tipo ${typeNamesMap[selectedType1]}`;
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
                openModalLoading();
                try {
                    const pokemon = await fetchPokemonData(pokemonName);
                    await displayPokemon(pokemon);
                } catch (error) {
                    showModalError('Error al obtener detalles del Pokémon.');
                }
            });
        });
        
    } catch (error) {
        pokemonListDiv.innerHTML = '<p>Error al obtener Pokémon de este tipo.</p>';
    }
}

// Get Pokemon region based on ID
function getPokemonRegion(pokemonId) {
    if (pokemonId >= 1 && pokemonId <= 151) return 'Kanto';
    if (pokemonId >= 152 && pokemonId <= 251) return 'Johto';
    if (pokemonId >= 252 && pokemonId <= 386) return 'Hoenn';
    if (pokemonId >= 387 && pokemonId <= 493) return 'Sinnoh';
    if (pokemonId >= 494 && pokemonId <= 649) return 'Teselia';
    if (pokemonId >= 650 && pokemonId <= 721) return 'Kalos';
    if (pokemonId >= 722 && pokemonId <= 809) return 'Alola';
    if (pokemonId >= 810 && pokemonId <= 898) return 'Galar';
    if (pokemonId >= 899 && pokemonId <= 1010) return 'Paldea';
    return 'Desconocida';
}

// Calculate precise defensive type effectiveness multipliers
function getDefensiveEffectiveness(t1, t2 = null) {
    const results = {
        '4': [],
        '2': [],
        '0.5': [],
        '0.25': [],
        '0': []
    };
    
    allTypes.forEach(attacker => {
        let mult = 1;
        
        // Attacker vs Type 1
        if (typeChart[attacker] && typeChart[attacker][t1] !== undefined) {
            mult *= typeChart[attacker][t1];
        }
        
        // Attacker vs Type 2
        if (t2 && typeChart[attacker] && typeChart[attacker][t2] !== undefined) {
            mult *= typeChart[attacker][t2];
        }
        
        if (mult === 4) results['4'].push(attacker);
        else if (mult === 2) results['2'].push(attacker);
        else if (mult === 0.5) results['0.5'].push(attacker);
        else if (mult === 0.25) results['0.25'].push(attacker);
        else if (mult === 0) results['0'].push(attacker);
    });
    
    return results;
}

// Calculate offensive coverage strengths for STAB moves
function getOffensiveStrengths(t1, t2 = null) {
    const strongAgainst = new Set();
    
    allTypes.forEach(defender => {
        if (typeChart[t1] && typeChart[t1][defender] === 2) {
            strongAgainst.add(defender);
        }
        if (t2 && typeChart[t2] && typeChart[t2][defender] === 2) {
            strongAgainst.add(defender);
        }
    });
    
    return Array.from(strongAgainst);
}

// Fetch Pokemon data from API
async function fetchPokemonData(identifier) {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${identifier}`);
    if (!response.ok) throw new Error('Pokemon not found');
    return await response.json();
}

// Fetch Spanish flavor text
async function fetchPokemonFlavorText(pokemonId) {
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemonId}`);
        if (!response.ok) return 'No hay descripción disponible para este Pokémon.';
        const data = await response.json();
        
        // Find Spanish description
        let spanishEntry = data.flavor_text_entries.find(entry => entry.language.name === 'es');
        if (spanishEntry) {
            return spanishEntry.flavor_text.replace(/\f/g, ' ').replace(/\n/g, ' ');
        }
        
        // Fallback to English description
        let englishEntry = data.flavor_text_entries.find(entry => entry.language.name === 'en');
        if (englishEntry) {
            return englishEntry.flavor_text.replace(/\f/g, ' ').replace(/\n/g, ' ');
        }
        
        return 'No hay descripción disponible para este Pokémon.';
    } catch (e) {
        console.error('Error fetching flavor text:', e);
        return 'No se pudo cargar la descripción del Pokémon.';
    }
}

// Display individual Pokemon details in a premium modal
async function displayPokemon(pokemon) {
    const modalContent = document.getElementById('modalContent');
    const modalLoading = document.getElementById('modalLoading');
    
    // Fetch flavor text description
    const flavorText = await fetchPokemonFlavorText(pokemon.id);
    
    const types = pokemon.types.map(type => type.type.name);
    const primaryType = types[0];
    const secondaryType = types[1] || null;
    
    const typesBadges = types.map(type => 
        `<span class="type-badge" style="background-color: ${typeColors[type] || '#68A090'}; color: white;">${type}</span>`
    ).join(' ');
    
    // Calculate stats and Base Stat Total (BST)
    let bst = 0;
    pokemon.stats.forEach(s => {
        bst += s.base_stat;
    });
    
    // Calculate type effectiveness
    const effectiveness = getDefensiveEffectiveness(primaryType, secondaryType);
    const offensiveStrengths = getOffensiveStrengths(primaryType, secondaryType);
    
    // Apply dynamic type color gradient to header
    const headerClass = `modal-pokemon-header modal-type-${primaryType}`;
    
    // Get high-res artwork images
    const normalImg = pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.other.home.front_default || pokemon.sprites.front_default;
    const shinyImg = pokemon.sprites.other['official-artwork'].front_shiny || pokemon.sprites.other.home.front_shiny || pokemon.sprites.front_shiny || normalImg;
    
    // Store current Pokemon data for shiny toggle inside modal
    currentPokemonData = {
        ...pokemon,
        normalImg,
        shinyImg
    };
    isShinyMode = false;
    
    const abilitiesList = pokemon.abilities.map(a => a.ability.name.replace(/-/g, ' ')).join(', ');
    
    // Render the tabs and details inside the modal
    modalContent.innerHTML = `
        <div class="${headerClass}">
            <h2>${pokemon.name}</h2>
            <div class="modal-pokemon-id">N.º de Pokédex #${pokemon.id}</div>
        </div>
        
        <div class="modal-tabs">
            <button class="modal-tab-btn active" data-tab="resumen">Resumen</button>
            <button class="modal-tab-btn" data-tab="estadisticas">Estadísticas</button>
            <button class="modal-tab-btn" data-tab="efectividades">Efectividades</button>
        </div>
        
        <div class="modal-body">
            <!-- PESTAÑA RESUMEN -->
            <div id="tab-resumen" class="modal-tab-content active">
                <div class="summary-layout">
                    <div class="modal-image-panel">
                        <img id="modal-pokemon-image" class="modal-pokemon-img" src="${normalImg}" alt="${pokemon.name}">
                        <button id="modal-shiny-toggle" class="modal-shiny-btn">
                            Ver Shiny
                        </button>
                    </div>
                    <div class="modal-info-panel">
                        <p class="pokemon-description">"${flavorText}"</p>
                        <div class="info-grid">
                            <div class="info-box">
                                <div class="info-label">Tipos</div>
                                <div class="info-value">${typesBadges}</div>
                            </div>
                            <div class="info-box">
                                <div class="info-label">Región</div>
                                <div class="info-value">${getPokemonRegion(pokemon.id)}</div>
                            </div>
                            <div class="info-box">
                                <div class="info-label">Altura</div>
                                <div class="info-value">${pokemon.height / 10} m</div>
                            </div>
                            <div class="info-box">
                                <div class="info-label">Peso</div>
                                <div class="info-value">${pokemon.weight / 10} kg</div>
                            </div>
                            <div class="info-box full-width">
                                <div class="info-label">Habilidades</div>
                                <div class="info-value" style="text-transform: capitalize;">${abilitiesList}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- PESTAÑA ESTADÍSTICAS -->
            <div id="tab-estadisticas" class="modal-tab-content">
                <div class="bst-container">
                    <div class="bst-label">Base Stat Total (BST)</div>
                    <div class="bst-value">${bst}</div>
                </div>
                <div class="stats-detailed-list">
                    ${pokemon.stats.map(s => {
                        const statNameMap = {
                            'hp': 'PS',
                            'attack': 'Ataque',
                            'defense': 'Defensa',
                            'special-attack': 'At. Esp.',
                            'special-defense': 'Def. Esp.',
                            'speed': 'Velocidad'
                        };
                        const cleanName = s.stat.name;
                        const label = statNameMap[cleanName] || cleanName;
                        const value = s.base_stat;
                        
                        // Calculate ranges at Level 100 for competitive
                        let min, max;
                        if (cleanName === 'hp') {
                            if (pokemon.id === 292) { // Shedinja
                                min = 1;
                                max = 1;
                            } else {
                                min = Math.floor(value * 2 + 110);
                                max = Math.floor(value * 2 + 204);
                            }
                        } else {
                            min = Math.floor((value * 2 + 5) * 0.9);
                            max = Math.floor((value * 2 + 99) * 1.1);
                        }
                        
                        // Capped at 200 base for visual bar representation
                        const barPct = Math.min(100, (value / 200) * 100);
                        
                        // Classes maps to match styles.css color gradients
                        const cssClassMap = {
                            'hp': 'stat-hp',
                            'attack': 'stat-attack',
                            'defense': 'stat-defense',
                            'special-attack': 'stat-specialattack',
                            'special-defense': 'stat-specialdefense',
                            'speed': 'stat-speed'
                        };
                        const barClass = cssClassMap[cleanName] || 'stat-speed';
                        
                        return `
                            <div class="stat-row-detailed">
                                <div class="stat-label-detailed">${label}</div>
                                <div class="stat-val-detailed">${value}</div>
                                <div class="stat-bar-container">
                                    <div class="stat-bar-fill ${barClass}" style="width: ${barPct}%;"></div>
                                </div>
                                <div class="stat-range-lv100">
                                    <span class="range-min">Mín: ${min}</span>
                                    <span class="range-max">Máx: ${max}</span>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
            
            <!-- PESTAÑA EFECTIVIDADES -->
            <div id="tab-efectividades" class="modal-tab-content">
                <h3 class="effectiveness-section-title">Daño Recibido (Defensa)</h3>
                <div class="effectiveness-group-grid">
                    ${effectiveness['4'].length > 0 ? `
                        <div class="mult-row">
                            <span class="mult-badge-label mult-4x">4x</span>
                            <div class="mult-types-list">
                                ${effectiveness['4'].map(t => `<span class="type-badge" style="background-color: ${typeColors[t]}; color: white;">${t}</span>`).join('')}
                            </div>
                        </div>
                    ` : ''}
                    ${effectiveness['2'].length > 0 ? `
                        <div class="mult-row">
                            <span class="mult-badge-label mult-2x">2x</span>
                            <div class="mult-types-list">
                                ${effectiveness['2'].map(t => `<span class="type-badge" style="background-color: ${typeColors[t]}; color: white;">${t}</span>`).join('')}
                            </div>
                        </div>
                    ` : ''}
                    ${effectiveness['0.5'].length > 0 ? `
                        <div class="mult-row">
                            <span class="mult-badge-label mult-0-5x">0.5x</span>
                            <div class="mult-types-list">
                                ${effectiveness['0.5'].map(t => `<span class="type-badge" style="background-color: ${typeColors[t]}; color: white;">${t}</span>`).join('')}
                            </div>
                        </div>
                    ` : ''}
                    ${effectiveness['0.25'].length > 0 ? `
                        <div class="mult-row">
                            <span class="mult-badge-label mult-0-25x">0.25x</span>
                            <div class="mult-types-list">
                                ${effectiveness['0.25'].map(t => `<span class="type-badge" style="background-color: ${typeColors[t]}; color: white;">${t}</span>`).join('')}
                            </div>
                        </div>
                    ` : ''}
                    ${effectiveness['0'].length > 0 ? `
                        <div class="mult-row">
                            <span class="mult-badge-label mult-0x">0x</span>
                            <div class="mult-types-list">
                                ${effectiveness['0'].map(t => `<span class="type-badge" style="background-color: ${typeColors[t]}; color: white;">${t}</span>`).join('')}
                            </div>
                        </div>
                    ` : ''}
                    ${Object.values(effectiveness).every(arr => arr.length === 0) ? `
                        <p style="color: #64748b; font-style: italic; text-align: center;">Daño neutro (1x) de todos los tipos elementales.</p>
                    ` : ''}
                </div>
                
                <h3 class="effectiveness-section-title">Cobertura Ofensiva Súper Efectiva (STAB)</h3>
                <div class="offensive-info">
                    Los ataques con bonus por tipo del mismo Pokémon (**${types.map(t => t.charAt(0).toUpperCase() + t.slice(1)).join(' o ')}**) causarán **2x de daño** contra oponentes de tipo:
                    <div class="mult-types-list" style="margin-top: 10px;">
                        ${offensiveStrengths.length > 0 
                            ? offensiveStrengths.map(t => `<span class="type-badge" style="background-color: ${typeColors[t]}; color: white;">${t}</span>`).join('') 
                            : '<span style="color: #64748b; font-style: italic;">Ninguno</span>'
                        }
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Wire up event listener for the shiny button toggle in the modal
    document.getElementById('modal-shiny-toggle').addEventListener('click', function() {
        const imgEl = document.getElementById('modal-pokemon-image');
        if (isShinyMode) {
            imgEl.src = currentPokemonData.normalImg;
            this.textContent = 'Ver Shiny';
            this.classList.remove('shiny-active');
            isShinyMode = false;
        } else {
            imgEl.src = currentPokemonData.shinyImg;
            this.textContent = 'Ver Normal';
            this.classList.add('shiny-active');
            isShinyMode = true;
        }
    });
    
    // Wire up event listener for switching tabs inside the modal
    const tabButtons = modalContent.querySelectorAll('.modal-tab-btn');
    const tabContents = modalContent.querySelectorAll('.modal-tab-content');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            tabButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            tabContents.forEach(c => {
                c.classList.remove('active');
                if (c.id === `tab-${targetTab}`) {
                    c.classList.add('active');
                }
            });
        });
    });
    
    // Hide loader and show content
    modalLoading.style.display = 'none';
    modalContent.style.display = 'flex';
    
    // Auto scroll top inside the modal body
    const modalBody = document.querySelector('.modal-body');
    if (modalBody) modalBody.scrollTop = 0;
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
                <img class="autocomplete-sprite" src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png" alt="${pokemon.name}">
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
    
    // Reset custom dropdown values
    selectCustomOption(1, '', 'Tipo principal...', '#e2e8f0', null);
    selectCustomOption(2, '', 'Ninguno', '#e2e8f0', null);
}