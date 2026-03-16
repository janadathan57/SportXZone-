// script.js – SportXzone with live scores and news (ESPN API)

// ==================== SPORT CONFIGURATION ====================
// Helper: convert camelCase to kebab-case (e.g., "carRacing" → "car-racing")
function toKebabCase(str) {
    return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}
const sportConfig = {
    cricket: {
        sport: 'cricket',
        league: null,
        name: 'Cricket',
        hasScoreboard: false  // cricket scoreboard not directly available via ESPN API (but we'll mock)
    },
    football: {
        sport: 'football',
        league: 'nfl',
        name: 'Football'
    },
    baseball: {
        sport: 'baseball',
        league: 'mlb',
        name: 'Baseball'
    },
    carRacing: {
        sport: 'racing',
        league: 'nascar',
        name: 'Car Racing'
    },
    bikeRacing: {
        sport: 'racing',
        league: 'moto',
        name: 'Bike Racing'
    },
    volleyball: {
        sport: 'volleyball',
        league: null,
        name: 'Volleyball'
    },
    basketball: {
        sport: 'basketball',
        league: 'nba',
        name: 'Basketball'
    },
    hockey: {
        sport: 'hockey',
        league: 'nhl',
        name: 'Hockey'
    }
};

// Base URL for ESPN API
const ESPN_BASE = 'https://site.api.espn.com/apis/site/v2/sports';

// ==================== FETCH SCORES ====================
async function fetchScores(sportKey) {
    const config = sportConfig[sportKey];
    let url;
    
    if (config.league) {
        url = `${ESPN_BASE}/${config.sport}/${config.league}/scoreboard`;
    } else {
        url = `${ESPN_BASE}/${config.sport}/scoreboard`;
    }
    
    try {
        console.log(`Fetching scores for ${config.name}:`, url);
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        
        if (data.events && data.events.length > 0) {
            return data.events.map(event => {
                const competition = event.competitions[0];
                const competitors = competition.competitors;
                const home = competitors.find(c => c.homeAway === 'home') || competitors[0];
                const away = competitors.find(c => c.homeAway === 'away') || competitors[1];
                return {
                    id: event.id,
                    name: event.name,
                    shortName: event.shortName,
                    homeTeam: home.team.displayName,
                    awayTeam: away.team.displayName,
                    homeScore: home.score?.displayValue || '0',
                    awayScore: away.score?.displayValue || '0',
                    status: competition.status.type.description,
                    date: new Date(event.date).toLocaleString()
                };
            });
        } else {
            return []; // no games
        }
    } catch (error) {
        console.warn(`Could not fetch scores for ${config.name}:`, error);
        return []; // fallback to empty, we'll use mock if needed
    }
}

// ==================== FETCH NEWS ====================
async function fetchNews(sportKey) {
    const config = sportConfig[sportKey];
    let url;
    
    if (config.league) {
        url = `${ESPN_BASE}/${config.sport}/${config.league}/news?limit=3`;
    } else {
        url = `${ESPN_BASE}/${config.sport}/news?limit=3`;
    }
    
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        
        if (data.articles && data.articles.length > 0) {
            return data.articles.map(article => ({
                title: article.headline,
                description: article.description,
                image: article.images?.[0]?.url || 'https://via.placeholder.com/300x180?text=Sports+News',
                url: article.links?.web?.href || '#'
            }));
        } else {
            return getMockNews(sportKey);
        }
    } catch (error) {
        console.warn(`News fetch failed for ${config.name}, using mock.`, error);
        return getMockNews(sportKey);
    }
}

