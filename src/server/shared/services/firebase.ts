import admin from 'firebase-admin';
import { ServiceAccount } from 'firebase-admin';

import serviceAccount from '../data/google-credentials/blog-fiap-firebase-adminsdk-mh8kp-0f04bdd881.json'; // Caminho para o arquivo JSON da chave privada

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as ServiceAccount),
    storageBucket: 'blog-fiap.appspot.com' // Ajuste o nome do bucket
});

const bucket = admin.storage().bucket();

export { bucket };

