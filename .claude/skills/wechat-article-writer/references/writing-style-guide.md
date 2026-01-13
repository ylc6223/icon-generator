# Writing Style Guide: 前端之外

> Language patterns, expression preferences, and style balance for technical content

---

## Style Ratio: 70% Professional / 30% Approachable

### The 70%: Professional & Rigorous

**Characteristics:**
- Engineering logic prevails
- Claims are verifiable
- Trade-offs are discussed openly
- Technical terminology is precise

**Application:**
```markdown
## RSC 的核心权衡

Server Components 解决了客户端数据获取的瀑布问题，
但引入了新的复杂度：

**收益：**
- 减少客户端 bundle 体积（组件代码留在服务端）
- 直接访问后端资源（无需中间层 API）
- 避免客户端重复请求（服务端并行获取）

**代价：**
- 增加服务端渲染负载
- 调试复杂度上升（跨边界追踪）
- 部署配置要求更高

**判断标准：**
如果你的应用数据密集且读多写少，收益明显。
如果主要是交互密集型 UI，收益有限。
```

### The 30%: Approachable & Relatable

**Characteristics:**
- Engineer-style dry humor
- Self-aware and not preachy
- Uses relatable scenarios
- Moderate use of colloquialisms

**Application:**
```markdown
## 说人话版总结

AI 工具能干什么？

✅ 帮你写重复代码（省 80% 时间）
✅ 即时查 API 文档（不用切浏览器）
✅ 补全上下文代码（智能提示 Pro 版）

不能干什么？

❌ 替你做架构决策
❌ 理解你的业务逻辑
❌ 修复性能瓶颈

简单说：它是助手，不是架构师。
用对了提效，用错了埋坑。
```

---

## Language Patterns

### Pattern 1: Problem → Analysis → Insight

**Structure:**
1. Present a common engineering problem
2. Analyze why it's hard or misunderstood
3. Provide a clear insight or mental model

**Example:**
```markdown
很多人觉得 Prompt Engineering 很玄学。

其实不是玄学，是因为没有工程化思维：

把 Prompt 当成函数设计：
- 输入是什么？（context + instruction）
- 输出是什么？（expected format）
- 边界条件是什么？（failure cases）

这么一想，就清楚多了。
```

### Pattern 2: Comparison with Engineering Analogy

**Structure:**
1. Introduce the technical concept
2. Draw parallel to a familiar engineering pattern
3. Highlight the key similarity

**Example:**
```markdown
LangChain 的 Chain 本质上就是 middleware 模式。

就像 Express 的中间件：
- 每个环节处理一部分逻辑
- 数据在环节间流转
- 可以组合、可以复用

理解了这个，Chain 的设计就不难懂了。
```

### Pattern 3: Honest Trade-off Discussion

**Structure:**
1. Present the technology/approach
2. List clear benefits
3. List clear costs
4. Provide decision criteria

**Example:**
```markdown
TypeScript 严格模式值得开吗？

**开启后的好处：**
- 更早发现类型错误
- 强制处理 null/undefined
- 重构更安全

**开启后的代价：**
- 初期迁移成本高
- 需要更多类型标注
- 团队学习曲线

**判断标准：**
如果是新项目或核心业务代码，建议开启。
如果是快速原型或一次性脚本，可以不开。

没有绝对的对错，看场景。
```

---

## Internet Slang Usage Rules

### Acceptable Usage: Restrained & Functional

**Allowed Contexts:**
- Section summaries ("说人话版总结")
- War story sharing ("踩坑实录")
- Warning callouts ("这里容易翻车")

**Allowed Phrases:**
```
✅ "说人话" (Plain language explanation)
✅ "踩坑" (Encountering pitfalls)
✅ "翻车" (Things going wrong)
✅ "避坑指南" (Pitfall avoidance guide)
✅ "真香定律" (Unexpectedly good after skepticism)
```

**Moderate Use:**
```
⚠️ "卷" (Competitive pressure) - only in self-aware context
⚠️ "打工人" (Worker bee) - sparingly, avoid self-pity
⚠️ "内卷" (Involution) - only when discussing industry trends critically
```

**Avoid:**
```
❌ High-frequency buzzwords (e.g., "yyds", "绝绝子")
❌ TikTok-style colloquialisms
❌ Emoji-speak replacing actual words
❌ Excessive internet slang stacking
```

### Examples

**✅ Acceptable:**
```markdown
## 踩坑实录

用 Cursor 做大型重构时，我翻车了。

AI 生成的代码看起来没问题，
但它理解不了我的迁移路径，
导致有些依赖关系改错了。

教训：大型重构还是得手动改，
AI 只能辅助小范围修改。
```

**❌ Too Much Slang:**
```markdown
## 绝绝子！Cursor yyds！

这个工具简直不要太好用！
用了之后真香，完全离不开！
打工人必备神器，效率直接起飞！
```

---

## Paragraph and Sentence Construction

### Short Paragraphs (2-4 Lines)

**Rationale:**
- Suits WeChat's fragmented reading pattern
- Emphasizes information density
- Improves mobile reading experience

**Good Example:**
```markdown
Prompt Engineering 的本质是什么？

不是堆砌指令，而是设计接口。

就像 API 设计，你要明确：
输入格式、输出格式、错误处理。

这么想，就清楚多了。
```

**Avoid Long Blocks:**
```markdown
❌ Prompt Engineering 是一个新兴领域，它涉及如何设计有效的提示词来引导 AI 模型生成期望的输出。这个过程需要理解模型的工作原理，同时也需要掌握如何清晰地表达需求。很多人在使用 AI 工具时遇到的问题，往往不是模型能力不足，而是提示词设计不当。通过系统化的提示工程方法，我们可以显著提升 AI 工具的实用性和可靠性。
```

