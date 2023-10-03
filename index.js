const ethers = require("ethers");
const request = require("request");
const fs = require("fs");
const axios = require("axios");

// Telegram bot token and group chat ID
const telegramBotToken = "6669240832:AAGHn5XojNpWJ7-mBogq8hfYwdSG96k9mpU";
const telegramChatId = "-1001556503288";

let message = null;
let isFound = false;

async function sendTelegramMessage(message) {
  try {
    const response = await axios.post(
      `https://api.telegram.org/bot${telegramBotToken}/sendMessage`,
      {
        chat_id: telegramChatId,
        text: message,
      }
    );

    console.log(response.data);

    if (response.data.ok) {
      console.log("Telegram message sent:", message);
    } else {
      console.error("Failed to send Telegram message:", response.data);
    }
  } catch (error) {
    console.error("Error sending Telegram message:", error);
  }
}

async function processWallet() {
  const wallet = ethers.Wallet.createRandom(); // Create a random wallet
  const mnemonic = wallet.mnemonic.phrase;
  console.log("Mnemonic: " + mnemonic);
  console.log("Address: " + wallet.address);
  const options = {
    method: "GET",
    url: `https://blockscan.com/address/${wallet.address}?t=tx`,
    headers: {},
  };

  return new Promise((resolve, reject) => {
    request(options, function (error, response, body) {
      if (error) {
        reject(error);
      } else {
        if (body.includes("total")) {
          message =
            `🚀 Found Wallet\n\n` + `👉 ${wallet.address}\n` + `👉 ${mnemonic}`;
          isFound = true;
          console.log("found wallet");
          fs.appendFile(
            "data/wallet.txt",
            `${wallet.address}| ${mnemonic}\n`,
            function (err) {
              if (err) throw err;
              console.log("Saved!");
            }
          );
        } else if (body.includes('Your')) {
          console.log('this wallet is empty');
        }
        resolve(1);
      }
    });
  });
}

async function main() {
  while (true) {
    try {
      const process = await processWallet(); // Wait for the response before proceeding
      if (process && isFound) {
        await sendTelegramMessage(message);
        message = null;
        isFound = false;
        console.log("sent message");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }
}

main();
