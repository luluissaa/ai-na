// Audio context for generating musical notes
let audioContext;
let carouselData = [];
const notes = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25]; // C4 to C5

function initAudio() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
}

function playRandomNote() {
    initAudio();
    
    const frequency = notes[Math.floor(Math.random() * notes.length)];
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
}

// Carousel functionality
let currentSlide = 0;
let slides = [];

function createSlide(item, index) {
    return `
        <div class="carousel-slide ${index === 0 ? 'active' : ''}">
            <div class="slide-content">
                <h1 class="musical-element">${item.title}</h1>
                <h2 class="musical-element">${item.category}</h2>
                <p class="collaborator musical-element">${item.collaborator}</p>
                <p class="description musical-element">${item.description}</p>
            </div>
                 <img src="${item.image}" alt="${item.title}" class="slide-image musical-element">

        </div>
    `;
}

function createNavigation() {
    return carouselData.map((_, index) => 
        `<div class="nav-dot ${index === 0 ? 'active' : ''}" data-slide="${index}"></div>`
    ).join('');
}

function updateSlide(newIndex) {
    const slides = document.querySelectorAll('.carousel-slide');
    const dots = document.querySelectorAll('.nav-dot');
    
    slides[currentSlide].classList.remove('active');
    dots[currentSlide].classList.remove('active');
    
    currentSlide = newIndex;
    
    slides[currentSlide].classList.add('active');
    dots[currentSlide].classList.add('active');
}

function nextSlide() {
    const nextIndex = (currentSlide + 1) % carouselData.length;
    updateSlide(nextIndex);
}

function prevSlide() {
    const prevIndex = currentSlide === 0 ? carouselData.length - 1 : currentSlide - 1;
    updateSlide(prevIndex);
}

// Load data from JSON file
async function loadData() {
    console.log('Attempting to load data.json...');
    try {
        const response = await fetch('data.json');
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        carouselData = await response.json();
        console.log('Data loaded successfully:', carouselData);
        initCarousel();
    } catch (error) {
        console.error('Error loading data:', error);
        console.log('Using fallback data instead');
        
        // Fallback to sample data if JSON fails to load
        carouselData = [
            {
                image: "./images/trickglass-1.JPG",
                title: "Resonance (Fallback)",
                category: "vessel",
                collaborator: "Garden of Magic",
                description: "Shiney trick vessels"
            },
            {
                image: "./images/trickglass-1.JPG",
                title: "Goblin Rings Compositions (Fallback)",
                category: "ring",
                collaborator: "Goblin Market",
                description: "Stripped down to essence, these compositions find beauty in restraint and purposeful emptiness."
            }
        ];
        initCarousel();
    }
}

// Initialize the carousel
function initCarousel() {
    const carousel = document.getElementById('carousel');
    const navigation = document.getElementById('navigation');
    
    // Populate slides
    carousel.innerHTML = carouselData.map((item, index) => createSlide(item, index)).join('');
    
    // Populate navigation
    navigation.innerHTML = createNavigation();
    
    // Add event listeners
    document.getElementById('nextBtn').addEventListener('click', nextSlide);
    document.getElementById('prevBtn').addEventListener('click', prevSlide);
    
    // Navigation dots
    document.querySelectorAll('.nav-dot').forEach((dot, index) => {
        dot.addEventListener('click', () => updateSlide(index));
    });
    
    // Musical elements
    document.querySelectorAll('.musical-element').forEach(element => {
        element.addEventListener('pointerdown', playRandomNote);
    });
    
    // Auto-advance carousel
    setInterval(nextSlide, 5000);
    
    // Show content
    document.getElementById('loading').style.display = 'none';
    document.getElementById('container').style.display = 'block';
}

// Start the application
document.addEventListener('DOMContentLoaded', loadData);

// Enable audio context on user interaction
document.addEventListener('DOMContentLoaded', initAudio, { once: true });