const forge = require('node-forge');
const fs = require('fs');

// Generate a key pair
const keys = forge.pki.rsa.generateKeyPair(2048);

// Create a self-signed certificate
const cert = forge.pki.createCertificate();
cert.publicKey = keys.publicKey;
cert.serialNumber = '01';
cert.validFrom = new Date().toISOString();
cert.validTo = new Date();
cert.validTo.setFullYear(cert.validTo.getFullYear() + 1); // 1 year validity
cert.setSubject([{
    name: 'commonName',
    value: 'localhost'
}]);
cert.setIssuer([{
    name: 'commonName',
    value: 'localhost'
}]);

// Sign the certificate with the private key
cert.sign(keys.privateKey);

// Convert the certificate and private key to PEM format
const certPem = forge.pki.certificateToPem(cert);
const keyPem = forge.pki.privateKeyToPem(keys.privateKey);

// Save the key and certificate to files
fs.writeFileSync('cert.pem', certPem);
fs.writeFileSync('key.pem', keyPem);

console.log('Certificate and key have been generated.');
