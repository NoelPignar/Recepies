const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');

const app = express();

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose.connect("mongodb+srv://noelpignar:noel.P07@node.ybbxtpc.mongodb.net/receptiDB")
    .then(() => console.log("MongoDB connected!"))
    .catch(err => console.error("MongoDB error:", err));

const recipeSchema = new mongoose.Schema({
    title: String,
    description: String,
    ingredients: [String],
    instructions: [String],
    imageUrl: { type: String, default: "https://via.placeholder.com/300x180?text=No+Image" },
    ratings: { type: [Number], default: [] },
    createdAt: { type: Date, default: Date.now }
});

const Recipe = mongoose.model("Recipe", recipeSchema);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'Recepti - frontend.html'));
});

app.get('/api/recipes', async (req, res) => {
    const recipes = await Recipe.find();
    res.json(recipes);
});

app.post('/api/recipes', async (req, res) => {
    try {
        const recipe = new Recipe(req.body);
        await recipe.save();
        res.status(201).json(recipe);
    } catch (err) {
        console.error("Napaka pri dodajanju:", err);
        res.status(400).json({ error: err.message });
    }
});

app.delete('/api/recipes/:id', async (req, res) => {
    try {
        await Recipe.findByIdAndDelete(req.params.id);
        res.json({ message: "Recept izbrisan." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/recipes/:id/rate', async (req, res) => {
    try {
        const { rating } = req.body;
        if (rating < 1 || rating > 5) {
            return res.status(400).json({ error: "Ocena mora biti med 1 in 5." });
        }
        const recipe = await Recipe.findById(req.params.id);
        if (!recipe) return res.status(404).json({ error: "Recept ni najden." });

        recipe.ratings.push(rating);
        await recipe.save();
        res.json(recipe);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/Recepti - frontend.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'Recepti - frontend.html'));
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});