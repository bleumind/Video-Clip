  const express = require('express');
  const cors = require('cors');
  const app = express();
  const port = process.env.PORT || 3000;

  app.use((_, res, next) => {
      res.header('Cross-Origin-Opener-Policy', 'same-origin');
      res.header('Cross-Origin-Embedder-Policy', 'require-corp');
      next();
    });
    
  app.use(express.static(__dirname + '/src'));
  app.use(express.static(__dirname + '/dist'));

  app.get('/', function(req, res) { 
      res.send('index.html');
  });

  app.listen(port, () => {
      console.log(`http:/localhost:${port}`);
  });
