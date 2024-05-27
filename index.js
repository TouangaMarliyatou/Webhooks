express = require('express');
const bodyParser = require('body-parser');
const simpleGit = require('simple-git');
const { exec } = require('child_process');

const app = express();
const PORT = 3000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Webhook endpoint
app.post('/webhook', (req, res) => {
    const event = req.body;

    // Verify the event is a push event
    if (event && event.ref === 'refs/heads/main') {
        console.log('Push event received:', event);
        
        // Perform git pull
        const git = simpleGit();
        git.pull('origin', 'main', (err, update) => {
            if (err) {
                console.error('Error pulling from repo:', err);
                return res.status(500).send('Internal Server Error');
            }
            if (update && update.summary.changes) {
                console.log('Changes pulled from repository');
                
                // Run build command (assuming a build script is defined in package.json)
                exec('npm run build', (error, stdout, stderr) => {
                    if (error) {
                        console.error(`Build error: ${stderr}`);
                        return res.status(500).send('Build Error');
                    }
                    console.log(`Build output: ${stdout}`);
                    res.status(200).send('Webhook received and processed');
                });
            } else {
                res.status(200).send('No changes detected');
            }
        });
    } else {
        res.status(400).send('Event not relevant');
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});