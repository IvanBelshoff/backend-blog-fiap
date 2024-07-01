import { setSeederFactory } from 'typeorm-extension';
import { Foto, Postagem } from '../entities';
import path from 'path';

export default setSeederFactory(Postagem, async (faker) => {

    const fotoLocal = process.env.SALVAR_FOTO_LOCAL as unknown as Boolean;

    const photo = new Foto();
    
    photo.local = String(fotoLocal) == 'true' ? path.resolve(__dirname, '..', '..', '..', '..', 'shared', 'data', 'default\\profile.jpg') : 'https://storage.googleapis.com/blog-fiap.appspot.com/profile.jpg',
    photo.nome = 'profile.jpg',
    photo.originalname = 'profile.jpg',
    photo.tamanho = 6758,
    photo.nuvem = String(fotoLocal) == 'true' ? false : true,
    photo.width = 462,
    photo.height = 462,
    photo.url = String(fotoLocal) == 'true' ? `http://${process.env.HOST}:${process.env.PORT}/profile/profile.jpg` : 'https://firebasestorage.googleapis.com/v0/b/blog-fiap.appspot.com/o/profile.jpg?alt=media',
    photo.tipo = 'jpg';

    const post = new Postagem();

    post.titulo = faker.internet.displayName();
    post.conteudo = faker.lorem.paragraphs();
    post.visivel = faker.datatype.boolean();
    post.usuario_atualizador = 'seed';
    post.usuario_cadastrador = 'seed';
    post.foto = photo;

    return post;

});