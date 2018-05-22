const express = require('express')
const app = express()

app.use('/static', express.static('assests'))

app.get('/', (req, res) => res.sendFile('/Users/Aaron/work/project1/folder/index.html'))

app.listen(3000, () => console.log('Example app listening on port 3000!'))