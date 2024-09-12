import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    OneToOne,
    JoinColumn,
} from 'typeorm';
import { Foto } from './Fotos';

@Entity('postagens')
export class Postagem {

    @PrimaryGeneratedColumn({ type: 'bigint' })
    id: number;

    @Column({ type: 'varchar', nullable: false, unique: true, length: 50 })
    titulo: string;

    @Column({ type: 'text', nullable: false })
    conteudo: string

    @Column({ nullable: false, type: 'boolean', default: true })
    visivel?: boolean;

    @Column({ type: 'text', nullable: true })
    usuario_cadastrador?: string;

    @Column({ type: 'text', nullable: true })
    usuario_atualizador?: string;

    @CreateDateColumn({ nullable: false, type: "timestamp" }) // Alteração do tipo para timestamp
    data_criacao: Date

    @UpdateDateColumn({ nullable: false, type: "timestamp" }) // Alteração do tipo para timestamp
    data_atualizacao: Date

    @OneToOne(() => Foto, (foto) => foto.postagem, {
        cascade: true,
        onDelete: 'CASCADE'
    })

    @JoinColumn({ name: "foto_id" })
    foto: Foto
}