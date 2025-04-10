declare namespace NodeJS {
	interface ProcessEnv {
		LLM_URL: string;
		LLM_KEY: string;
		LLM_NAME: string;
		RAG_CHAT_ID: string;
		DB_URL: string;
	}
}
