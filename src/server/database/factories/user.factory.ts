import { setSeederFactory } from 'typeorm-extension';
import { Foto, Usuario } from '../entities';
import { PasswordCrypto } from '../../shared/services';
import path from 'path';

export default setSeederFactory(Usuario, async (faker) => {

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

    const user = new Usuario();

    user.nome = faker.person.firstName('male');
    user.sobrenome = faker.person.firstName('male');
    user.email = faker.internet.email();
    user.bloqueado = faker.datatype.boolean();
    user.senha = await PasswordCrypto.hashPassword(faker.internet.password());
    user.usuario_atualizador = 'seed';
    user.usuario_cadastrador = 'seed';
    user.foto = photo;

    return user;

});