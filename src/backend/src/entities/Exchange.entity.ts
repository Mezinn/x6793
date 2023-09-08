import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn
} from 'typeorm';
import {Office} from "./Office.entity";

@Entity('exchange')
export class Exchange {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Office)
    @JoinColumn({name: "office_id"})
    office: Office;

    @Column('varchar', {length: 8})
    from_currency: string;

    @Column('varchar', {length: 8})
    to_currency: string;

    @Column('decimal', {precision: 10, scale: 4})
    ask: number;

    @Column('decimal', {precision: 10, scale: 4})
    bid: number;

    @Column('date')
    date: Date;
}
