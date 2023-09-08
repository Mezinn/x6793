import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn, Unique
} from 'typeorm';
import {Office} from "./Office.entity";

@Entity('rate')
@Unique(["office", "from_currency", "to_currency"])
export class Rate {
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
    in_rate: number;

    @Column('decimal', {precision: 10, scale: 4})
    out_rate: number;

    @Column('decimal', {precision: 15, scale: 2})
    reserve: number;

    @Column('date')
    date: Date;
}
