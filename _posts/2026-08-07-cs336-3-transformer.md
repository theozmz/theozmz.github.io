---
title: Stanford CS336 2026 Spring - 3. Transformer
date: 2026-08-07
permalink: /posts/2026/08/cs336-3/
header:
  teaser: /posts/2026/08/cs336/banner.png
tags:
  - LLM
  - research
  - CS336
---


This Transformer blog post is mainly focused on the decoder-only architecture, which is broadly used in the industry. ⭐️ Really important! Recite this for interview! ⭐️

[![Static Badge](https://img.shields.io/badge/github-repo-blue?logo=github)](https://github.com/theozmz/Stanford-CS336-Spring-2026.git){:target="_blank"} 👉[super study guide](https://superstudy.guide/transformers-large-language-models/){:target="_blank"}👈


**Hand-typing, NO AI!!!**

Only show core functions, full code see [![Static Badge](https://img.shields.io/badge/github-repo-blue?logo=github)](https://github.com/theozmz/Stanford-CS336-Spring-2026/blob/main/assignment1-basics/cs336_basics/transformer.py){:target="_blank"}.


## Components

### Linear Module

The linear module is used to perform a linear transformation on the input.

$$ y=Wx=xW^T $$

initialization: $$\mathcal{N}\left(\mu = 0, \sigma^2 = \frac{2}{d_{\text{in}} + d_{\text{out}}}\right)$$ truncated at $$[-3\sigma, 3\sigma]$$ .

API: `nn.Linear(d_in, d_out)`

In Transformer, we apply linear transformation on 3 places:

* **SwiGLU**
* **Multi-head self-attention**: $$ W_Q, W_K, W_V $$ project inputs into query, key, and value matrices. $$ W_O $$ projects the multi-head outputs back into $$ d_{\text{model}} $$.
* **Final LM head**: Projects the $$ d_{\text{model}} $$ dimension representation of the last layer of the Transformer onto the $$ vocab\_size $$ to obtain the logits of the next token.

```python
class Linear(nn.Module):
    def __init__(self, d_in: int, d_out: int, device=None, dtype=None):
        super().__init__()
        self.weight = nn.Parameter(torch.empty(d_out, d_in, device=device, dtype=dtype))
        std = math.sqrt(2.0 / (d_in + d_out))
        torch.nn.init.trunc_normal_(self.weight, mean=0.0, std=std, a=-3 * std, b=3 * std)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return x @ self.weight.transpose(-1, -2)
```


### Embedding Module

This module maps integer token IDs into a vector space of dimension $$ d_{model} $$ .

Initialization: $$ \mathcal{N}\left(\mu = 0, \sigma^2 = 1\right) $$ truncated at $$[-3, 3]$$ .

API: `nn.Embedding(num_embeddings, embedding_dim)`

```python
class Embedding(nn.Module):
    def __init__(self, num_embeddings: int, embedding_dim: int, device=None, dtype=None):
        super().__init__()
        self.weight = nn.Parameter(torch.empty(num_embeddings, embedding_dim, device=device, dtype=dtype))
        torch.nn.init.trunc_normal_(self.weight, mean=0.0, std=1.0, a=-3.0, b=3.0)
        
    def forward(self, token_ids: torch.Tensor) -> torch.Tensor:
        return self.weight[token_ids]
```


### Root Mean Square Layer Normalization

* Post-norm
  * A residual connection around each of the two sub layers, followed by **layer normalization**.
* Pre-norm
  * A variety of work has found that moving layer normalization from the output of each sub-layer to the input of each sub-layer (with an additional layer normalization after the final Transformer block) improves Transformer training stability.
  * An intuition for pre-norm is that there is a clean “residual stream” without any normalization going from the input embeddings to the final output of the Transformer, which is purported to improve gradient flow.
  * An activation vector $$a\in \mathbb{R}^{d_{model}}$$ is computed for each input token $$x_i$$ .
  * $$ \text{RMSNorm}(a_i) = \frac{a_i}{\text{RMS}(a)} g_i $$, $$ \text{RMS}(a) = \sqrt{\frac{1}{d_{\text{model}}} \sum_{i=1}^{d_{\text{model}}} a_i^2 + \varepsilon} $$ .
  * Where $$g_i$$ is a learnable `gain` parameter (there are $$d_{model}$$ such parameters total), and $$\varepsilon$$ is a hyperparameter that is often fixed at 1e-5.
  * Initialization: $$1$$ .

```python
class RMSNorm(nn.Module):
    def __init__(self, d_model: int, eps: float = 1e-5, device=None, dtype=None):
        super().__init__()
        self.eps = eps
        self.weight = nn.Parameter(torch.ones(d_model, device=device, dtype=dtype))
        
    def forward(self, x: torch.Tensor) -> torch.Tensor:
        in_dtype = x.dtype
        x_float = x.to(torch.float32)
        rms = torch.sqrt(torch.mean(x_float ** 2, dim=-1, keepdim=True) + self.eps)
        result = (x_float / rms) * self.weight.to(torch.float32)
        return result.to(in_dtype)
```


### Position-Wise Feed-Forward Network

* Activation functions
  * $$ \text{ReLU}(x) = max(0, x) $$
  * $$ \text{SiLU, Swish}(x) = x \cdot \sigma(x)=\frac{x}{1 + e^{-x}} $$
* Gated Linear Units
  * $$ \text{GLU}(x, W_1, W_2) = \sigma(W_1 x) \odot W_2 x $$
* Feed-Forward Network
  * $$ \text{FFN}(x) = \text{SwiGLU}(x, W_1, W_2, W_3) = W_2(\text{SiLU}(W_1 x) \odot W_3 x) $$
    * where $$ x \in \mathbb{R}^{d_{\text{model}}},\ W_1, W_3 \in \mathbb{R}^{d_{\text{ff}} \times d_{\text{model}}},\ W_2 \in \mathbb{R}^{d_{\text{model}} \times d_{\text{ff}}}$$ , and canonically, $$ d_{\text{ff}} = \frac{8}{3}d_{\text{model}} $$.


```python
def silu(x: torch.Tensor) -> torch.Tensor:
    return x * torch.sigmoid(x)

class SwiGLU(nn.Module):
    def __init__(self, d_model: int, d_ff: int, device=None, dtype=None):
        super().__init__()
        self.w1 = Linear(d_model, d_ff, device=device, dtype=dtype)
        self.w2 = Linear(d_ff, d_model, device=device, dtype=dtype)
        self.w3 = Linear(d_model, d_ff, device=device, dtype=dtype)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.w2(silu(self.w1(x)) * self.w3(x))
```


### Relative Positional Embeddings

* Learned Embeddings
  * Pros: simple, good performance
  * Cons: This will not generalize if an input is longer than what was seen at training time. Doing so will require costly retraining. Aposition embedding may not be interpretable on its own.
* Sinusoid Positional Embeddings
  * $$ \text{PE}(x)_{2i-1} = \sin\left(\frac{x-1}{10000^{\frac{2i-2}{d_{\text{model}}}}}\right) \quad $$
  * $$ \text{PE}(x)_{2i} = \cos\left(\frac{x-1}{10000^{\frac{2i-2}{d_{\text{model}}}}}\right) $$
  * Pros: easy to extend, closer higher similarity
  * Cons: The magnitude of the position embeddings vary for different positions without any intuitive argument. In practice, sequences longer than those encountered during training do not perform as well.
* Rotary Position Embeddings (RoPE)
  * **only do on Q and K!**
  * For a given query token $$ q^{(i)} = W_q x^{(i)} \in \mathbb{R}^d $$ at token position $$ i $$,
    * apply a pairwise rotation matrix $$ R^i $$, giving us $$ q^{\prime(i)} = R^i q^{(i)} = R^i W_q x^{(i)} $$.
    * $$ R^i $$ will rotate **pairs of** embedding elements $$ q^{(i)}_{2k-1:2k} $$ as 2d vectors by the angle $$ \theta_{i,k} = \frac{i}{\Theta^{(2k-2)/d}} $$ for $$ k \in \{1, \dots, d/2\} $$ and some constant $$ \Theta $$ (usually 10000).
    * consider $$ R^i $$ to be a block-diagonal matrix of size $$ d \times d $$, with blocks $$ R^i_k $$ for $$ k \in \{1, \dots, \frac{d}{2}\} $$.
    * $$ R^i_k = \begin{pmatrix} \cos(\theta_{i,k}) & -\sin(\theta_{i,k}) \\ \sin(\theta_{i,k}) & \cos(\theta_{i,k}) \end{pmatrix} $$
    * $$ R^i = \begin{pmatrix} R^i_1 & 0 & 0 & \cdots & 0 \\ 0 & R^i_2 & 0 & \cdots & 0 \\ 0 & 0 & R^i_3 & \cdots & 0 \\ \vdots & \vdots & \vdots & \ddots & \vdots \\ 0 & 0 & 0 & \cdots & R^i_{d/2} \end{pmatrix} $$
  * 
    * $$ q_m k_n^T = x_m W_q R_{\theta, n-m} W_k^T x_n^T $$





### Softmax






## VTATV


## Shapes

