const db = require('data-api-client')({
    secretArn: process.env.SECRET_ARN,
    resourceArn: process.env.PGDBClusterArn,
    database: process.env.PGDATABASE
  });
  
  export default db;