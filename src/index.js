// For accessing the express instance.
import app from './app.js';

// Port number to be used by the server.
const port = process.env.PORT;

// Listen do client requests.
app.listen(port, () => {
    console.log('Server is up and running!')
})
