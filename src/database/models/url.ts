import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    OneToOne,
    PrimaryColumn,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";
import { Account } from "./account";

@Entity("urls")
export class URL {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ name: "short_id" })
    @Index("IDX_SHORT_ID", { unique: true })
    shortId: string;

    @Column()
    views: number;

    @Column({ name: "redirect_url" })
    redirectURL: string;

    @ManyToOne(() => Account, (acc) => acc.id)
    account: Account;

    @CreateDateColumn({ name: "created_at" }) // Creation date (e.g. 2021-01-01T00:00:00.000Z)
    // @ts-ignore
    createdAt: Date; // Creation date

    @UpdateDateColumn({ name: "updated_at" })
    // @ts-ignore
    updatedAt: Date; // Last updated date

    constructor(
        redirectURL: string,
        shortId: string,
        views: number,
        account: Account
    ) {
        this.redirectURL = redirectURL;
        this.shortId = shortId;
        this.views = views;
        this.account = account;
    }
}
