require("dotenv").config();
const morgan = require("morgan");
const express = require("express");
const fetch = require("node-fetch");
const app = express();
const mysql = require("mysql2");
const { database } = require("./keys");
const PUERTO = 4800;

app.use(morgan("dev"));

app.get("/", (req, res) => {
    const conexion = mysql.createConnection({
        host: database.host,
        user: database.user,
        password: database.password,
        port: database.port,
        database: database.db
    });
    var sql = `DELETE FROM ${process.env.TABLE_MARKET}`;
    var sql2 = `ALTER TABLE ${process.env.TABLE_MARKET} AUTO_INCREMENT=1`
    var sql3 = `SELECT name FROM ${process.env.TABLE_CRIPTO}`;
    conexion.query(sql, async (err, resultado) => {
        if(err) {
            console.error(err);
        }
    });
    conexion.query(sql2, async (err, resultado) => {
        if(err) {
            console.error(err);
        }
    });
    conexion.query(sql3, async (err, resultado) => {
        if(err) {
            console.error(err);
        } else {
            await obtenerDatosApi(resultado);
            await finalizarEjecucion();
        }
    });

    async function obtenerDatosApi(resultado) {
        for (let i = 0; i < resultado.length; i++) {
            const cripto = resultado[i].name;
            try {
                const response = await fetch(`https://api.coingecko.com/api/v3/coins/${cripto}`)
                .then(res => {
                    return res.json();
                })
                .then(json => {
                    return json;
                })
                .catch((err) => {
                    console.error(err);
                })
                await guardarDatos(response);
            } catch (error) {
                console.error(error);
            }
        };
    };

    async function guardarDatos(market) {
        var arreglo = [];
        var coinId = market.id;
        var symbol = market.symbol;
        var name = market.name;
        if (!market.description.en) {
            var descriptionEN = "";
        } else {
            var descriptionEN = market.description.en;
        }
        if (!market.description.es) {
            var descriptionES = "";
        } else {
            var descriptionES = market.description.es;
        }
        for (let i = 0; i < market.links.homepage.length; i++) {
            const element = market.links.homepage[i];
            if (!element) {
                market.links.homepage.splice(i, 1);
                i = i - 1;
            }
        }
        for (let i = 0; i < market.links.blockchain_site.length; i++) {
            const element = market.links.blockchain_site[i];
            if (!element) {
                market.links.blockchain_site.splice(i, 1);
                i = i - 1;
            }
        }
        var linksHomepage = market.links.homepage.join(", ");
        var linksBlockchain = market.links.blockchain_site.join(", ");
        var linksTwitter = market.links.twitter_screen_name;
        var imageThumb = market.image.thumb;
        var imageSmall = market.image.small;
        var imageLarge = market.image.large;
        var sentimentVotesUpPercentage = market.sentiment_votes_up_percentage;
        var sentimentVotesDownPercentage = market.sentiment_votes_down_percentage;
        var coingeckoRank = market.coingecko_rank;
        var coingeckoScore = market.coingecko_score;
        var developerScore = market.developer_score;
        var communityScore = market.community_score;
        var liquidityScore = market.liquidity_score;
        var publicInterestScore = market.public_interest_score;
        var athChangePercentage = market.market_data.ath_change_percentage.usd;
        var athDate = market.market_data.ath_date.usd;
        var marketCap = market.market_data.market_cap.usd;
        var marketCapRank = market.market_data.market_cap_rank;
        var totalVolume = market.market_data.total_volume.usd;
        var priceChangePercentage24h = market.market_data.price_change_percentage_24h;
        var priceChangePercentage7d = market.market_data.price_change_percentage_7d;
        var priceChangePercentage30d = market.market_data.price_change_percentage_30d;
        var priceChangePercentage200d = market.market_data.price_change_percentage_200d;
        var priceChangePercentage1y = market.market_data.price_change_percentage_1y;
        var totalSupply = market.market_data.total_supply;
        var maxSupply = market.market_data.max_supply;
        var circulatingSupply = market.market_data.circulating_supply;
        var lastUpdated = market.market_data.last_updated;
        var twitterFollowers = market.community_data.twitter_followers;
        for (let i = 0; i < market.tickers.length; i++) {
            const element = market.tickers[i];
            if (element.base == symbol.toUpperCase() && (element.target == "USD" || element.target == "USDT")) {
                arreglo.push([
                    coinId,
                    symbol,
                    name,
                    descriptionEN,
                    descriptionES,
                    linksHomepage,
                    linksBlockchain,
                    linksTwitter,
                    imageThumb,
                    imageSmall,
                    imageLarge,
                    sentimentVotesUpPercentage,
                    sentimentVotesDownPercentage,
                    coingeckoRank,
                    coingeckoScore,
                    developerScore,
                    communityScore,
                    liquidityScore,
                    publicInterestScore,
                    athChangePercentage,
                    athDate,
                    marketCap,
                    marketCapRank,
                    totalVolume,
                    priceChangePercentage24h,
                    priceChangePercentage7d,
                    priceChangePercentage30d,
                    priceChangePercentage200d,
                    priceChangePercentage1y,
                    totalSupply,
                    maxSupply,
                    circulatingSupply,
                    lastUpdated,
                    twitterFollowers,
                    element.base,
                    element.target,
                    element.market.name,
                    element.volume,
                    element.converted_volume.usd,
                    element.trust_score,
                    element.trade_url,
                    element.token_info_url
                ]);
            }
        }
        var sql4 = `INSERT INTO ${process.env.TABLE_MARKET} (
                    coin_id,
                    symbol,
                    name,
                    description_en,
                    description_es,
                    homepage,
                    blockchain_site,
                    twitter_screenname,
                    image_thumb,
                    image_small,
                    image_large,
                    sentiment_votes_up_percentage,
                    sentiment_votes_down_percentage,
                    coingecko_rank,
                    coingecko_score,
                    developer_score,
                    community_score,
                    liquidity_score,
                    public_interest_score,
                    ath_change_percentage,
                    ath_date,
                    market_cap,
                    market_cap_rank,
                    total_volume,
                    price_change_percentage_24h,
                    price_change_percentage_7d,
                    price_change_percentage_30d,
                    price_change_percentage_200d,
                    price_change_percentage_1y,
                    total_supply,
                    max_supply,
                    circulating_supply,
                    last_updated,
                    twitter_followers,
                    base,
                    target,
                    market_name,
                    volume,
                    converted_volume,
                    trust_score,
                    trade_url,
                    token_info_url
        ) VALUES ?`;
        conexion.query(sql4, [arreglo], function (err, resultado) {
            if(err) {
                console.error(err);
            } else {
                console.log(resultado);
            }
        });
    }

    async function finalizarEjecucion() {
        conexion.end();
        res.status(200).send({
            status: 200,
            message: "All OK"
        });
    };

});

app.listen(process.env.PORT || PUERTO , () => {
    console.log(`Escuchando en el puerto: ${process.env.PORT || PUERTO}`);
})