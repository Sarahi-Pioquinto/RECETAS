self.addEventListener('install', event => {
    event.waitUntil(
        caches.open('recipe-cache').then(cache => {
            return cache.addAll([
                '/',
                '/index.html',
                '/style.css',
                '/app.js',
                'manifest.json',
                '/icons/disco.png',
                '/icons/hogar.png'

            ]);
        })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});
