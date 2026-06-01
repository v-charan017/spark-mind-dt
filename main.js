// 1. Canvas Particle Background
const canvas = document.getElementById('bg-canvas');
if (canvas) {
    const ctx = canvas.getContext('2d');
    let particles = [];

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 1;
            this.speedX = Math.random() * 1 - 0.5;
            this.speedY = Math.random() * 1 - 0.5;
        }
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            if (this.x > canvas.width) this.x = 0;
            if (this.x < 0) this.x = canvas.width;
            if (this.y > canvas.height) this.y = 0;
            if (this.y < 0) this.y = canvas.height;
        }
        draw() {
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const dx = this.x - centerX;
            const dy = this.y - centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY);
            
            // Opacity increases as distance from center increases (0.05 min, 0.3 max)
            const opacity = 0.05 + (distance / maxDistance) * 0.25;
            
            ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function init() {
        particles = [];
        for (let i = 0; i < 50; i++) particles.push(new Particle());
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        requestAnimationFrame(animate);
    }

    window.addEventListener('resize', resize);
    resize();
    init();
    animate();
}

// 2. Custom Cursor
const cursor = document.getElementById('cursor');
const follower = document.getElementById('cursor-follower');

if (cursor && follower) {
    window.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
        
        setTimeout(() => {
            follower.style.left = (e.clientX - 10) + 'px';
            follower.style.top = (e.clientY - 10) + 'px';
        }, 50);
    });

    const addCursorEvents = () => {
        document.querySelectorAll('a, button, .toggle-btn, .img-clickable').forEach(el => {
            el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
            el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
        });
    };
    addCursorEvents();
}

// 3. Header Scroll
window.addEventListener('scroll', () => {
    const header = document.getElementById('header');
    if (header) {
        if (window.scrollY > 50) header.classList.add('scrolled');
        else header.classList.remove('scrolled');
    }
});

// 4. Lightbox Logic
const lightbox = document.getElementById('lightbox');
const lbImg = document.getElementById('lightbox-img');
const lbClose = document.getElementById('lightbox-close');

if (lightbox && lbImg) {
    document.querySelectorAll('.img-clickable').forEach(img => {
        img.addEventListener('click', () => {
            lbImg.src = img.src;
            lightbox.style.display = 'flex';
            setTimeout(() => lightbox.classList.add('active'), 10);
            document.body.style.overflow = 'hidden';
        });
    });

    const closeLightbox = () => {
        lightbox.classList.remove('active');
        setTimeout(() => {
            lightbox.style.display = 'none';
            document.body.style.overflow = 'auto';
        }, 400);
    };

    if (lbClose) lbClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });
}

// 5. Custom Audio Players
const audioPlayers = document.querySelectorAll('.audio-player-container');
if (audioPlayers.length > 0) {
    audioPlayers.forEach(player => {
        const audio = player.querySelector('.native-audio');
        const playBtn = player.querySelector('.play-pause-btn');
        const playIcon = playBtn.querySelector('i');
        const progressSlider = player.querySelector('.progress-slider');
        const currentTimeLabel = player.querySelector('.current-time');
        const durationLabel = player.querySelector('.duration');
        const volumeBtn = player.querySelector('.volume-btn');
        const volumeIcon = volumeBtn.querySelector('i');
        const volumeSlider = player.querySelector('.volume-slider');

        let lastVolume = 0.8;

        // Helper to format time (seconds -> M:SS)
        function formatTime(secs) {
            if (isNaN(secs)) return '0:00';
            const minutes = Math.floor(secs / 60);
            const seconds = Math.floor(secs % 60);
            const returnedSeconds = seconds < 10 ? `0${seconds}` : `${seconds}`;
            return `${minutes}:${returnedSeconds}`;
        }

        // Set duration text when metadata loads
        function setDuration() {
            durationLabel.textContent = formatTime(audio.duration);
        }

        if (audio.readyState >= 1) {
            setDuration();
        } else {
            audio.addEventListener('loadedmetadata', setDuration);
        }

        // Play / Pause Toggle
        playBtn.addEventListener('click', () => {
            if (audio.paused) {
                // Pause all other audio players first (exclusive playback)
                document.querySelectorAll('.native-audio').forEach(otherAudio => {
                    if (otherAudio !== audio) {
                        otherAudio.pause();
                        const otherPlayer = otherAudio.closest('.audio-player-container');
                        if (otherPlayer) {
                            const otherIcon = otherPlayer.querySelector('.play-pause-btn i');
                            if (otherIcon) {
                                otherIcon.className = 'fas fa-play';
                            }
                        }
                    }
                });

                audio.play();
                playIcon.className = 'fas fa-pause';
            } else {
                audio.pause();
                playIcon.className = 'fas fa-play';
            }
        });

        // Time Update (Sync progress bar and timer)
        audio.addEventListener('timeupdate', () => {
            if (audio.duration) {
                const percentage = (audio.currentTime / audio.duration) * 100;
                progressSlider.value = percentage;
                currentTimeLabel.textContent = formatTime(audio.currentTime);
            }
        });

        // Dragging/Scrubbing progress slider
        progressSlider.addEventListener('input', () => {
            if (audio.duration) {
                const newTime = (progressSlider.value / 100) * audio.duration;
                audio.currentTime = newTime;
                currentTimeLabel.textContent = formatTime(newTime);
            }
        });

        // Volume control slider
        volumeSlider.addEventListener('input', () => {
            audio.volume = volumeSlider.value;
            audio.muted = false;
            updateVolumeIcon(volumeSlider.value);
        });

        // Mute / Unmute toggle button
        volumeBtn.addEventListener('click', () => {
            if (audio.muted) {
                audio.muted = false;
                audio.volume = lastVolume;
                volumeSlider.value = lastVolume;
                updateVolumeIcon(lastVolume);
            } else {
                lastVolume = audio.volume > 0 ? audio.volume : 0.8;
                audio.muted = true;
                audio.volume = 0;
                volumeSlider.value = 0;
                volumeIcon.className = 'fas fa-volume-mute';
            }
        });

        function updateVolumeIcon(vol) {
            if (vol == 0) {
                volumeIcon.className = 'fas fa-volume-mute';
            } else if (vol < 0.5) {
                volumeIcon.className = 'fas fa-volume-down';
            } else {
                volumeIcon.className = 'fas fa-volume-up';
            }
        }

        // Reset player state when audio ends
        audio.addEventListener('ended', () => {
            playIcon.className = 'fas fa-play';
            progressSlider.value = 0;
            currentTimeLabel.textContent = '0:00';
        });
    });

    // Custom cursor hover listeners specifically for these players
    const mainCursor = document.getElementById('cursor');
    if (mainCursor) {
        document.querySelectorAll('.play-pause-btn, .volume-btn, .audio-slider').forEach(el => {
            el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
            el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
        });
    }
}
