//Uvoz potrebnih knjižnic
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const app = express();

//Nastavitev CORS headerjev
//Omogoča dostop API-ja iz vseh domen (frontend lahko teče drugje)
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

//Middleware za branje JSON in form podatkov v POST zahtevah
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Povezava z MongoDB
mongoose.connect("mongodb+srv://noelpignar:noel.P07@node.ybbxtpc.mongodb.net/receptiDB")
    .then(() => console.log("MongoDB connected!"))
    .catch(err => console.error("MongoDB error:", err));

//Model za recepte

const recipeSchema = new mongoose.Schema({
    title: String,              //Naslov 
    description: String,        //Opis 
    ingredients: [String],      //Sestavine
    instructions: [String],     //Navodila
    imageUrl: { 
        type: String, 
        default: "https://via.placeholder.com/300x180?text=No+Image" 
    },                          //Slika recepta
    ratings: { 
        type: [Number], 
        default: [] 
    },                          //Shranjene ocene (1–5)
    createdAt: { 
        type: Date, 
        default: Date.now 
    }                           //Datum
});

//Mongoose model
const Recipe = mongoose.model("Recipe", recipeSchema);

//HTML frontend stran
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'Recepti - frontend.html'));
});

//Vrne recepte iz baze
app.get('/api/recipes', async (req, res) => {
    const recipes = await Recipe.find(); //Prebere recepte iz baze
    res.json(recipes);
});

//Doda nov recept
app.post('/api/recipes', async (req, res) => {
    try {
        const recipe = new Recipe(req.body); //Ustvari nov dokument
        await recipe.save();                 //Shrani v MongoDB
        res.status(201).json(recipe);        //Vrne ustvarjen recept
    } catch (err) {
        console.error("Napaka pri dodajanju:", err);
        res.status(400).json({ error: err.message });
    }
});

//Izbriše recept glede na ID
app.delete('/api/recipes/:id', async (req, res) => {
    try {
        await Recipe.findByIdAndDelete(req.params.id); // Izbriše recept
        res.json({ message: "Recept izbrisan." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

//Doda oceno (1–5)
app.post('/api/recipes/:id/rate', async (req, res) => {
    try {
        const { rating } = req.body;

        //Preverjanje veljavnost ocene
        if (rating < 1 || rating > 5) {
            return res.status(400).json({ error: "Ocena mora biti med 1 in 5." });
        }

        const recipe = await Recipe.findById(req.params.id); //Iskanje recepta
        if (!recipe) return res.status(404).json({ error: "Recept ni najden." });

        recipe.ratings.push(rating); //Doda oceno
        await recipe.save();         //Shrani spremembo

        res.json(recipe);            //Vrne posodobljen recept
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

//Nadomestna pot za HTML
app.get('/Recepti - frontend.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'Recepti - frontend.html'));
});

// Zagon strežnika
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
