// Import reflect-metadata first
import "../lib/reflect";
import { DataSource, DataSourceOptions } from "typeorm";
import { Feedback } from "../entities/Feedback";

const options: DataSourceOptions = {
	type: "sqlite",
	database: "feedback.sqlite",
	entities: [Feedback],
	synchronize: true,
	logging: process.env.NODE_ENV === "development",
};

// For Next.js API routes, we need to create a new instance each time
// to avoid issues with serverless functions
let dataSource: DataSource;

export async function getDataSource(): Promise<DataSource> {
	if (!dataSource) {
		dataSource = new DataSource(options);
	}

	if (!dataSource.isInitialized) {
		try {
			await dataSource.initialize();
			console.log("Database connection initialized");
		} catch (error) {
			console.error("Error during Data Source initialization", error);
			throw error;
		}
	}

	return dataSource;
}
