
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function listModels() {
    const genAI = new GoogleGenerativeAI("AIzaSyDqzrEr8ZzYpi_zABD5t1J_cN9hfPd36WQ");
    try {
        // Note: listModels is on the genAI instance or model? Check docs memory.
        // Actually typically it's hard to list without admin API often, but I think the SDK might support it?
        // Not straightforward in the basic SDK sometimes.
        // Let's try just "gemini-1.5-flash-latest" or "gemini-1.5-flash-001".
        // But let's try a standard HTTP curl to list models if node fails.
        console.log("Trying gemini-1.5-flash-latest...");
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
        await model.generateContent("test");
        console.log("Success with gemini-1.5-flash-latest");
    } catch (e) {
        console.log("Failed 1.5-flash-latest");
    }
}
listModels();
