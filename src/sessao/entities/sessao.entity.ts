import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';


@Entity('sessao')
export class Sessao {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    filme: string;

    @Column()
    sala: string;

    @Column({ type: 'date' })
    date: Date;

    @Column({ type: 'time' })
    horario: string;

    @Column({ type: 'decimal' })
    preco: number;

    @OneToMany(() => Assento, (assento) => assento.sessao, { cascade: true })
    mapa_assentos: Assento[];
}


@Entity('assento')
export class Assento {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    posicao: string;

    @Column({
        type: 'varchar',
        default: 'disponivel'
    })
    status: StatusAssento;

    @Column({ nullable: true })
    usuario_id: string;

    @ManyToOne(() => Sessao, (sessao) => sessao.mapa_assentos, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'sessao_id' })
    sessao: Sessao;
}

export enum StatusAssento {
    DISPONIVEL = 'disponivel',
    OCUPADO = 'ocupado',
}