// ==================== MOCK DATA (FALLBACK) ====================
function getMockNews(sportKey) {
    const mockNews = {
        cricket: [
            { title: "India vs Australia: 3rd Test Highlights", description: "India wins by 6 wickets, takes series lead.", image: "https://via.placeholder.com/300x180?text=Cricket+1", url: "#" },
            { title: "IPL 2025: Auction Results", description: "Big buys and surprise picks.", image: "https://via.placeholder.com/300x180?text=IPL+Auction", url: "#" },
            { title: "England's Test Tour of Pakistan", description: "Schedule announced.", image: "https://via.placeholder.com/300x180?text=ENG+in+PAK", url: "#" }
        ],
        football: [
            { title: "Champions League Quarter-Finals Set", description: "Real Madrid to face Manchester City.", image: "https://via.placeholder.com/300x180?text=UCL", url: "#" },
            { title: "Premier League: Title Race Heats Up", description: "Liverpool, Arsenal, City all within 3 points.", image: "https://via.placeholder.com/300x180?text=EPL", url: "#" },
            { title: "Transfer Window Latest", description: "Top clubs eyeing summer signings.", image: "https://via.placeholder.com/300x180?text=Transfers", url: "#" }
        ],
        baseball: [
            { title: "MLB Opening Day 2025", description: "All 30 teams in action.", image: "https://via.placeholder.com/300x180?text=MLB", url: "#" },
            { title: "Dodgers vs Yankees: World Series Rematch?", description: "Early season showdown.", image: "https://via.placeholder.com/300x180?text=Dodgers+Yankees", url: "#" },
            { title: "Top 10 Prospects to Watch", description: "Future stars.", image: "https://via.placeholder.com/300x180?text=Prospects", url: "#" }
        ],
        carRacing: [
            { title: "Formula 1: Monaco GP Preview", description: "Verstappen vs Hamilton.", image: "https://via.placeholder.com/300x180?text=F1+Monaco", url: "#" },
            { title: "Le Mans 24h: Toyota aims for 5th straight win", description: "Hypercar battle.", image: "https://via.placeholder.com/300x180?text=Le+Mans", url: "#" },
            { title: "NASCAR: Daytona 500 Highlights", description: "Last lap drama!", image: "https://via.placeholder.com/300x180?text=Daytona+500", url: "#" }
        ],
        bikeRacing: [
            { title: "MotoGP: Rossi's Return?", description: "Rumours swirl about comeback.", image: "https://via.placeholder.com/300x180?text=MotoGP", url: "#" },
            { title: "Isle of Man TT 2025", description: "Peter Hickman sets new lap record.", image: "https://via.placeholder.com/300x180?text=Isle+of+Man", url: "#" },
            { title: "World Superbike: Toprak vs Bautista", description: "Season opener results.", image: "https://via.placeholder.com/300x180?text=WSBK", url: "#" }
        ],
        volleyball: [
            { title: "FIVB Nations League 2025", description: "Brazil, USA, Poland top rankings.", image: "https://via.placeholder.com/300x180?text=FIVB", url: "#" },
            { title: "NCAA Volleyball Championship", description: "Stanford wins title.", image: "https://via.placeholder.com/300x180?text=NCAA", url: "#" },
            { title: "Beach Volleyball: World Tour Update", description: "Norwegian duo dominates.", image: "https://via.placeholder.com/300x180?text=Beach+VB", url: "#" }
        ],
        basketball: [
            { title: "NBA Playoffs: Lakers Advance", description: "LeBron scores 30.", image: "https://via.placeholder.com/300x180?text=NBA", url: "#" },
            { title: "EuroLeague Final Four Set", description: "Real Madrid, Olympiacos, Monaco, Fenerbahçe.", image: "https://via.placeholder.com/300x180?text=EuroLeague", url: "#" },
            { title: "College Basketball: March Madness", description: "UConn repeats as champions.", image: "https://via.placeholder.com/300x180?text=March+Madness", url: "#" }
        ],
        hockey: [
            { title: "NHL Stanley Cup Playoffs", description: "Bruins, Avalanche, Oilers advance.", image: "https://via.placeholder.com/300x180?text=NHL", url: "#" },
            { title: "IIHF World Championship 2025", description: "Canada vs Finland in final.", image: "https://via.placeholder.com/300x180?text=IIHF", url: "#" },
            { title: "Field Hockey: Pro League Updates", description: "Netherlands, Belgium, Australia wins.", image: "https://via.placeholder.com/300x180?text=Field+Hockey", url: "#" }
        ]
    };
    return mockNews[sportKey] || mockNews.football;
}

