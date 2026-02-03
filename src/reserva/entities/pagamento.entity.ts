import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum StatusPagamento {
    PENDENTE = 'pendente',
    APROVADO = 'aprovado',
    RECUSADO = 'recusado',
    ESTORNADO = 'estornado',
}

@Entity('pagamento')
export class Pagamento {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    usuario_id: string;

    @Column()
    assento_id: string;

    @Column({ length: 4 })
    cartao_final: string;

    @Column()
    titular_nome: string;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    valor: number;

    @Column({
        type: 'enum',
        enum: StatusPagamento,
        default: StatusPagamento.APROVADO,
    })
    status: StatusPagamento;

    @Column()
    metodo_pagamento: string;

    @CreateDateColumn()
    criado_em: Date;

    @UpdateDateColumn()
    atualizado_em: Date;
}