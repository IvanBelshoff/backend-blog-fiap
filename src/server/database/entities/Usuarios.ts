import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToMany,
    JoinTable,
    OneToOne,
    JoinColumn,
    UpdateDateColumn,
} from "typeorm";
import { Regra } from "./Regras";
import { Permissao } from "./Permissoes";
import { Foto } from "./Fotos";


@Entity("usuarios")
export class Usuario {

    @PrimaryGeneratedColumn({ type: 'bigint' })
    id: number;

    @Column({ type: 'text', nullable: false })
    nome: string

    @Column({ type: 'text', nullable: false })
    sobrenome: string

    @Column({ type: 'text', nullable: false, unique: true })
    email: string

    @Column({ default: false })
    bloqueado: boolean

    @Column()
    senha?: string;

    @Column({ type: 'text', nullable: true })
    usuario_atualizador?: string;

    @Column({ type: 'text', nullable: true })
    usuario_cadastrador?: string;

    @Column({ nullable: true, type: "timestamp" }) // Alteração do tipo para timestamp
    ultimo_login?: Date

    @CreateDateColumn({ nullable: false, type: "timestamp" }) // Alteração do tipo para timestamp
    data_criacao: Date

    @UpdateDateColumn({ nullable: false, type: "timestamp" }) // Alteração do tipo para timestamp
    data_atualizacao: Date

    @ManyToMany(() => Permissao, (permissao) => permissao.usuario, {
        cascade: true,
        onDelete: 'CASCADE',
        onUpdate: 'SET NULL',
    })

    @JoinTable({
        name: 'usuarios_permissoes',
        joinColumns: [{ name: 'usuario_id' }],
        inverseJoinColumns: [{ name: 'permissao_id' }],
    })

    permissao: Permissao[];

    @ManyToMany(() => Regra, (regra) => regra.usuario, {
        cascade: true,
        onDelete: "CASCADE",
        onUpdate: "SET NULL",
    })

    @JoinTable({
        name: "usuarios_regras",
        joinColumns: [{ name: "usuario_id" }],
        inverseJoinColumns: [{ name: "regra_id" }],
    })

    regra: Regra[];

    @OneToOne(() => Foto, (foto) => foto.usuario, {
        cascade: true,
        onDelete: 'CASCADE'
    })

    @JoinColumn({ name: "foto_id" })
    foto: Foto
}
