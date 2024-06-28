import admin from 'firebase-admin';
import { ServiceAccount } from 'firebase-admin';

// Função para converter \n para quebras de linha reais
const parsePrivateKey = (key: string) => key.replace(/\\n/g, '\n');

const auth = {
    type: process.env.TYPE,
    project_id: process.env.PROJECT_ID,
    private_key_id: process.env.PRIVATE_KEY_ID,
    private_key: parsePrivateKey(process.env.PRIVATE_KEY || ''),
    client_email: process.env.CLIENT_EMAIL,
    client_id: process.env.CLIENT_ID,
    auth_uri: process.env.AUTH_URI,
    token_uri: process.env.TOKEN_URI,
    auth_provider_x509_cert_url: process.env.AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.CLIENT_X509_CERT_URL,
    universe_domain: process.env.UNIVERSE_DOMAIN,
};

admin.initializeApp({
    credential: admin.credential.cert(auth as ServiceAccount),
    storageBucket: 'blog-fiap.appspot.com' // Ajuste o nome do bucket
});

const bucket = admin.storage().bucket();

export { bucket };
