import admin from 'firebase-admin';
import { ServiceAccount } from 'firebase-admin';

// Função para converter \n para quebras de linha reais
const parsePrivateKey = (key: string) => key.replace(/\\n/g, '\n');

const auth = {
    type: process.env.TYPE || 'service_account',
    project_id: process.env.PROJECT_ID || 'mock-project-id',
    private_key_id: process.env.PRIVATE_KEY_ID || 'mock-private-key-id',
    private_key: parsePrivateKey(process.env.PRIVATE_KEY || '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDUvF1H/TzU5mAt\nG1Pp+jY4t4lRLry7bKylU38d+11VwU62+kZa8lk1J2HmLl7Cl/3pT0c3JF4B5lK5\noP4eTFCGpsfKZsPZwcdHw6xVRS4ve9Yw/Wk3ZCgVpD4aLoT0HwRfgC2LudS5kG9L\nRq60U3KseMk1Pw/9zK9sNl2sG4u9aV8nRJL4XSeP8T0v/yR6LYPb1nXn5JgZk7Dr\nx1ZnJHc+CGj1N+1MYR3L9yZxSfYXHdZG7f2T9Olwe/B/1rX1dznl4g6xyDyIqZ4w\nMbxrCg0LXX8gGfI3tc4ZjkSfXOJGFLkEToxaM50E8HFnCx4B3xWpQIDAQABAoIB\nAQC5U8G3Q3IeP1Kf5Y4WJ+oJ0nGJgA9eYwVwVgS/O94jxL50t7idus26HACw8Dp3\n7HhL+YbE8Z0IXGj0/9gGR7jbgvmx6qDtfuKhkAaSjfw9V1txrRHZimJCFXz8F08T\n8F7U9nIjkEzS5RTQoYwPUVaI3R/Q9vPvJ3FHz8FmTe3YJYAfX+4hTDZ7l4ZKq2CI\nN6fOth8H1o9J1Os5CB3QuYhj8GM8SN7RXKzJiZZkAYFZ2kh1QV8s8yl6y5TtJXlU\nxS17v/vMBgYOT8q4b0scBv+wUEJQfX/cyTl2w5K74jW8g1v51v/LAgg02H60SK2M\nm+U6lRSkW1qBAoGBAMFURoA87rHnJFha+V6S5zDOD+J2ahQFJxW/xhePQFryl9lz\niNJ9jXnGGHbPA3RGYP2w3mGNTn7/gKwC9U+P5xWv+TALW6kl3cHrcc05M2VWh0JW\n9GJd0ebm2LLaM2yS01dK5r6vzDfQCYK0y3En9GGYDZ7rXUqZtNvZhl4vBogY4qgY\nn9zWgsLxAoGAdCsW0O4vU1F5n8qFMU12fF2fqvh9U1vG6e9v7ROUWx9brZ97UMMW\nEeOJYf3NS5X8xjK/xhrO0C3UQZyJX/fAVdZNR1ZsGK0DojW9V3B9lU5uFrxu3xMe\nwIG4Rp5kSQDvJciIsVUVifmW/9XcxdRfJ4Xwdm6dNfEadld5we56T7UCgYAT2yq5\nCt4Hl2iAP1v0+kRrH0tK2kWNpZgN2cr8y3D+/X3qL8LkKc5XZ8+zNnLrPm5L3sZ0\nDlWV8wvZj6B3X2jXZCpEh3g2J7D3/s2JnC6i66pl84WlMOTeTjFcTUmCfRcOy34d\njMq4TOU5E+JeyXJmIkfD3ZgH58y01qf7+LpT9QKBgQCN7JN7ryF1Mh5FkP5lWk6Q\nhYx1xFpTbR3kyxT32foBw6CYLoBqZb7F7CxyI6cLFJxlV2W4QF3PAGClf5B5BIsa\nvzN6OwT5yqL4ZVRtXOc4h4r+uk0Pv5Umo4WE83IjYHyfjCkhOf22t1KChVPiSe/5\nE5zvrxSm5Lc0ivmDr+Sp5g==\n-----END PRIVATE KEY-----\n'),
    client_email: process.env.CLIENT_EMAIL || 'mock-client-email@mock-project-id.iam.gserviceaccount.com',
    client_id: process.env.CLIENT_ID || 'mock-client-id',
    auth_uri: process.env.AUTH_URI || 'https://accounts.google.com/o/oauth2/auth',
    token_uri: process.env.TOKEN_URI || 'https://oauth2.googleapis.com/token',
    auth_provider_x509_cert_url: process.env.AUTH_PROVIDER_X509_CERT_URL || 'https://www.googleapis.com/oauth2/v1/certs',
    client_x509_cert_url: process.env.CLIENT_X509_CERT_URL || 'https://www.googleapis.com/robot/v1/metadata/x509/mock-client-email%40mock-project-id.iam.gserviceaccount.com',
    universe_domain: process.env.UNIVERSE_DOMAIN,
};

admin.initializeApp({
    credential: admin.credential.cert(auth as ServiceAccount),
    storageBucket: 'blog-fiap.appspot.com' // Ajuste o nome do bucket
});

const bucket = admin.storage().bucket() || 'blog-fiap.appspot.com';

export { bucket };
