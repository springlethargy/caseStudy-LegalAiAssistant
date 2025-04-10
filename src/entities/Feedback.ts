import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
} from "typeorm";

@Entity()
export class Feedback {
	@PrimaryGeneratedColumn({ type: "integer" })
	id!: number;

	@Column({ type: "text", nullable: false })
	query!: string;

	@Column({ type: "text", nullable: false })
	response!: string;

	@Column({ type: "float", nullable: false })
	rate!: number;

	@CreateDateColumn({ type: "datetime" })
	time!: Date;
}
