const axios = require('axios');
axios.get('http://localhost:5000/api/issues').then(res => console.log(JSON.stringify(res.data[0], null, 2))).catch(e => console.error(e.message));
