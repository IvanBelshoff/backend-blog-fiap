import { Postagem } from '../../../database/entities';

export interface IBodyCreatePostagens extends Omit<Postagem, 'id' | 'data_criacao' | 'data_atualizacao' | 'foto'> { }

export interface IBodyUpdatePostagens extends Omit<Postagem, 'id' | 'usuario_cadastrador' | 'data_criacao' | 'data_atualizacao' | 'foto'> { }

export interface IQueryGetAllPostagens {
    page?: number;
    limit?: number;
    filter?: string;
}

export interface IQuerySearchPosts {
    search: string;
}

export interface IPostlValidaPostagem {
    titulo?: string
}