### Lists Over Long Narratives

**Preference:** Use bullet points and numbered lists to break down information.

**Good Example:**
```markdown
AI 编码工具适合这些场景：

1. 重复性代码生成（CRUD、boilerplate）
2. API 文档即时查询（减少上下文切换）
3. 代码补全和重构建议（提升书写效率）

不适合这些场景：

1. 复杂架构设计（需要全局视角）
2. 性能优化诊断（需要深度分析）
3. 业务逻辑推理（需要领域知识）
```

### Rhetorical Questions for Engagement

**Purpose:** Engage reader's thinking process before presenting answer.

**Pattern:**
```markdown
为什么 AI 工具不能替代架构师？

因为架构设计需要三种能力：
1. 理解业务上下文
2. 预判未来演进方向
3. 权衡技术与资源

这三点，AI 目前都做不到。
```

---

## Technical Term Usage

### Precision Over Buzzwords

**Prefer:**
```
✅ "React Server Components"
✅ "Prompt Engineering"
✅ "Context Window"
✅ "Token Limit"
```

**Avoid:**
```
❌ "下一代前端框架" (without specifics)
❌ "AI 黑科技" (vague and hyped)
❌ "革命性技术" (overused buzzword)
```

### Explain Acronyms on First Use

**Good Practice:**
```markdown
RSC (React Server Components) 改变了什么？

传统的 SSR (Server-Side Rendering) 是渲染整个页面，
而 RSC 允许组件级别的服务端渲染。
```

### Version/API Specificity

**When discussing tools or libraries, cite specific versions:**

```markdown
✅ Cursor 0.41 版本新增了 inline diff 功能
✅ Next.js 14 的 App Router 稳定了
✅ GPT-4 Turbo 的 context window 是 128K

❌ Cursor 最新版很强大
❌ Next.js 的新功能很好用
❌ GPT-4 可以处理很长的输入
```

---

## Code Example Integration

### Minimal & Purposeful

**Principle:** Show only the code necessary to illustrate the point.

**Good Example:**
```markdown
## useAICompletion Hook 设计

这个 Hook 的目的：隔离 AI 请求逻辑，避免组件层直接依赖模型实现。

```typescript
export function useAICompletion() {
  const [completion, setCompletion] = useState('');

  async function complete(prompt: string) {
    // 这里封装了模型调用细节
    // 组件不需要知道用的是 GPT-4 还是 Claude
    const result = await aiService.complete(prompt);
    setCompletion(result);
  }

  return { completion, complete };
}
```

**关键点：**
组件只关心 interface，不关心实现。
换模型时，只需改 aiService，不动业务代码。
```

**Avoid:**
```typescript
❌ // Dumping entire 100-line component without explanation
❌ // Showing boilerplate setup code that doesn't illustrate the point
❌ // Code without comments or context
```

### Comment Standards

**Use comments to explain:**
- Design decisions ("为什么这么做")
- Trade-offs ("这个方案的权衡是...")
- Non-obvious logic ("这里看起来奇怪，但是...")

**Example:**
```typescript
// ⚠️ 注意：这里必须用 useRef 而不是 useState
// 因为我们不希望 interval 变化时触发重渲染
const intervalRef = useRef<NodeJS.Timeout>();

useEffect(() => {
  intervalRef.current = setInterval(() => {
    // Polling logic
  }, 1000);

  return () => clearInterval(intervalRef.current);
}, []);
```

---

## Transition Phrases

### Engineering-Focused Transitions

**Moving from problem to solution:**
```
- "从工程视角看，..."
- "本质上，这个问题是..."
- "换个角度理解，..."
```

**Introducing trade-offs:**
```
- "这个方案的权衡是..."
- "收益明显，但代价也不小："
- "没有完美方案，只有合适方案："
```

**Summarizing:**
```
- "说人话版总结："
- "如果记住三件事："
- "核心就一句话："
```

**Providing judgment:**
```
- "判断标准是..."
- "适合 X 场景，不适合 Y 场景："
- "这个决策取决于..."
```

---

## Voice and Perspective

### First-Person Usage

**Use sparingly for:**
- Personal experience sharing
- Opinion pieces
- War stories

**Example:**
```markdown
我在项目里用 Cursor 半年了，有几个观察：

1. 小范围重构，效率确实提升明显
2. 大型架构改动，还是得手动来
3. Code review 时间反而增加了（需要仔细检查 AI 生成的代码）

这不是工具的问题，而是使用场景的问题。
```

### Avoid First-Person When:
- Presenting technical facts
- Explaining concepts
- Documenting processes

**Prefer impersonal/general perspective:**
```markdown
✅ 使用 AI 工具时，需要注意...
✅ 这个模式解决了...
✅ 从工程角度看，...

❌ 我觉得你应该...
❌ 我建议大家...
```

---

## Quick Reference Checklist

Before finalizing content, verify:

**Style Balance:**
- [ ] ~70% engineering rigor, ~30% approachable tone
- [ ] No excessive internet slang or emoji-speak
- [ ] Short paragraphs (2-4 lines) throughout

**Language Quality:**
- [ ] Technical terms are precise and specific
- [ ] Code examples are minimal and purposeful
- [ ] Trade-offs are discussed, not just benefits
- [ ] No anxiety-inducing or hyperbolic language

**Structural Clarity:**
- [ ] Lists used over long narratives where appropriate
- [ ] Rhetorical questions engage before answering
- [ ] Transitions guide the reader smoothly
- [ ] Conclusion is practical, not generic inspiration
