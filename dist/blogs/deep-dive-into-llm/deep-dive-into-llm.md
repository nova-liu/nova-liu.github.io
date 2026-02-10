This is the study notes on [Deep dive into LLMs like GPT by Andrej Karpathy](https://www.youtube.com/watch?v=7xTGNNLPyMI)

click to view the full PDF:

<a href="/blogs/deep-dive-into-llm/Decoding_LLMs.pdf" style="text-decoration: none; color: inherit;">
    <img src="/blogs/deep-dive-into-llm/image.png" style="margin-right: 15px;"/>
</a>

Some questions to help you better understand the video:


## What is Reinforcement Learning (RL)?

**Reinforcement Learning (RL)** is the third major stage of training an LLM, where the model learns through **trial and error** rather than just imitating humans.

Here is a detailed breakdown of what Reinforcement Learning entails according to the provided material:

### 1. The "Practice Problem" Analogy
While pre-training is like reading textbooks and fine-tuning is like imitating a teacher's worked examples, RL is equivalent to a student doing **practice problems**. The model is given a problem and the final answer (the "answer key") but must **discover the solution path** on its own.

### 2. The "Guess and Check" Mechanism
The core of RL is a process called "guess and check":
*   **Rollouts:** The model generates many different candidate solutions (token sequences) for the same prompt.
*   **Verification:** If a solution leads to the correct final answer (e.g., in a math problem or coding task), that specific path is **reinforced**. 
*   **Optimization:** The model's parameters are updated to make those successful token sequences more likely to occur in the future.

### 3. Emergent Reasoning (Thinking)
A major breakthrough of RL is that it allows for **emergent reasoning**:
*   **Beyond Human Imitation:** Since the model isn't just copying a human expert, it can discover **cognitive strategies** that work best for its own digital architecture.
*   **Chain of Thought:** Through RL, models (like DeepSeek R1 or OpenAI o1) learn to "think" by **backtracking, re-evaluating, and checking their math** before giving a final answer.

### 4. Verifiable vs. Unverifiable Domains
*   **Verifiable Domains:** In subjects like math and code, RL is highly effective because a computer can automatically check if the answer is right or wrong.
*   **Unverifiable Domains (RLHF):** For tasks like joke writing or poetry where there is no "correct" answer, researchers use **Reinforcement Learning from Human Feedback (RLHF)**. This involves training a **Reward Model**—a separate neural network that simulates human preferences—to score the model’s outputs.

## How to handle the model's hallucination?
### 1. Training the Model to Say "I Don't Know"
Hallucinations often happen because models are trained to imitate a confident "assistant" style, even when they lack the necessary facts in their parameters. 
*   **Knowledge Probing:** Developers like Meta (for Llama 3) interrogate the model with thousands of factual questions to find the boundaries of what it truly "knows".
*   **Knowledge-Based Refusal:** If the model consistently answers a question incorrectly during testing, developers add new examples to the training set where the "ideal" response is "I'm sorry, I don't know". This helps the model associate internal uncertainty with a verbal refusal to guess.

### 2. Using External Tools (Web Search & Code)
A major mitigation is giving the model access to tools that shift information from its "vague recollection" (parameters) into its **"working memory" (the context window)**.
*   **Web Search:** The model can be trained to emit special tokens to trigger a search (e.g., using Bing or Google). The retrieved text is then pasted directly into the conversation, allowing the model to reference facts rather than relying on its internal memory.
*   **Code Interpreter:** For math or logic, hallucinations often stem from "mental arithmetic" errors. By using a **Python interpreter**, the model can write code to calculate answers, which provides much higher correctness guarantees.

### 3. User Strategies: Context Injection
As a user, the most effective way to prevent hallucinations is to **not rely on the model's memory**.
*   **Provide Reference Material:** Instead of asking about a book or document from memory, you should **copy-paste the relevant text** directly into the prompt. 
*   **Working Memory vs. Long-term Memory:** Information in the context window is directly accessible and much harder for the model to hallucinate than information stored in its parameters from months of pre-training.

### 4. Adopting a "Swiss Cheese" Mindset
The sources suggest viewing LLM capabilities as a **"Swiss Cheese" model**: the AI might be brilliant at PhD-level physics but fail at simple counting or comparing numbers like 9.11 and 9.9.
*   **Verify and Check:** You should treat the AI as a tool for inspiration or first drafts but always **check its work** for factual accuracy.
*   **Distribute Reasoning:** If a problem is complex, ask the model to "think step-by-step" or create intermediate results. This distributes the computation across more tokens, reducing the chance of a "leap" into a hallucinated answer.