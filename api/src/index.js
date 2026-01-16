import { app } from "@azure/functions";

// Optional: Global setup like streaming
app.setup({
    enableHttpStream: true,
});

// You don't necessarily need to import rewrite.js here 
// IF your package.json "main" points to "src/functions/*.js"