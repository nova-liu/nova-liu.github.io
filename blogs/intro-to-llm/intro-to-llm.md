This is the study notes on [Intro to Large Language Models (LLM) by Andrej Karpathy](https://www.youtube.com/watch?v=zjkBMFhNj_g)

click to view the full PDF:

<a href="/blogs/intro-to-llm/LLMs_From_Files_to_a_New_OS.pdf" style="text-decoration: none; color: inherit;">
    <img src="/blogs/intro-to-llm/image.png" style="margin-right: 15px;"/>
</a>

Some questions to help you better understand the video:

# What is an assistant Model and how do we get it?

An assistant model is the second major stage in the development of a modern AI like ChatGPT or Claude. To understand it, it is helpful to contrast it with its predecessor:
• The Base Model (Stage 1): This is an "internet document sampler" that generates text based on what it learned from 10TB of raw internet data,. If you ask a base model a question, it might simply respond with more questions or irrelevant text because it is just mimicking the structure of a web page.
• The Assistant Model (Stage 2): This model has been "aligned" to recognize questions and provide useful, truthful, and harmless answers,. It "subscribes to the form" of helpful conversations, making it much more practical for human tasks.
How do we get an Assistant Model?
The process of transforming a base model into an assistant model is called fine-tuning,. Here is how it is achieved:

1. Dataset Swapping: The training algorithm (next-word prediction) remains identical, but the data changes. Instead of using massive amounts of low-quality internet text, developers use a smaller set of high-quality, manually collected Q&A documents,.
2. Human Labeling: Companies hire human labelers who follow extensive labeling instructions (which can be hundreds of pages long),. These people write out specific questions (user prompts) and then write the ideal, expert response that the assistant should provide,.
3. Quality over Quantity: While the first stage (pre-training) involves terabytes of data, fine-tuning focuses on a much smaller scale—roughly 100,000 high-quality conversation documents.
4. Computational Efficiency: Fine-tuning is far cheaper and faster than pre-training. While pre-training can take months and cost millions, a fine-tuning run might take only one day. This allows researchers to iterate quickly, fixing model "misbehaviors" by adding corrected examples to the dataset and re-training,.
5. Optional Stage 3 (RLHF): Many models undergo a third stage called Reinforcement Learning from Human Feedback (RLHF). In this stage, the model generates several candidate answers, and human labelers compare and rank them. This "comparison" method is often easier for humans than writing a perfect response from scratch and helps further boost the model's performance,.
   In summary, we obtain an assistant model by taking a knowledge-rich base model and putting it through a fine-tuning process that aligns its behavior with human expectations of a helpful and reliable assistant

# How to "understand the number of parameters" and the "amount of training data"?

the number of parameters (N) and the amount of training data (D) are the two most critical variables that determine the performance and knowledge of a Large Language Model (LLM).
Here is how to understand these concepts and their relationship:

1. Number of Parameters (N)
   The parameters can be thought of as the "storage capacity" or the "knowledge density" of the neural network.
   • Physical Essence: Parameters are essentially a large list of numbers, also called weights. For example, the Llama 2 70B model has 70 billion parameters. Since each is stored as 2 bytes (float16), they form a 140GB file on a computer's disk.
   • Distributed Knowledge: These billions of parameters are dispersed throughout the neural network. While the code to run the model is simple (about 500 lines of C code), the "magic" and intelligence reside entirely within these parameters.
   • Optimization: We do not manually design what these parameters do; instead, we use a mathematical process to iteratively adjust them until the network becomes highly accurate at predicting the next word in a sequence.
2. Amount of Training Data (D)
   The training data is the "source material" that the model consumes to learn about the world.
   • Pre-training Scale (Quantity): In the first stage of training, the model "reads" a massive chunk of the internet—roughly 10 terabytes (TB) of text. This involves collecting data from all kinds of websites, Wikipedia, and books.
   • Fine-tuning Scale (Quality): In the second stage, the amount of data is much smaller (e.g., 100,000 documents) but of much higher quality, consisting of manually written Q&A conversations designed to teach the model how to act as an assistant.
   • Knowledge Compression: Training is effectively a lossy compression of this data. The model does not store an identical copy of the 10TB of text; instead, it compresses the "Gestalt" or the general patterns of that information into the 140GB parameters file—a roughly 100x compression ratio.
3. The Relationship: Scaling Laws
   The most significant insight provided by the sources is that LLM performance is not random; it follows Scaling Laws.
   • Predictable Performance: The accuracy of a model is a smooth and predictable function of only N (parameters) and D (training data). If you increase the number of parameters and the amount of text you train on, you can predict with high confidence how much better the model will become at next-word prediction.
   • The "Gold Rush": Because these trends show no sign of "topping out," the industry is currently in a "Gold Rush" to build larger GPU clusters and collect more data. Algorithmic progress is a bonus, but simply scaling up N and D provides a "guaranteed path to success" for creating more powerful models.
   In summary, the number of parameters represents the model's capacity to hold information, while the amount of training data provides the information it must learn. Together, they dictate the model's ability to reason, retrieve knowledge, and perform complex tasks

# What changes at the physical layer during training?

At the physical layer, the training of a large language model (LLM) involves the transformation of massive amounts of raw data into a specific set of numerical values known as parameters or weights.

1. Modification of Parameters (Weights)
   The most fundamental physical change is the iterative adjustment of parameters dispersed throughout the neural network,. In a model like Llama 2 70B, there are 70 billion such parameters. During training, these numerical values are optimized so that the network as a whole becomes better at the task of next-word prediction.
2. Compression of Data
   Physically, training acts as a form of lossy compression.
   • Input: Roughly 10 terabytes of raw text crawled from the internet.
   • Output: A parameters file that is significantly smaller (e.g., 140 gigabytes for a 70B model).
   • Result: The "magic" of the internet's knowledge is physically compressed into these weights, which capture the "Gestalt" or the general patterns of the information rather than an identical copy.
3. Numerical Representation
   These parameters are physically stored as a large list of numbers on a file system.
   • Data Type: In the case of Llama 2, each parameter is stored as a float16 number.
   • Storage Size: Because each float16 number takes up 2 bytes, the physical size of the parameter file is determined by multiplying the number of parameters by two (70 billion parameters × 2 bytes = 140GB).
4. Neural Network Configuration
   Within the Transformer neural network architecture, these billions of parameters are dispersed across "neurons" and their connections,. While the run file (the code that executes the architecture) remains a small, static piece of software—often only about 500 lines of C code—the training process physically populates the "empty" architecture with the specific weight values necessary for it to function.
5. Alignment and Formatting
   In the second stage of training, known as fine-tuning, the physical values of the parameters are further adjusted to change the model's behavior. This process "swaps out" the data distribution from raw internet documents to high-quality Q&A documents,. Physically, this aligns the weights so that the model "subscribes to the form" of a helpful assistant rather than a mere document sampler.
   In summary, training physically changes a "large list of parameters" from random or uninitialized values into a highly coordinated empirical artifact that contains compressed world knowledge.

Following the sources and the "LLM OS" analogy provided by Andrej Karpathy, here is a self-question and answer session in English regarding the physical nature of multimodal inputs.

# From a physical and architectural standpoint, does an LLM treat text, audio, and video inputs the same way?

Yes, at the fundamental level of the emerging **"LLM OS" (Operating System)**, these diverse inputs are treated with a unified logic. While the raw formats of text, sound, and light differ, the sources explain that they are processed through the same physical and mathematical framework:

- **Unified Processing Core:** Physically, the LLM consists of only two files: the **parameters file** (weights) and the **run file** (code). Regardless of whether the input is text, an image, or a voice command, it must pass through this same neural network architecture—typically the **Transformer**—where billions of parameters "fire" to process the data.
- **The Context Window as RAM:** In the LLM OS analogy, the **context window** serves as the system's **Random Access Memory (RAM)**. Whether you "plug in" a paragraph of text, a sketched website diagram, or an audio stream, that data is paged into this finite "working memory" resource for the model to analyze.
- **Predicting the Next "Chunk":** The core mathematical task remains identical: **predicting the next part of a sequence**. For text, it predicts the next word; for multimodality, the model is simply "dreaming" or generating responses based on a sequence that now includes visual or auditory tokens.
- **Cross-Modal Interaction:** The sources demonstrate that the model doesn't just treat these inputs as separate files; it **intertwines** them. For instance, a model can "see" an image of a joke website and physically translate those visual patterns into functional HTML/JavaScript code.
- **Shared Security Vulnerabilities:** Perhaps the strongest physical proof that they are treated similarly is the **Prompt Injection** attack. An LLM can "read" hidden instructions in an image (like white text on a white background) just as it reads a text prompt. This proves that, at the model's processing layer, the visual data is converted into a logical sequence that carries the same weight and "instructional power" as text.

In conclusion, while the inputs start as different physical media, the LLM functions as a **multimodal kernel** that reduces all of them to a unified sequence of data paged into its context window, governed by the same set of weights in the parameters file.
