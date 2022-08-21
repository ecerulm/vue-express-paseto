const { V4 } = require('paseto');

(async () => {
  const {publicKey,secretKey} = await V4.generateKey('public', { format: 'paserk'});
  console.log(publicKey)
  console.log(secretKey)
})();

