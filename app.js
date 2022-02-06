require('dotenv').config();
const fs = require("fs");
const { google } = require("googleapis");

const service = google.sheets("v4");
const credentials = require("./credentials.json");

// Configure auth client
const authClient = new google.auth.JWT(
    credentials.client_email,
    null,
    credentials.private_key.replace(/\\n/g, "\n"),
    ["https://www.googleapis.com/auth/spreadsheets"]
);

(async function () {
    try {

        // Authorize the client
        const token = await authClient.authorize();

        // Set the client credentials
        authClient.setCredentials(token);

        // Get the rows
        const res = await service.spreadsheets.values.get({
            auth: authClient,
            spreadsheetId:process.env.CLIENT_ID,
            range: "A:D",
        });

        // All of the details
        const details = [];

        // Set rows to equal the rows
        const rows = res.data.values;

        // Check if we have any data and if we do add it to our data array
        if (rows.length) {

            // Remove the headers
            rows.shift()

            // For each row
            for (const row of rows) {
                details.push({ timeStamp: row[0], name: row[1], age: row[2], dob: row[3] });
            }

        } else {
            console.log("No details found.");  
        }

        // Saved the details
        fs.writeFileSync("details.json", JSON.stringify(details), function (err, file) {
            if (err) throw err;
            console.log("Saved!");
        });

    } catch (error) {

        // Log the error
        console.log(error);

        // Exit the process with error
        process.exit(1);

    }

})();