function getMockScores(sportKey) {
    // Return a few mock games for each sport
    const mockScores = {
        cricket: [
            { homeTeam: "India", awayTeam: "Australia", homeScore: "289/8", awayScore: "245", status: "Live" },
            { homeTeam: "England", awayTeam: "Pakistan", homeScore: "", awayScore: "", status: "Today 10:30" }
        ],
        football: [
            { homeTeam: "Manchester United", awayTeam: "Arsenal", homeScore: "1", awayScore: "1", status: "In Progress" },
            { homeTeam: "Liverpool", awayTeam: "Chelsea", homeScore: "", awayScore: "", status: "17:30" }
        ],
        baseball: [
            { homeTeam: "Yankees", awayTeam: "Red Sox", homeScore: "3", awayScore: "2", status: "7th Inning" },
            { homeTeam: "Dodgers", awayTeam: "Giants", homeScore: "", awayScore: "", status: "Scheduled" }
        ],
        carRacing: [
            { name: "Monaco GP", status: "Final", winner: "Verstappen" },
            { name: "NASCAR Atlanta", status: "In Progress" }
        ],
        bikeRacing: [
            { name: "MotoGP Mugello", status: "Qualifying" },
            { name: "WSBK Catalunya", status: "Race 1" }
        ],
        volleyball: [
            { homeTeam: "Brazil", awayTeam: "USA", homeScore: "2", awayScore: "1", status: "Live" },
            { homeTeam: "Poland", awayTeam: "France", homeScore: "", awayScore: "", status: "19:00" }
        ],
        basketball: [
            { homeTeam: "Lakers", awayTeam: "Warriors", homeScore: "102", awayScore: "98", status: "4th Qtr" },
            { homeTeam: "Celtics", awayTeam: "Bucks", homeScore: "", awayScore: "", status: "Tomorrow" }
        ],
        hockey: [
            { homeTeam: "Bruins", awayTeam: "Maple Leafs", homeScore: "3", awayScore: "2", status: "3rd Period" },
            { homeTeam: "Oilers", awayTeam: "Canucks", homeScore: "", awayScore: "", status: "Scheduled" }
        ]
    };
    return mockScores[sportKey] || [];
}

// ==================== RENDER SCORES ====================
function renderScores(sportId, games) {
    const container = document.getElementById(sportId);
    if (!container) return;
    
    container.innerHTML = '';
    
    if (!games || games.length === 0) {
        container.innerHTML = '<div class="score-item">No live matches today</div>';
        return;
    }
    
    games.forEach(game => {
        const div = document.createElement('div');
        div.className = 'score-item';
        
        // Different sports may have different structures (racing uses event name, others use teams)
        if (game.name && !game.homeTeam) {
            // Racing style
            div.innerHTML = `
                <div class="teams">${game.name}</div>
                <div class="status">${game.status}</div>
                ${game.winner ? `<div class="score">Winner: ${game.winner}</div>` : ''}
            `;
        } else {
            // Team sports
            div.innerHTML = `
                <div class="teams">${game.homeTeam} vs ${game.awayTeam}</div>
                <div class="score">${game.homeScore} - ${game.awayScore}</div>
                <div class="status">${game.status}</div>
            `;
        }
        container.appendChild(div);
    });
}

// ==================== RENDER NEWS ====================
function renderNews(sportId, articles) {
    const container = document.getElementById(sportId);
    if (!container) return;
    
    container.innerHTML = '';
    
    articles.forEach(article => {
        const col = document.createElement('div');
        col.className = 'col';
        col.innerHTML = `
            <div class="card h-100">
                <img src="${article.image}" class="card-img-top" alt="${article.title}" onerror="this.src='https://via.placeholder.com/300x180?text=Image+Unavailable'">
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title">${article.title}</h5>
                    <p class="card-text flex-grow-1">${article.description}</p>
                    <a href="${article.url}" target="_blank" class="btn btn-primary mt-2">Read more</a>
                </div>
            </div>
        `;
        container.appendChild(col);
    });
}

// ==================== LOAD EVERYTHING ====================
async function loadAllSports() {
    // For each sport, fetch scores and news concurrently
    const sports = ['cricket', 'football', 'baseball', 'carRacing', 'bikeRacing', 'volleyball', 'basketball', 'hockey'];
    
    for (const sport of sports) {
        // Fetch both scores and news
        const [scores, news] = await Promise.all([
            fetchScores(sport).catch(() => getMockScores(sport)),
            fetchNews(sport).catch(() => getMockNews(sport))
        ]);
        
        // Render scores (if we got empty array from API, use mock)
        const scoresToRender = scores.length ? scores : getMockScores(sport);
        const sportId = toKebabCase(sport); // converts "carRacing" → "car-racing"
renderScores(`${sportId}-scores`, scoresToRender);
renderNews(`${sportId}-news`, news);
console.log(`${sport} scores:`, scores, "Using mock:", scoresToRender === getMockScores(sport));
console.log(`${sport} news:`, news, "Using mock:", news === getMockNews(sport));
    }
}

// ==================== START ====================
document.addEventListener('DOMContentLoaded', loadAllSports);