export const createSession = (): Promise<string> => {
    const url = `${process.env.LLM_URL}/api/v1/chats/${process.env.RAG_CHAT_ID}/sessions`;
    const body = {
        name: crypto.randomUUID(),
    };

    return fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.LLM_KEY}`,
        },
        body: JSON.stringify(body),
    })
        .then((response) => response.json())
        .then((r) => r.id)
        .catch((error) => {
            console.error("Error creating session:", error);
            throw error;
        });
};

export const getChatStream = (question: string, sessionId: string) => {
    const url = `${process.env.LLM_URL}/api/v1/chats/${process.env.RAG_CHAT_ID}/completions`;
    const body = {
        question,
        stream: true,
        session_id: sessionId,
    };

    return fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.LLM_KEY}`,
        },
        body: JSON.stringify(body),
    })
        .then((response) => {
            if (!response.body) {
                throw new Error("No response body");
            }
            return response.body;
        })
        .catch((error) => {
            console.error("Error getting chat stream:", error);
            throw error;
        });
};
