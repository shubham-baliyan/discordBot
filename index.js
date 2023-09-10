const { Client, GatewayIntentBits } = require("discord.js");
const axios = require("axios");
// const env =require('dotenv')
const fs = require("fs");
require("dotenv").config();
const TOKEN = process.env.TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;
const DATA_SERVER_URL = process.env.DATA_SERVER_URL;
const INTERVAL_TIME = 60000; // 1 minute in milliseconds
const DATA_FILE = "data.json";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once("ready", () => {
  console.log("Bot is ready!");

  // Fetch data and send to channel at specified intervals
  //   setInterval(async () => {
  //     try {
  //       const data = await fetchData();
  //       const channel = client.channels.cache.get(CHANNEL_ID);
  //       if (channel) {
  //         channel.send(data);
  //       }
  //     } catch (error) {
  //       console.error("Error fetching data:", error);
  //     }
  //   }, INTERVAL_TIME);
});

client.on("messageCreate", async (message) => {
  const content = message.content.toLowerCase();

  if (content.startsWith("!setdata ")) {
    const dataToRemember = content.replace("!setdata ", "");
    fs.writeFileSync(DATA_FILE, JSON.stringify({ data: dataToRemember }));
    message.channel.send("Data saved!");
  } else if (content === "!getdata") {
    if (fs.existsSync(DATA_FILE)) {
      const savedData = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
      message.channel.send(`Remembered data: ${savedData.data}`);
    } else {
      message.channel.send("No data saved yet.");
    }
  }
  if (message.content.toLowerCase() === "!fetchdata") {
    try {
      const data = await fetchData();
      const savedData = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));

      let anotherReading = data.filter((item) =>
        savedData.sensor.includes(parseInt(item.properties.station_ref))
      );
      anotherReading = anotherReading.filter(
        (item) => item.properties.sensor_ref === "0001"
      );
      if (anotherReading.length) {
        anotherReading.map((item) => {
          message.channel.send(
            `Duffy says the reading for ${item.properties.station_ref}-${item.properties.station_name} is ${item.properties.value}`
          );
        });
      } else message.channel.send(`Coundn't find it duffy`);
    } catch (error) {
      console.error("Error fetching data:", error);
      message.channel.send("Failed to fetch data.");
    }
  }
});

async function fetchData() {
  const response = await axios.get(DATA_SERVER_URL);
  return response.data.features; // Assuming the data is a string. Modify as per your needs.
}

client.login(TOKEN);
