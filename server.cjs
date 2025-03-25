const express = require('express');
const cors = require('cors');
const Indicators = require('technicalindicators');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'views')));

// Serve the HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Indicator periods
const RSI_PERIOD_4 = 4;
const RSI_PERIOD_6 = 6;
let closePrices = [];
let indicatorValues = {};

// Calculate indicators
function calculateIndicators() {
    if (closePrices.length >= RSI_PERIOD_6) {
        indicatorValues = {
            RSI_4: Indicators.RSI.calculate({ period: RSI_PERIOD_4, values: closePrices }).slice(-1)[0] || "N/A",
            RSI_6: Indicators.RSI.calculate({ period: RSI_PERIOD_6, values: closePrices }).slice(-1)[0] || "N/A",
        };
    }
}

// API endpoint to receive OHLC data
app.post('/indicators', (req, res) => {
    const { close } = req.body;

    if (!close) {
        return res.status(400).json({ error: 'Missing close price data' });
    }

    closePrices.push(close);
    if (closePrices.length > 100) closePrices.shift();

    calculateIndicators();
    res.json({ indicatorValues });
});

// Endpoint to get the latest indicator values
app.get('/indicators', (req, res) => {
    res.json({ indicatorValues });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
