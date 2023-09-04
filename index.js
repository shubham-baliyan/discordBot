const { Client, GatewayIntentBits, Message } = require("discord.js");
const axios = require("axios");
const fs = require("fs");

const TOKEN =
  "MTE0ODMxNzQzNDYzODUxMjM0Mw.Gpn2mh.YCJmDJx1m333PasmEDqeKueWoyiA7Qp8Iif2fs";
const CHANNEL_ID =
  "https://discord.com/channels/1148316594271957032/1148347327006904462";
const DATA_SERVER_URL = "http://waterlevel.ie/geojson/latest/";
const INTERVAL_TIME = 60000; // 1 minute in milliseconds
const DATA_FILE = "data.json";

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
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
  console.log("message create", message);

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
      let theReadingTosend = data.find(
        (item) => item.properties.station_ref === savedData.sensor
      );

      message.channel.send(theReadingTosend.properties);
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
