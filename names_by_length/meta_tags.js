function addMetaTags() {
    const head = document.head;

    const metaTags = [
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: "Dadagrams" },
        { name: "twitter:description", content: "A daily word puzzle against my dad" },
        { name: "twitter:image", content: "https://dadagrams.com/share.jpg" },
        { name: "twitter:image:alt", content: "Dadagrams twitter image" },
        { property: "og:type", content: "website" },
        { property: "og:url", content: "https://dadagrams.com" },
        { property: "og:title", content: "Dadagrams" },
        { property: "og:description", content: "A daily word puzzle against my dad" },
        { property: "og:image", content: "https://dadagrams.com/share.jpg" },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "628" }
    ];

    metaTags.forEach(tag => {
        const meta = document.createElement('meta');
        Object.keys(tag).forEach(attr => meta.setAttribute(attr, tag[attr]));
        head.appendChild(meta);
    });
}

document.addEventListener('DOMContentLoaded', addMetaTags);
