require('dotenv').config();
const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 3000;

app.use(express.static('public'));

const GNEWS_API_URL = 'https://gnews.io/api/v4';
const GNEWS_API_KEY = process.env.GNEWS_API_KEY;

// Corrected fetchNews function to be reusable for any category
const fetchNews = async (topic, lang = 'en') => {
    try {
        const response = await axios.get(`${GNEWS_API_URL}/search`, {
            params: {
                q: topic,
                token: GNEWS_API_KEY,
                lang: lang,
                country: lang === 'en' ? 'us' : 'de',
                max: 5, // Fetch multiple articles
                image: 'required' // Ensure that the news has an image
            }
        });

        if (response.data.articles && response.data.articles.length > 0) {
            return response.data.articles.map(article => ({
                title: article.title,
                snippet: article.description || "", // Use description as snippet
                url: article.url,
                image: article.image
            }));
        }
        return [];
    } catch (error) {
        console.error('Error fetching news:', error.response ? error.response.data : error.message);
        return []; // Return an empty array to signify no news was found
    }
};

// Unified endpoint to get news snippets based on category
app.get('/api/news/:category', async (req, res) => {
    const { category } = req.params;
    const newsSnippets = await fetchNews(category);
    if (newsSnippets.length > 0) {
        res.json(newsSnippets);
    } else {
        res.json([{ title: `No ${category} news found`, snippet: '', url: '', image: '' }]);
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
