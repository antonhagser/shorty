import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    PrimaryColumn,
    UpdateDateColumn,
} from "typeorm";

@Entity("accounts")
export class Account {
    @PrimaryColumn()
    id: string;

    @Column({ name: "api_key" })
    apiKey: string;

    @CreateDateColumn({ name: "created_at" }) // Creation date (e.g. 2021-01-01T00:00:00.000Z)
    // @ts-ignore
    createdAt: Date; // Creation date

    @UpdateDateColumn({ name: "updated_at" })
    // @ts-ignore
    updatedAt: Date; // Last updated date

    @DeleteDateColumn({ name: "deleted_at" })
    // @ts-ignore
    deletedAt: Date; // Deletion date

    constructor(id: string, apiKey: string) {
        this.id = id;
        this.apiKey = apiKey;
    }
}
