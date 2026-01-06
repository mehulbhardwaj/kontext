```javascript
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function test() {
    const genAI = new GoogleGenerativeAI("AIzaSyDqzrEr8ZzYpi_zABD5t1J_cN9hfPd36WQ");
    const model = genAI.getGenerativeModel({ model: "gemini-3.0-flash" });
    try {
        const result = await model.generateContent("Hello?");
        console.log(result.response.text());
    } catch (e) {
        console.error(e);
    }
}
test();
