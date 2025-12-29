---
title: 'Hand-Written Transformer'
date: 2025-12-25
permalink: /posts/2025/12/transformer/
tags:
  - transformer
  - machine learning
  - PyTorch
---

（新坑：手撕变形金刚。大模型萌新探索LLM的第一步，参考GitHub上一些repo的实现，加入自己的理解和注释）



# Introduction

Transformer 是一种基于 **自注意力机制 (Self-Attention Mechanism)** 的深度学习模型架构，最初于 2017 年由 Google 在论文《[Attention Is All You Need](https://arxiv.org/abs/1706.03762)》中提出。它完全摒弃了传统的循环神经网络 (RNN) 和卷积神经网络 (CNN) 结构，仅依赖注意力机制来处理序列数据，实现了高效的并行计算，成为现代自然语言处理 (NLP) 和大语言模型 (LLM) 的基石。

The Transformer is a deep learning model architecture based on the **Self-Attention Mechanism**. It was first introduced by Google in the 2017 paper "[Attention Is All You Need](https://arxiv.org/abs/1706.03762)". It completely abandons traditional Recurrent Neural Networks (RNNs) and Convolutional Neural Networks (CNNs), relying solely on attention mechanisms to process sequential data. This design enables highly efficient parallel computation and has become the foundation of modern Natural Language Processing (NLP) and Large Language Models (LLMs).



Transformer 主要解决了 **长序列依赖建模** 和 **训练效率** 两大核心问题。

- **RNN/CNN 的瓶颈**：RNN 无法有效并行化，且存在梯度消失/爆炸问题，难以学习长距离依赖。CNN 的卷积核视野有限，捕获长程上下文需要堆叠很多层。
- **Transformer 的解决方案**：通过自注意力机制，模型能够直接计算序列中任意两个位置之间的关系（无论距离多远），从而高效捕获全局依赖。同时，其结构天然支持并行计算，极大加速了模型训练。

The Transformer primarily addresses two core issues: **long-range dependency modeling** and **training efficiency**.

- **Limitations of RNNs/CNNs**: RNNs cannot be parallelized effectively and suffer from vanishing/exploding gradient problems, making it difficult to learn long-distance dependencies. CNNs have limited receptive field sizes, requiring many stacked layers to capture long-range context.
- **Transformer's Solution**: Through the self-attention mechanism, the model can directly compute relationships between any two positions in a sequence (regardless of distance), thereby efficiently capturing global dependencies. Furthermore, its architecture inherently supports parallel computation, significantly accelerating model training.



一些关键组件：

1. **自注意力机制 (Self-Attention)**：核心组件。为序列中的每个词计算一个“注意力分数”，表示在编码当前词时，应该“关注”序列中其他词的权重。
2. **多头注意力 (Multi-Head Attention)**：将自注意力机制并行执行多次（多个“头”），每个头学习不同的关注模式，最后将结果合并，增强了模型的表示能力。
3. **位置编码 (Positional Encoding)**：由于 Transformer 本身没有循环或卷积结构，它需要额外注入序列中词的位置信息。通常使用正弦和余弦函数来生成位置编码向量，与词向量相加。
4. **编码器 (Encoder)**：由 N 个相同的层堆叠而成。每层包含一个**多头自注意力子层**和一个**前馈神经网络 (Feed-Forward Network, FFN) 子层**，每个子层后都有**残差连接 (Residual Connection)** 和**层归一化 (Layer Normalization)**。
5. **解码器 (Decoder)**：同样由 N 个相同的层堆叠。除了包含编码器中的两个子层，还额外插入一个**交叉注意力 (Cross-Attention) 子层**，用于关注编码器的输出。解码器在训练时使用**掩码自注意力 (Masked Self-Attention)**，确保预测时只能看到当前位置及之前的信息。
6. **前馈神经网络 (FFN)**：一个简单的全连接网络，通常包含两个线性变换和一个激活函数（如 ReLU），作用于每个位置独立且相同。
7. **残差连接与层归一化 (Add & Norm)**：每个子层的输出是 `LayerNorm(x + Sublayer(x))`。残差连接缓解了深度网络中的梯度消失问题，层归一化稳定了训练过程。

Some key components:

1. **Self-Attention**: The core component. It calculates an "attention score" for each word in the sequence, representing the weight (importance) of other words when encoding the current word.
2. **Multi-Head Attention**: Executes the self-attention mechanism in parallel multiple times (multiple "heads"). Each head learns different patterns of attention, and the results are combined, enhancing the model's representational capacity.
3. **Positional Encoding**: Since the Transformer lacks inherent recurrent or convolutional structures, it needs additional information about the order of words. This is done by adding a positional encoding vector (typically generated using sine and cosine functions) to the word embeddings.
4. **Encoder**: A stack of N identical layers. Each layer contains a **multi-head self-attention sub-layer** and a **Feed-Forward Network (FFN) sub-layer**, followed by **Residual Connection** and **Layer Normalization**.
5. **Decoder**: Also a stack of N identical layers. In addition to the two sub-layers present in the encoder, it includes an extra **cross-attention sub-layer** that attends to the encoder's output. During training, the decoder uses **masked self-attention** to ensure predictions for a position can only depend on known outputs at previous positions.
6. **Feed-Forward Network (FFN)**: A simple fully connected network, typically consisting of two linear transformations with an activation function (e.g., ReLU) in between. It is applied identically and independently to each position.
7. **Residual Connection & Layer Normalization (Add & Norm)**: The output of each sub-layer is `LayerNorm(x + Sublayer(x))`. Residual connections mitigate the vanishing gradient problem in deep networks, and layer normalization stabilizes the training process.



训练流程：

1. **输入处理**：源序列和目标序列经过词嵌入层和位置编码，得到输入向量。
2. **前向传播**：
   - **编码器**：接收处理后的源序列，通过多层编码器进行计算，输出上下文相关的表示。
   - **解码器**：接收处理后的目标序列（训练时使用**右移**的真实目标序列，即“教师强制”），结合编码器输出，通过多层解码器进行计算。
3. **输出预测**：解码器最后层的输出通过一个线性层和 Softmax 函数，预测下一个词的概率分布。
4. **计算损失**：使用**交叉熵损失函数**，比较模型预测的概率分布与真实的下一个词（标签）。
5. **反向传播与优化**：计算梯度，并使用优化器（如 Adam）更新模型所有权重参数。整个过程**高度并行**，因为序列所有位置的计算可同时进行。

Train process:

1. **Input Processing**: The source and target sequences are passed through an embedding layer and positional encoding to obtain input vectors.
2. **Forward Pass**:
   - **Encoder**: Takes the processed source sequence, processes it through multiple encoder layers, and outputs context-aware representations.
   - **Decoder**: Takes the processed target sequence (during training, the **right-shifted** actual target sequence is used, known as "teacher forcing"), combined with the encoder's output, and processes it through multiple decoder layers.
3. **Output Prediction**: The output of the final decoder layer is passed through a linear layer and a Softmax function to predict a probability distribution over the vocabulary for the next word.
4. **Loss Calculation**: The **Cross-Entropy Loss** function is used to compare the model's predicted probability distribution against the true next word (the label).
5. **Backpropagation & Optimization**: Gradients are calculated, and an optimizer (e.g., Adam) updates all model parameters. The entire process is **highly parallelizable** because computations for all positions in the sequence can be performed simultaneously.



推理流程：

1. **编码**：将源序列（例如，要翻译的句子）输入编码器，得到其表示。
2. **自回归生成**：解码器以**自回归 (Autoregressive)** 方式逐个生成目标序列的单词。
   - 起始：输入一个特殊的开始符号 `<bos>` 给解码器。
   - 单步：解码器结合当前的输入序列（已生成的部分）和编码器的输出，预测下一个词的概率分布。
   - 采样：根据策略（如贪婪搜索、集束搜索、随机采样）从分布中选择一个词作为输出。
   - 追加：将生成的词追加到输入序列末尾，作为下一步的输入。
3. **循环**：重复步骤 2，直到解码器生成一个特殊的结束符号 `<eos>` 或达到预设的最大生成长度。
4. **特点**：推理是**顺序**的，无法像训练时那样并行生成整个序列，因为每一步的输入都依赖于上一步的输出。

Inference process:

1. **Encode**: Feed the source sequence (e.g., a sentence to translate) into the encoder to obtain its representation.
2. **Autoregressive Generation**: The decoder generates the target sequence **autoregressively**, one word at a time.
   - **Start**: Input a special beginning-of-sequence token `<bos>` to the decoder.
   - **Single Step**: The decoder, conditioned on the current input sequence (the partially generated sequence) and the encoder's output, predicts a probability distribution for the next word.
   - **Sampling**: A word is selected from this distribution based on a chosen strategy (e.g., greedy search, beam search, random sampling).
   - **Append**: The generated word is appended to the input sequence for the next step.
3. **Loop**: Repeat step 2 until the decoder generates a special end-of-sequence token `<eos>` or a predefined maximum length is reached.
4. **Key Characteristic**: Inference is **sequential**. Unlike during training, the entire output sequence cannot be generated in parallel because the input for each step depends on the output from the previous step.



# Components

## Layer Normalization



