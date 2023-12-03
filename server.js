const express = require("express");
const app = express();
const cors = require('cors');
const axios = require('axios'); // Don't forget to require axios
const redis = require('redis');

const redisClient = redis.createClient();
const DEFAULT_EXPIRATION = 3600
app.use(cors());

app.get("/photos", async (req, res) => {
    const albumId = req.query.albumId;
    redisClient.get('photos', async (error, photos) => {
        if (error) {
            console.log(error);
        }

        if (photos != null) {
            console.log('cache hit')
            return res.json(JSON.parse(photos));
        } else {
            try {
                const { data } = await axios.get(
                    "https://jsonplaceholder.typicode.com/photos",
                    { params: { albumId } }
                );
                redisClient.setex("photos", DEFAULT_EXPIRATION, JSON.stringify(data));
                res.json(data);
            } catch (error) {
                console.error(error);
                res.status(500).json({ error: "Internal Server Error" });
            }
        }
        res.json(data);
    });
});

app.get("/photos/:id" , async(req , res) => {
    const {data} = await axios.get(
        `https://jsonplaceholder.typicode.com/photos/${req.params.id}`,
    )

    res.json(data);
})



const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});